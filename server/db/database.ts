import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'hemalink.sqlite');

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    dbInstance.exec('PRAGMA journal_mode = WAL;');
  }
  return dbInstance;
}

export function initDatabase(): void {
  const db = getDatabase();
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
}

export function queryAll<T = any>(sql: string, params: any[] = []): T[] {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  return stmt.all(...params) as T[];
}

export function queryOne<T = any>(sql: string, params: any[] = []): T | undefined {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  const rows = stmt.all(...params) as T[];
  return rows.length > 0 ? rows[0] : undefined;
}

export function execute(sql: string, params: any[] = []): { changes: number | bigint; lastInsertRowid: number | bigint } {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

let transactionDepth = 0;

export function transaction<T>(fn: () => T): T {
  const db = getDatabase();
  const savepoint = `sp_${transactionDepth}`;
  if (transactionDepth === 0) {
    db.exec('BEGIN TRANSACTION;');
  } else {
    db.exec(`SAVEPOINT ${savepoint};`);
  }
  transactionDepth++;

  try {
    const result = fn();
    transactionDepth--;
    if (transactionDepth === 0) {
      db.exec('COMMIT;');
    } else {
      db.exec(`RELEASE SAVEPOINT ${savepoint};`);
    }
    return result;
  } catch (error) {
    transactionDepth--;
    if (transactionDepth === 0) {
      try { db.exec('ROLLBACK;'); } catch (_) {}
    } else {
      try { db.exec(`ROLLBACK TO SAVEPOINT ${savepoint};`); } catch (_) {}
    }
    throw error;
  }
}

