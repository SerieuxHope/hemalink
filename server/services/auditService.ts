// HemaLink Audit Logging Service
// Immutable clinical audit trail for HealthTech compliance readiness

import { execute, queryAll, queryOne } from '../db/database.js';

export interface AuditLogEntry {
  user_id?: string;
  user_name?: string;
  user_role?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: string;
  ip_address?: string;
}

export class AuditService {
  static log(entry: AuditLogEntry): void {
    const id = 'aud_' + Math.random().toString(36).substring(2, 12);
    try {
      let validUserId: string | null = null;
      if (entry.user_id && entry.user_id !== 'system') {
        const userExists = queryOne<{ id: string }>('SELECT id FROM users WHERE id = ?', [entry.user_id]);
        if (userExists) {
          validUserId = entry.user_id;
        }
      }

      execute(
        `INSERT INTO audit_logs (
          id, user_id, user_name, user_role, action, entity_type, entity_id, details, ip_address, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          id,
          validUserId,
          entry.user_name || (validUserId ? 'Staff User' : 'System Engine'),
          entry.user_role || (validUserId ? 'staff' : 'system'),
          entry.action,
          entry.entity_type,
          entry.entity_id,
          entry.details || '',
          entry.ip_address || '127.0.0.1',
        ]
      );
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  }

  static getRecentLogs(limit: number = 50, filterType?: string) {
    if (filterType) {
      return queryAll(
        `SELECT * FROM audit_logs WHERE entity_type = ? ORDER BY timestamp DESC LIMIT ?`,
        [filterType, limit]
      );
    }
    return queryAll(`SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?`, [limit]);
  }
}
