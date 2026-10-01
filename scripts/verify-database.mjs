import { createDatabaseClient } from './database-client.mjs';

const expectedTables = [
  'accounts', 'ai_conversations', 'ai_messages', 'app_events', 'assets',
  'audit_logs', 'budget_limits', 'budgets', 'categories', 'consent_records',
  'debts', 'financial_institutions', 'goal_contributions', 'goals',
  'integration_connections', 'notifications', 'profiles', 'recurring_rules',
  'subscriptions', 'tags', 'transaction_splits', 'transaction_tags', 'transactions',
  'user_preferences',
];

const client = createDatabaseClient();

try {
  await client.connect();
  const tables = await client.query(`
    select c.relname as table_name, c.relrowsecurity as rls_enabled
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
    order by c.relname
  `);
  const found = new Map(tables.rows.map((row) => [row.table_name, row.rls_enabled]));
  const missing = expectedTables.filter((name) => !found.has(name));
  const withoutRls = expectedTables.filter((name) => found.get(name) !== true);

  const policies = await client.query(`
    select tablename, count(*)::int as count
    from pg_policies
    where schemaname = 'public'
    group by tablename
    order by tablename
  `);
  const indexes = await client.query(`
    select count(*)::int as count
    from pg_indexes
    where schemaname = 'public'
  `);
  const migrations = await client.query(`
    select version, applied_at
    from private.schema_migrations
    order by version
  `);

  if (missing.length || withoutRls.length) {
    throw new Error(JSON.stringify({ missing, withoutRls }));
  }

  console.log(JSON.stringify({
    ok: true,
    tables: expectedTables.length,
    policies: policies.rows.reduce((sum, row) => sum + row.count, 0),
    indexes: indexes.rows[0].count,
    migrations: migrations.rows,
  }, null, 2));
} finally {
  await client.end().catch(() => {});
}
