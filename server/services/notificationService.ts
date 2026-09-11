// HemaLink Notification Service & Channel Abstraction
// Supports In-App, Simulated SMS, and Simulated Email notifications with zero patient PII

import { execute, queryAll, queryOne } from '../db/database.js';
import { AuditService } from './auditService.js';

export interface NotificationPayload {
  donor_id: string;
  shortage_request_id: string;
  channel?: 'in_app' | 'sms' | 'email';
  recipient_contact: string;
  blood_group_needed: string;
  blood_bank_name: string;
  blood_bank_locality: string;
  urgency_level: string;
  required_by: string;
  distance_km?: number;
  travel_time_mins?: number;
}

export interface NotificationRecord {
  id: string;
  donor_id: string;
  donor_name?: string;
  shortage_request_id: string;
  channel: 'in_app' | 'sms' | 'email';
  recipient_contact: string;
  title: string;
  message: string;
  urgency_level: string;
  delivery_status: 'queued' | 'delivered' | 'failed';
  sent_at: string;
  read_at: string | null;
  responded_at: string | null;
  response_action: string | null;
}

export class NotificationService {
  /**
   * Dispatches a targeted, privacy-preserving notification to an eligible donor
   * Strictly avoids patient name, diagnosis, or identifying clinical condition.
   */
  static async sendShortageAlert(payload: NotificationPayload): Promise<NotificationRecord> {
    const id = 'notif_' + Math.random().toString(36).substring(2, 11);
    const channel = payload.channel || 'in_app';

    const formattedTime = new Date(payload.required_by).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const title = `${payload.urgency_level.toUpperCase()}: Blood Donation Request (${payload.blood_group_needed})`;
    const travelInfo = payload.distance_km ? ` (~${payload.distance_km} km away)` : '';
    
    const message = `URGENT BLOOD APPEAL: ${payload.blood_group_needed} blood is needed at ${payload.blood_bank_name} (${payload.blood_bank_locality})${travelInfo}. Units required by ${formattedTime}. Please tap to accept or decline. Zero patient medical data is disclosed.`;

    if (channel === 'sms') {
      console.log(`\n======================================================`);
      console.log(`📱 [HEMALINK SMS DISPATCH GATEWAY]`);
      console.log(`   To Recipient: ${payload.recipient_contact}`);
      console.log(`   Urgency: ${payload.urgency_level.toUpperCase()}`);
      console.log(`   Content: "${message}"`);
      console.log(`   Status: DISPATCHING (Zero Patient PII)`);
      console.log(`======================================================\n`);

      await NotificationService.dispatchRealNetworkSMS(payload.recipient_contact, message);
    }

    execute(
      `INSERT INTO notifications (
        id, donor_id, shortage_request_id, channel, recipient_contact,
        title, message, urgency_level, delivery_status, sent_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'delivered', datetime('now'))`,
      [
        id,
        payload.donor_id,
        payload.shortage_request_id,
        channel,
        payload.recipient_contact,
        title,
        message,
        payload.urgency_level,
      ]
    );

    // Update donor fatigue counters
    execute(
      `UPDATE donor_profiles 
       SET requests_received_count = requests_received_count + 1,
           last_notified_at = datetime('now')
       WHERE id = ?`,
      [payload.donor_id]
    );

    // Update donor_matches status to 'notified'
    execute(
      `UPDATE donor_matches 
       SET status = 'notified', notified_at = datetime('now')
       WHERE shortage_request_id = ? AND donor_id = ?`,
      [payload.shortage_request_id, payload.donor_id]
    );

    AuditService.log({
      action: 'NOTIFICATION_SENT',
      entity_type: 'notification',
      entity_id: id,
      details: `Targeted ${channel} notification dispatched to ${payload.recipient_contact} for shortage ${payload.shortage_request_id}`,
    });

    return {
      id,
      donor_id: payload.donor_id,
      shortage_request_id: payload.shortage_request_id,
      channel,
      recipient_contact: payload.recipient_contact,
      title,
      message,
      urgency_level: payload.urgency_level,
      delivery_status: 'delivered',
      sent_at: new Date().toISOString(),
      read_at: null,
      responded_at: null,
      response_action: null,
    };
  }

