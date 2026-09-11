import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = Boolean(process.env.VERCEL);
const defaultDbPath = isVercel
  ? path.join('/tmp', 'bloodbridge.sqlite')
  : path.join(__dirname, 'hemalink.sqlite');

const DB_PATH = process.env.DB_PATH || defaultDbPath;

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    // If in Vercel serverless and /tmp DB does not exist, copy existing pre-seeded sqlite file if available
    if (isVercel && !fs.existsSync(DB_PATH)) {
      const candidates = [
        path.join(__dirname, 'hemalink.sqlite'),
        path.join(process.cwd(), 'server', 'db', 'hemalink.sqlite'),
      ];
      for (const src of candidates) {
        if (fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, DB_PATH);
            break;
          } catch (e) {
            console.warn('[Vercel SQLite] Copy warning:', e);
          }
        }
      }
    }

    dbInstance = new DatabaseSync(DB_PATH);
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    dbInstance.exec('PRAGMA journal_mode = WAL;');
  }
  return dbInstance;
}

export function initDatabase(): void {
  const db = getDatabase();
  const schemaCandidates = [
    path.join(__dirname, 'schema.sql'),
    path.join(process.cwd(), 'server', 'db', 'schema.sql'),
    path.join(process.cwd(), 'db', 'schema.sql'),
  ];
  let schemaSql = '';
  for (const p of schemaCandidates) {
    if (fs.existsSync(p)) {
      schemaSql = fs.readFileSync(p, 'utf8');
      break;
    }
  }
  if (schemaSql) {
    db.exec(schemaSql);
  }
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

