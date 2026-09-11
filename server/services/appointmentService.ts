// HemaLink Appointment & Receiving Capacity Coordination Service
// Enforces hourly donor intake limits, slot allocation, and donation intake check-in

import { execute, queryAll, queryOne, transaction } from '../db/database.js';
import { AuditService } from './auditService.js';
import { InventoryService } from './inventoryService.js';

export interface SlotAvailability {
  slotHour: string; // e.g. "14:00"
  capacity: number;
  booked: number;
  available: number;
  isFull: boolean;
}

export interface AppointmentRecord {
  id: string;
  shortage_request_id: string;
  donor_id: string;
  donor_name?: string;
  donor_blood_group?: string;
  blood_bank_id: string;
  blood_bank_name?: string;
  scheduled_time: string;
  slot_hour: string;
  status: 'confirmed' | 'arrived' | 'completed' | 'cancelled' | 'no_show';
  arrival_time: string | null;
  completed_at: string | null;
  created_at: string;
}

export class AppointmentService {
  /**
   * Retrieves hourly slot utilization to prevent facility bottlenecks
   */
  static getSlotCapacity(bloodBankId: string, dateStr: string): SlotAvailability[] {
    const bank = queryOne<{ hourly_capacity: number }>(
      'SELECT hourly_capacity FROM blood_banks WHERE id = ?',
      [bloodBankId]
    );
    const maxCapacity = bank ? bank.hourly_capacity : 4;

    const bookedCounts = queryAll<{ slot_hour: string; count: number }>(
      `SELECT slot_hour, COUNT(*) as count 
       FROM appointments 
       WHERE blood_bank_id = ? 
         AND scheduled_time LIKE ? 
         AND status IN ('confirmed', 'arrived')
       GROUP BY slot_hour`,
      [bloodBankId, `${dateStr}%`]
    );

    const bookedMap = new Map<string, number>();
    bookedCounts.forEach((b) => bookedMap.set(b.slot_hour, b.count));

    const standardHours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
    return standardHours.map((slot) => {
      const booked = bookedMap.get(slot) || 0;
      const available = Math.max(0, maxCapacity - booked);
      return {
        slotHour: slot,
        capacity: maxCapacity,
        booked,
        available,
        isFull: available === 0,
      };
    });
  }

  /**
   * Books a coordinated appointment slot
   */
  static bookAppointment(params: {
    shortage_request_id: string;
    donor_id: string;
    blood_bank_id: string;
    scheduled_time: string;
    slot_hour: string;
  }): AppointmentRecord {
    return transaction(() => {
      // Check existing capacity
      const dateStr = params.scheduled_time.split('T')[0];
      const slots = this.getSlotCapacity(params.blood_bank_id, dateStr);
      const targetSlot = slots.find((s) => s.slotHour === params.slot_hour);

      if (targetSlot && targetSlot.isFull) {
        throw new Error(`Slot ${params.slot_hour} is at maximum intake capacity (${targetSlot.capacity} donors). Please select an alternate slot.`);
      }

      const id = 'apt_' + Math.random().toString(36).substring(2, 11);

      execute(
        `INSERT INTO appointments (
          id, shortage_request_id, donor_id, blood_bank_id, scheduled_time, slot_hour, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'confirmed', datetime('now'))`,
        [
          id,
          params.shortage_request_id,
          params.donor_id,
          params.blood_bank_id,
          params.scheduled_time,
          params.slot_hour,
        ]
      );

      AuditService.log({
        action: 'APPOINTMENT_BOOKED',
        entity_type: 'appointment',
        entity_id: id,
        details: `Donor ${params.donor_id} scheduled for ${params.scheduled_time} at blood bank ${params.blood_bank_id}`,
      });

      return {
        id,
        shortage_request_id: params.shortage_request_id,
        donor_id: params.donor_id,
        blood_bank_id: params.blood_bank_id,
        scheduled_time: params.scheduled_time,
        slot_hour: params.slot_hour,
        status: 'confirmed',
        arrival_time: null,
        completed_at: null,
        created_at: new Date().toISOString(),
      };
    });
  }

  /**
   * Records donor arrival at the blood bank
   */
  static markArrived(appointmentId: string, staffUserId?: string): void {
    execute(
      `UPDATE appointments 
       SET status = 'arrived', arrival_time = datetime('now')
       WHERE id = ?`,
      [appointmentId]
    );

    AuditService.log({
      user_id: staffUserId,
      action: 'DONOR_ARRIVED',
      entity_type: 'appointment',
      entity_id: appointmentId,
      details: `Donor arrival checked in for appointment ${appointmentId}`,
    });
  }

  /**
   * Completes the clinical donation intake:
   * - Creates donation record
   * - Increments inventory
   * - Updates shortage collected units
   * - Resets donor donation date to today
   */
  static completeDonation(appointmentId: string, staffUserId?: string): void {
    transaction(() => {
      const apt = queryOne<{
        id: string;
        donor_id: string;
        blood_bank_id: string;
        shortage_request_id: string;
      }>('SELECT * FROM appointments WHERE id = ?', [appointmentId]);

      if (!apt) throw new Error('Appointment not found');

      const donor = queryOne<{ blood_group: string }>(
        'SELECT blood_group FROM donor_profiles WHERE id = ?',
        [apt.donor_id]
      );
      const shortage = queryOne<{
        component: string;
        units_required: number;
        units_collected: number;
      }>('SELECT * FROM shortage_requests WHERE id = ?', [apt.shortage_request_id]);

      const bloodGroup = donor ? donor.blood_group : 'O+';
      const component = shortage ? shortage.component : 'Whole Blood';

      // Mark appointment completed
      execute(
        `UPDATE appointments 
         SET status = 'completed', completed_at = datetime('now')
         WHERE id = ?`,
        [appointmentId]
      );

      // Create donation record
      const donationId = 'don_' + Math.random().toString(36).substring(2, 11);
      const todayDate = new Date().toISOString().split('T')[0];

      execute(
        `INSERT INTO donations (
          id, donor_id, blood_bank_id, appointment_id, shortage_request_id,
          blood_group, component, units, donation_date, verified_by_user_id, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 'completed')`,
        [
          donationId,
          apt.donor_id,
          apt.blood_bank_id,
          appointmentId,
          apt.shortage_request_id,
          bloodGroup,
          component,
          todayDate,
          staffUserId || 'staff_1',
        ]
      );

      // Update donor last_donation_date to today
      execute(
        `UPDATE donor_profiles 
         SET last_donation_date = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [todayDate, apt.donor_id]
      );

      // Add unit to inventory
      InventoryService.adjustUnits(apt.blood_bank_id, bloodGroup, component, 1, staffUserId);

      // Increment collected units on shortage
      const newCollected = (shortage ? shortage.units_collected : 0) + 1;
      const isFulfilled = shortage && newCollected >= shortage.units_required;

      execute(
        `UPDATE shortage_requests 
         SET units_collected = ?,
             status = CASE WHEN ? THEN 'fulfilled' ELSE status END,
             outreach_status = CASE WHEN ? THEN 'completed' ELSE outreach_status END,
             updated_at = datetime('now')
         WHERE id = ?`,
        [newCollected, isFulfilled ? 1 : 0, isFulfilled ? 1 : 0, apt.shortage_request_id]
      );

      AuditService.log({
        user_id: staffUserId,
        action: 'DONATION_COMPLETED',
        entity_type: 'donation',
        entity_id: donationId,
        details: `1 unit ${bloodGroup} ${component} donated and verified. Inventory updated.`,
      });
    });
  }
}