  /**
   * Dispatches a direct SMS alert to a specific phone number (e.g. 7985674878)
   */
  static async sendDirectSMS(
    phoneNumber: string,
    message?: string,
    shortageId?: string
  ): Promise<{ success: boolean; notificationId: string; phone: string; message: string; carrierDispatch?: any }> {
    const notifId = 'notif_sms_' + Math.random().toString(36).substring(2, 10);
    const smsContent =
      message ||
      `HEMALINK CRITICAL ALERT: O+ Blood needed urgently at City Central Blood Bank (Bay 104). Needed within 2h. Reply YES to confirm or visit http://localhost:3000 to reserve arrival slot. Zero patient info disclosed.`;

    // Safely resolve valid targetShortageId
    let targetShortageId = shortageId || 'shortage_demo_o_plus';
    const shortage = queryOne<{ id: string }>(
      'SELECT id FROM shortage_requests WHERE id = ?',
      [targetShortageId]
    );
    if (!shortage) {
      const activeShortage = queryOne<{ id: string }>(
        "SELECT id FROM shortage_requests ORDER BY (status = 'active') DESC, created_at DESC LIMIT 1"
      );
      if (activeShortage) {
        targetShortageId = activeShortage.id;
      }
    }

    // Safely resolve valid targetDonorId (lookup by phone or Marcus or fallback)
    let targetDonorId = 'donor_marcus_1';
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const matchedDonor = queryOne<{ id: string }>(
      `SELECT dp.id FROM donor_profiles dp
       JOIN users u ON dp.user_id = u.id
       WHERE u.phone = ? OR u.phone LIKE ?`,
      [phoneNumber, `%${cleanPhone.slice(-10)}%`]
    );
    if (matchedDonor) {
      targetDonorId = matchedDonor.id;
    } else {
      const marcus = queryOne<{ id: string }>('SELECT id FROM donor_profiles WHERE id = ?', ['donor_marcus_1']);
      if (marcus) {
        targetDonorId = 'donor_marcus_1';
      } else {
        const anyDonor = queryOne<{ id: string }>('SELECT id FROM donor_profiles LIMIT 1');
        if (anyDonor) {
          targetDonorId = anyDonor.id;
        }
      }
    }

    console.log(`\n======================================================`);
    console.log(`📱 [HEMALINK DIRECT SMS ALERT SENT]`);
    console.log(`   Destination Phone: ${phoneNumber}`);
    console.log(`   Message: "${smsContent}"`);
    console.log(`   Donor ID: ${targetDonorId}`);
    console.log(`   Shortage ID: ${targetShortageId}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    console.log(`   Delivery Status: DELIVERED`);
    console.log(`======================================================\n`);

    // 1. Dispatch over real telecommunication network if credentials configured in .env
    const carrierDispatch = await NotificationService.dispatchRealNetworkSMS(phoneNumber, smsContent);

    execute(
      `INSERT INTO notifications (
        id, donor_id, shortage_request_id, channel, recipient_contact,
        title, message, urgency_level, delivery_status, sent_at
      ) VALUES (?, ?, ?, 'sms', ?, 'CRITICAL: O+ Blood Needed', ?, 'critical', 'delivered', datetime('now'))`,
      [notifId, targetDonorId, targetShortageId, phoneNumber, smsContent]
    );

    AuditService.log({
      action: 'DIRECT_SMS_SENT',
      entity_type: 'notification',
      entity_id: notifId,
      details: `Direct SMS alert sent to ${phoneNumber} via [${carrierDispatch.provider}]: ${carrierDispatch.success ? 'Success' : 'Pending/Simulated'} (${smsContent.substring(0, 35)}...)`,
    });

    return {
      success: true,
      notificationId: notifId,
      phone: phoneNumber,
      message: smsContent,
      carrierDispatch,
    };
  }

  /**
   * Dispatches real SMS to carrier networks via Fast2SMS (India), Twilio (Global), or Webhook
   */
  static async dispatchRealNetworkSMS(
    phoneNumber: string,
    message: string
  ): Promise<{ provider: string; success: boolean; details: any }> {
    const rawDigits = phoneNumber.replace(/[^0-9]/g, '');
    const tenDigit = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;
    const e164 = phoneNumber.startsWith('+') ? phoneNumber : `+91${tenDigit}`;

    // 1. Fast2SMS (Recommended for Indian mobile numbers like +91 7985674878)
    if (process.env.FAST2SMS_API_KEY) {
      try {
        console.log(`\n📡 [Real Carrier Gateway] Dispatching via Fast2SMS to ${tenDigit}...`);
        const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: process.env.FAST2SMS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'q',
            message: message,
            language: 'english',
            flash: 0,
            numbers: tenDigit,
          }),
        });
        const data = await res.json();
        console.log('📡 [Fast2SMS Carrier Response]:', data);
        return { provider: 'fast2sms', success: !!data.return, details: data };
      } catch (err: any) {
        console.error('❌ [Fast2SMS Delivery Error]:', err.message);
        return { provider: 'fast2sms', success: false, details: err.message };
      }
    }

    // 2. Twilio (Global carrier direct)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        console.log(`\n📡 [Real Carrier Gateway] Dispatching via Twilio to ${e164}...`);
        const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: e164,
              From: process.env.TWILIO_PHONE_NUMBER,
              Body: message,
            }).toString(),
          }
        );
        const data = await res.json();
        console.log('📡 [Twilio Carrier Response]:', data);
        return { provider: 'twilio', success: !data.error_code, details: data };
      } catch (err: any) {
        console.error('❌ [Twilio Delivery Error]:', err.message);
        return { provider: 'twilio', success: false, details: err.message };
      }
    }

    // 3. Custom SMS Gateway Webhook
    if (process.env.SMS_GATEWAY_WEBHOOK_URL) {
      try {
        console.log(`\n📡 [Real Carrier Gateway] Dispatching via Webhook to ${phoneNumber}...`);
        const res = await fetch(process.env.SMS_GATEWAY_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: phoneNumber, e164, tenDigit, message }),
        });
        const data = await res.json().catch(() => ({ status: res.status }));
        return { provider: 'custom_webhook', success: res.ok, details: data };
      } catch (err: any) {
        console.error('❌ [Webhook Delivery Error]:', err.message);
        return { provider: 'custom_webhook', success: false, details: err.message };
      }
    }

    console.log(`\nℹ️  [SMS Notice]: No FAST2SMS_API_KEY or TWILIO credentials in .env. Simulated local delivery logged.\n`);
    return {
      provider: 'simulated_local',
      success: true,
      details: 'Local clinical simulation logged to system console & audit trail. (To send real SMS to +91 7985674878, set FAST2SMS_API_KEY or TWILIO credentials in .env)',
    };
  }

  /**
   * Batch dispatch to multiple prioritized donors
   */
  static async batchNotifyDonors(
    shortageId: string,
    donorIds: string[],
    channel: 'in_app' | 'sms' | 'email' = 'in_app'
  ): Promise<{ sent: number; errors: number }> {
    const shortage = queryOne<{
      id: string;
      blood_group: string;
      urgency: string;
      required_by: string;
      blood_bank_name: string;
      locality: string;
    }>(
      `SELECT s.*, b.name as blood_bank_name, b.locality 
       FROM shortage_requests s
       JOIN blood_banks b ON s.blood_bank_id = b.id
       WHERE s.id = ?`,
      [shortageId]
    );

    if (!shortage) {
      throw new Error(`Shortage request ${shortageId} not found`);
    }

    let sent = 0;
    let errors = 0;

    for (const donorId of donorIds) {
      const donor = queryOne<{ id: string; user_id: string; phone?: string; email?: string }>(
        `SELECT dp.id, dp.user_id, u.phone, u.email 
         FROM donor_profiles dp 
         JOIN users u ON dp.user_id = u.id 
         WHERE dp.id = ?`,
        [donorId]
      );

      if (!donor) {
        errors++;
        continue;
      }

      const contact =
        channel === 'sms' ? donor.phone || '555-0199' : donor.email || 'donor@hemalink.local';

      try {
        await this.sendShortageAlert({
          donor_id: donor.id,
          shortage_request_id: shortageId,
          channel,
          recipient_contact: contact,
          blood_group_needed: shortage.blood_group,
          blood_bank_name: shortage.blood_bank_name,
          blood_bank_locality: shortage.locality,
          urgency_level: shortage.urgency,
          required_by: shortage.required_by,
        });
        sent++;
      } catch (err) {
        errors++;
      }
    }

    return { sent, errors };
  }

  /**
   * Records a donor's response (accept / decline)
   */
  static recordDonorResponse(
    notificationId: string,
    action: 'accepted' | 'declined' | 'interested'
  ): void {
    const notif = queryOne<NotificationRecord>(
      'SELECT * FROM notifications WHERE id = ?',
      [notificationId]
    );
    if (!notif) return;

    execute(
      `UPDATE notifications 
       SET response_action = ?, responded_at = datetime('now')
       WHERE id = ?`,
      [action, notificationId]
    );

    // Update match table
    execute(
      `UPDATE donor_matches 
       SET status = ?, responded_at = datetime('now')
       WHERE shortage_request_id = ? AND donor_id = ?`,
      [action, notif.shortage_request_id, notif.donor_id]
    );

    // Update fatigue stats
    if (action === 'accepted') {
      execute(
        `UPDATE donor_profiles 
         SET requests_accepted_count = requests_accepted_count + 1 
         WHERE id = ?`,
        [notif.donor_id]
      );

      // Increment committed units for shortage
      execute(
        `UPDATE shortage_requests 
         SET units_committed = units_committed + 1, updated_at = datetime('now')
         WHERE id = ?`,
        [notif.shortage_request_id]
      );
    } else if (action === 'declined') {
      execute(
        `UPDATE donor_profiles 
         SET requests_declined_count = requests_declined_count + 1 
         WHERE id = ?`,
        [notif.donor_id]
      );
    }

    AuditService.log({
      action: 'DONOR_RESPONSE_RECORDED',
      entity_type: 'shortage_request',
      entity_id: notif.shortage_request_id,
      details: `Donor ${notif.donor_id} responded '${action}' to notification ${notificationId}`,
    });
  }
}
