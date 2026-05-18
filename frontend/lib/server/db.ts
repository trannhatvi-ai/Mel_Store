import { Pool, type PoolClient, type QueryResultRow } from "pg"

declare global {
  // eslint-disable-next-line no-var
  var __feliPool: Pool | undefined
}

function normalizeDatabaseUrl(url: string) {
  return url.replace(/^postgresql\+psycopg:\/\//, "postgresql://").replace(/^postgres\+psycopg:\/\//, "postgres://")
}

export function getDatabaseUrl() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error("DATABASE_URL is not configured in frontend environment")
  return normalizeDatabaseUrl(raw)
}

function shouldUseSsl(url: string) {
  return /supabase\.com/i.test(url) || /sslmode=require/i.test(url)
}

export function getPool() {
  if (!globalThis.__feliPool) {
    const connectionString = getDatabaseUrl()
    globalThis.__feliPool = new Pool({
      connectionString,
      max: 5,
      ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
    })
  }
  return globalThis.__feliPool
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
  const result = await getPool().query<T>(text, params)
  return result.rows
}

export async function withClient<T>(fn: (client: PoolClient) => Promise<T>) {
  const client = await getPool().connect()
  try {
    return await fn(client)
  } finally {
    client.release()
  }
}
