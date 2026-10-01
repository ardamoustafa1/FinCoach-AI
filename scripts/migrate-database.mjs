import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createDatabaseClient } from './database-client.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDir = path.join(rootDir, 'supabase', 'migrations');
const client = createDatabaseClient();

try {
  await client.connect();
  await client.query('select pg_advisory_lock(hashtext($1))', ['fincoach_schema_migrations']);
  await client.query('create schema if not exists private');
  await client.query(`
    create table if not exists private.schema_migrations (
      version text primary key,
      checksum text not null,
      applied_at timestamptz not null default now()
    )
  `);

  const files = (await readdir(migrationsDir))
    .filter((name) => /^\d+_.+\.sql$/.test(name))
    .sort();

  for (const file of files) {
    const sql = await readFile(path.join(migrationsDir, file), 'utf8');
    const checksum = createHash('sha256').update(sql).digest('hex');
    const existing = await client.query(
      'select checksum from private.schema_migrations where version = $1',
      [file],
    );

    if (existing.rowCount) {
      if (existing.rows[0].checksum !== checksum) {
        throw new Error(`Uygulanmış migration değiştirildi: ${file}`);
      }
      console.log(`ATLANDI ${file}`);
      continue;
    }

    await client.query('begin');
    try {
      await client.query("set local lock_timeout = '10s'");
      await client.query("set local statement_timeout = '120s'");
      await client.query(sql);
      await client.query(
        'insert into private.schema_migrations (version, checksum) values ($1, $2)',
        [file, checksum],
      );
      await client.query('commit');
      console.log(`UYGULANDI ${file}`);
    } catch (error) {
      await client.query('rollback');
      throw error;
    }
  }
} finally {
  try {
    await client.query('select pg_advisory_unlock(hashtext($1))', ['fincoach_schema_migrations']);
  } catch {
    // Bağlantı kurulamadıysa veya koptuysa kilit zaten oturumla birlikte bırakılır.
  }
  await client.end().catch(() => {});
}
