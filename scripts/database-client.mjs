import pg from 'pg';

export function requireDatabaseUrl() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL tanımlı değil. Komutu --env-file=server/.env ile çalıştırın.');
  }
  return connectionString;
}

export function createDatabaseClient() {
  return new pg.Client({
    connectionString: requireDatabaseUrl(),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15_000,
    statement_timeout: 120_000,
    application_name: 'fincoach_schema_manager',
  });
}
