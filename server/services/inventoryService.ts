// HemaLink Blood Inventory Service
// Tracks ABO/Rh stock levels, reserves, expiry thresholds, and unit check-ins

import { execute, queryAll, queryOne } from '../db/database.js';
import { AuditService } from './auditService.js';

export interface InventoryItem {
  id: string;
  blood_bank_id: string;
  blood_bank_name?: string;
  blood_group: string;
  component: string;
  available_units: number;
  reserved_units: number;
  min_threshold_units: number;
  expiring_units_48h: number;
  status: 'normal' | 'low' | 'critical';
  last_updated_at: string;
}

export class InventoryService {
  /**
   * Retrieves inventory levels with computed operational status
   */
  static getInventory(bloodBankId?: string): InventoryItem[] {
    let sql = `
      SELECT i.*, b.name as blood_bank_name
      FROM inventories i
      JOIN blood_banks b ON i.blood_bank_id = b.id
    `;
    const params: any[] = [];
    if (bloodBankId) {
      sql += ` WHERE i.blood_bank_id = ?`;
      params.push(bloodBankId);
    }
    sql += ` ORDER BY i.blood_group, i.component`;

    const rows = queryAll<any>(sql, params);

    return rows.map((r) => {
      let status: 'normal' | 'low' | 'critical' = 'normal';
      if (r.available_units <= Math.floor(r.min_threshold_units * 0.35)) {
        status = 'critical';
      } else if (r.available_units < r.min_threshold_units) {
        status = 'low';
      }

      return {
        ...r,
        status,
      };
    });
  }

  /**
   * Adjusts inventory upon donation completion or clinical release
   */
  static adjustUnits(
    bloodBankId: string,
    bloodGroup: string,
    component: string,
    unitsDelta: number,
    userId?: string
  ): void {
    const existing = queryOne<InventoryItem>(
      `SELECT * FROM inventories WHERE blood_bank_id = ? AND blood_group = ? AND component = ?`,
      [bloodBankId, bloodGroup, component]
    );

    if (existing) {
      const newAvailable = Math.max(0, existing.available_units + unitsDelta);
      execute(
        `UPDATE inventories 
         SET available_units = ?, last_updated_at = datetime('now')
         WHERE id = ?`,
        [newAvailable, existing.id]
      );
    } else {
      const newId = 'inv_' + Math.random().toString(36).substring(2, 11);
      execute(
        `INSERT INTO inventories (
          id, blood_bank_id, blood_group, component, available_units, reserved_units, min_threshold_units
        ) VALUES (?, ?, ?, ?, ?, 0, 10)`,
        [newId, bloodBankId, bloodGroup, component, Math.max(0, unitsDelta)]
      );
    }

    AuditService.log({
      user_id: userId,
      action: 'INVENTORY_ADJUSTED',
      entity_type: 'inventory',
      entity_id: `${bloodBankId}_${bloodGroup}`,
      details: `${unitsDelta > 0 ? '+' : ''}${unitsDelta} units of ${bloodGroup} ${component}`,
    });
  }

  /**
   * Returns aggregated stock summary for dashboard cards
   */
  static getDashboardSummary(bloodBankId?: string) {
    const items = this.getInventory(bloodBankId);
    let totalAvailable = 0;
    let criticalCount = 0;
    let lowCount = 0;
    let expiringUnits = 0;

    for (const item of items) {
      totalAvailable += item.available_units;
      expiringUnits += item.expiring_units_48h;
      if (item.status === 'critical') criticalCount++;
      else if (item.status === 'low') lowCount++;
    }

    return {
      totalAvailableUnits: totalAvailable,
      criticalShortageGroups: criticalCount,
      lowStockGroups: lowCount,
      expiringUnits48h: expiringUnits,
    };
  }
}
