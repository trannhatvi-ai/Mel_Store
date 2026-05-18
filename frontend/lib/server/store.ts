import { createHash, randomUUID } from "crypto"
import type { PoolClient, QueryResultRow } from "pg"

import { products as seedProducts } from "../data"
import { query, withClient, getDatabaseUrl } from "./db"

type LocalizedText = Record<string, string>
type LocalizedList = Record<string, string[]>

export type ProductPayload = {
  id?: string | null
  slug: string
  name: LocalizedText
  category: string
  price: number
  price_per_day?: boolean
  pricePerDay?: boolean
  image: string
  gallery?: string[]
  description: LocalizedText
  details?: LocalizedList
  available?: boolean
  trending?: boolean
  discount?: number
}

export type OrderItemPayload = {
  product_id: string
  qty: number
  price: number
  days?: number | null
}

export type CreateOrderPayload = {
  customer: string
  email: string
  phone: string
  total: number
  deposit: number
  event_date: string
  notes?: string | null
  items: OrderItemPayload[]
}

export type AISettingsPayload = {
  chat_provider?: string
  chat_model?: string
  embedding_provider?: string
  embedding_model?: string
  google_client_id?: string | null
  google_client_secret?: string | null
  database_url?: string | null
  system_prompt?: string | null
  telegram_bot_token?: string | null
  telegram_chat_id?: string | null
  telegram_enabled?: boolean
}

export type UserPayload = {
  id?: string | null
  email: string
  username?: string | null
  password?: string | null
  full_name?: string | null
  role: string
  permission: string
}

export type StudioProfilePayload = {
  name: string
  address: string
  email: string
  bank_name: string
  bank_account: string
  bank_beneficiary: string
  facebook_link?: string | null
  instagram_link?: string | null
}

const DEFAULT_CATEGORIES = [
  { id: "DRESS", slug: "dress", name: { vi: "Vay cuoi", en: "Wedding Dress" } },
  { id: "SUIT", slug: "suit", name: { vi: "Vest nam", en: "Suit" } },
  { id: "PACKAGE", slug: "package", name: { vi: "Goi chup anh", en: "Photography Package" } },
]

const DEFAULT_PROFILE: StudioProfilePayload = {
  name: "Feli Studio",
  address: "23 Dong Khoi, District 1, Saigon",
  email: "hello@felistudio.vn",
  bank_name: "Vietcombank",
  bank_account: "0123 456 789",
  bank_beneficiary: "FELI STUDIO",
  facebook_link: null,
  instagram_link: null,
}

type AISettings = {
  chat_provider: string
  chat_model: string
  embedding_provider: string
  embedding_model: string
  google_client_id: string | null
  google_client_secret: string | null
  database_url: string | null
  system_prompt: string | null
  telegram_bot_token: string | null
  telegram_chat_id: string | null
  telegram_enabled: boolean
}

const DEFAULT_AI_SETTINGS: AISettings = {
  chat_provider: "gemini",
  chat_model: "gemini-2.0-flash",
  embedding_provider: "gemini",
  embedding_model: "gemini-embedding-001",
  google_client_id: process.env.CLIENT_ID ?? null,
  google_client_secret: process.env.CLIENT_SECRET ?? null,
  database_url: process.env.DATABASE_URL ? getDatabaseUrl() : null,
  system_prompt: null,
  telegram_bot_token: process.env.TELEGRAM_BOT_TOKEN ?? null,
  telegram_chat_id: process.env.TELEGRAM_CHAT_ID ?? null,
  telegram_enabled: false,
}

type StudioProfile = StudioProfilePayload

let columnCache = new Map<string, Set<string>>()
let schemaReady: Promise<void> | null = null

function isUndefinedTable(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "42P01"
}

function isForeignKeyError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23503"
}

async function tableColumns(tableName: string) {
  if (columnCache.has(tableName)) return columnCache.get(tableName)!
  const rows = await query<{ column_name: string }>(
    "select column_name from information_schema.columns where table_schema = current_schema() and table_name = $1",
    [tableName],
  )
  const columns = new Set(rows.map((row) => row.column_name))
  columnCache.set(tableName, columns)
  return columns
}

function jsonObject<T>(value: unknown, fallback: T): T {
  if (!value) return fallback
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T
    } catch {
      return fallback
    }
  }
  return value as T
}

function stringArray(value: unknown) {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.map(String)
    } catch {
      return value ? [value] : []
    }
  }
  return []
}

function toDisplayCategory(value: unknown) {
  const raw = String(value ?? "DRESS").trim()
  const upper = raw.toUpperCase()
  if (upper === "DRESS") return "Dress"
  if (upper === "SUIT") return "Suit"
  if (upper === "PACKAGE") return "Package"
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
}

function toDbCategory(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "_")
}

function normalizeStatus(value: string) {
  const status = value.trim().toUpperCase().replace(/\s+/g, "_")
  const allowed = new Set(["AWAITING_DEPOSIT", "PAID", "SERVICE_ONGOING", "COMPLETED", "CANCELLED"])
  if (!allowed.has(status)) throw new Error("Unsupported order status")
  return status
}

function dateOnly(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value ?? "").split("T")[0]
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex")
}

async function initializeSchema() {
  await withClient(async (client) => {
    await client.query("begin")
    try {
      await client.query("select pg_advisory_xact_lock(hashtext($1))", ["feli_store_schema_init"])
      const run = <T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) =>
        client.query<T>(text, params)

  await run(`
    create table if not exists categories (
      id text primary key,
      slug text unique not null,
      name jsonb not null
    )
  `)
  await run(`
    create table if not exists products (
      id text primary key,
      slug text unique not null,
      name jsonb not null,
      category text not null references categories(id),
      price integer not null,
      price_per_day boolean not null default false,
      image text not null,
      gallery jsonb not null default '[]'::jsonb,
      description jsonb not null,
      details jsonb not null default '{"en":[],"vi":[]}'::jsonb,
      available boolean not null default true,
      trending boolean not null default false,
      discount integer not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)
  await run(`
    create table if not exists users (
      id text primary key,
      email text unique not null,
      username text unique not null,
      hashed_password text,
      full_name text,
      role text not null default 'GUEST',
      permission text not null default 'VIEW',
      google_id text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)
  await run(`
    create table if not exists orders (
      id text primary key,
      order_number text unique not null,
      user_id text references users(id),
      customer text not null,
      email text not null,
      phone text not null,
      total integer not null,
      deposit integer not null,
      status text not null default 'AWAITING_DEPOSIT',
      event_date date not null,
      notes text,
      payment_proof text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)
  await run(`
    create table if not exists order_items (
      id text primary key,
      order_id text not null references orders(id) on delete cascade,
      product_id text not null references products(id),
      qty integer not null,
      price integer not null,
      days integer
    )
  `)
  await run(`
    create table if not exists vouchers (
      id text primary key,
      code text unique not null,
      discount_percent integer not null,
      active boolean not null default true,
      expires_at timestamptz
    )
  `)
  await run(`
    create table if not exists store_policies (
      id text primary key,
      policy_type text not null,
      locale text not null default 'vi',
      title text,
      content text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `)
  await run(`
    create table if not exists ai_settings (
      id integer primary key default 1,
      chat_provider text not null default 'gemini',
      chat_model text not null default 'gemini-2.0-flash',
      embedding_provider text not null default 'gemini',
      embedding_model text not null default 'gemini-embedding-001',
      google_client_id text,
      google_client_secret text,
      database_url text,
      system_prompt text,
      telegram_bot_token text,
      telegram_chat_id text,
      telegram_enabled boolean not null default false,
      updated_at timestamptz not null default now()
    )
  `)
  await run("alter table ai_settings add column if not exists google_client_id text")
  await run("alter table ai_settings add column if not exists google_client_secret text")
  await run("alter table ai_settings add column if not exists telegram_bot_token text")
  await run("alter table ai_settings add column if not exists telegram_chat_id text")
  await run("alter table ai_settings add column if not exists telegram_enabled boolean not null default false")
  await run(`
    create table if not exists studio_profile (
      id integer primary key default 1,
      name text not null default 'Feli Studio',
      address text not null default '23 Dong Khoi, District 1, Saigon',
      email text not null default 'hello@felistudio.vn',
      bank_name text not null default 'Vietcombank',
      bank_account text not null default '0123 456 789',
      bank_beneficiary text not null default 'FELI STUDIO',
      facebook_link text,
      instagram_link text,
      updated_at timestamptz not null default now()
    )
  `)

  for (const category of DEFAULT_CATEGORIES) {
    await run(
      "insert into categories (id, slug, name) values ($1, $2, $3) on conflict (id) do nothing",
      [category.id, category.slug, JSON.stringify(category.name)],
    )
  }

  await run(
    `
    insert into studio_profile (id, name, address, email, bank_name, bank_account, bank_beneficiary)
    values (1, $1, $2, $3, $4, $5, $6)
    on conflict (id) do nothing
    `,
    [
      DEFAULT_PROFILE.name,
      DEFAULT_PROFILE.address,
      DEFAULT_PROFILE.email,
      DEFAULT_PROFILE.bank_name,
      DEFAULT_PROFILE.bank_account,
      DEFAULT_PROFILE.bank_beneficiary,
    ],
  )

  await run(
    `
    insert into ai_settings (
      id, chat_provider, chat_model, embedding_provider, embedding_model,
      google_client_id, google_client_secret, database_url
    )
    values (1, $1, $2, $3, $4, $5, $6, $7)
    on conflict (id) do nothing
    `,
    [
      DEFAULT_AI_SETTINGS.chat_provider,
      DEFAULT_AI_SETTINGS.chat_model,
      DEFAULT_AI_SETTINGS.embedding_provider,
      DEFAULT_AI_SETTINGS.embedding_model,
      DEFAULT_AI_SETTINGS.google_client_id,
      DEFAULT_AI_SETTINGS.google_client_secret,
      DEFAULT_AI_SETTINGS.database_url,
    ],
  )

  const existingProducts = await run<{ count: string }>("select count(*)::text as count from products")
  if (Number(existingProducts.rows[0]?.count ?? 0) === 0) {
    for (const product of seedProducts) {
      await run(
        `
        insert into products (
          id, slug, name, category, price, price_per_day, image, gallery,
          description, details, available, trending, discount
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        on conflict (id) do nothing
        `,
        [
          product.id,
          product.slug,
          JSON.stringify(product.name),
          toDbCategory(product.category),
          product.price,
          Boolean(product.pricePerDay),
          product.image,
          JSON.stringify(product.gallery),
          JSON.stringify(product.description),
          JSON.stringify(product.details),
          product.available,
          Boolean(product.trending),
          product.discount ?? 0,
        ],
      )
    }
  }

      await client.query("commit")
    } catch (error) {
      await client.query("rollback")
      throw error
    }
  })
  columnCache = new Map<string, Set<string>>()
}

async function ensureSchema() {
  schemaReady ??= initializeSchema()
  try {
    await schemaReady
  } catch (error) {
    schemaReady = null
    throw error
  }
}

function mapProduct(row: Record<string, unknown>) {
  const gallery = stringArray(row.gallery)
  const image = String(row.image ?? "/placeholder.svg")
  const pricePerDay = Boolean(row.price_per_day)
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: jsonObject<LocalizedText>(row.name, { en: "", vi: "" }),
    category: toDisplayCategory(row.category),
    price: Number(row.price ?? 0),
    price_per_day: pricePerDay,
    pricePerDay,
    image,
    gallery: gallery.length ? gallery : [image],
    description: jsonObject<LocalizedText>(row.description, { en: "", vi: "" }),
    details: jsonObject<LocalizedList>(row.details, { en: [], vi: [] }),
    available: Boolean(row.available),
    trending: Boolean(row.trending),
    discount: Number(row.discount ?? 0),
  }
}

export async function listProducts() {
  await ensureSchema()
  const rows = await query<Record<string, unknown>>(
    `
    select id, slug, name, category::text as category, price, price_per_day, image, gallery,
           description, details, available, trending, discount
    from products
    order by created_at desc nulls last
    `,
  )
  return rows.map(mapProduct)
}

export async function upsertProduct(payload: ProductPayload) {
  const id = payload.id || randomUUID()
  const image = payload.image || "/placeholder.svg"
  const gallery = payload.gallery?.length ? payload.gallery : [image]
  const details = payload.details ?? { en: [], vi: [] }
  const pricePerDay = Boolean(payload.pricePerDay ?? payload.price_per_day)

  const rows = await query<Record<string, unknown>>(
    `
    insert into products (
      id, slug, name, category, price, price_per_day, image, gallery, description,
      details, available, trending, discount, created_at, updated_at
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now(), now())
    on conflict (id) do update set
      slug = excluded.slug,
      name = excluded.name,
      category = excluded.category,
      price = excluded.price,
      price_per_day = excluded.price_per_day,
      image = excluded.image,
      gallery = excluded.gallery,
      description = excluded.description,
      details = excluded.details,
      available = excluded.available,
      trending = excluded.trending,
      discount = excluded.discount,
      updated_at = now()
    returning id, slug, name, category::text as category, price, price_per_day, image, gallery,
              description, details, available, trending, discount
    `,
    [
      id,
      payload.slug,
      payload.name,
      toDbCategory(payload.category),
      Math.round(Number(payload.price)),
      pricePerDay,
      image,
      JSON.stringify(gallery),
      payload.description,
      details,
      payload.available ?? true,
      payload.trending ?? false,
      Math.max(0, Math.min(90, Math.round(payload.discount ?? 0))),
    ],
  )
  return mapProduct(rows[0])
}

export async function deleteProduct(productId: string) {
  try {
    const rows = await query("delete from products where id = $1 returning id", [productId])
    return rows.length > 0
  } catch (error) {
    if (isForeignKeyError(error)) throw new Error("Cannot delete product that is referenced by existing orders")
    throw error
  }
}

export async function updateProductPromo(productId: string, payload: { trending?: boolean; discount?: number }) {
  const patches: string[] = []
  const values: unknown[] = []
  if (typeof payload.trending === "boolean") {
    values.push(payload.trending)
    patches.push(`trending = $${values.length}`)
  }
  if (typeof payload.discount === "number") {
    values.push(Math.max(0, Math.min(90, Math.round(payload.discount))))
    patches.push(`discount = $${values.length}`)
  }
  if (!patches.length) {
    const rows = await query<Record<string, unknown>>(
      "select id, slug, name, category::text as category, price, price_per_day, image, gallery, description, details, available, trending, discount from products where id = $1",
      [productId],
    )
    return rows[0] ? mapProduct(rows[0]) : null
  }
  values.push(productId)
  const rows = await query<Record<string, unknown>>(
    `
    update products set ${patches.join(", ")}, updated_at = now()
    where id = $${values.length}
    returning id, slug, name, category::text as category, price, price_per_day, image, gallery,
              description, details, available, trending, discount
    `,
    values,
  )
  return rows[0] ? mapProduct(rows[0]) : null
}

export async function listCategories() {
  try {
    const rows = await query<{ id: string; slug: string; name: unknown }>(
      "select id, slug, name from categories order by id",
    )
    return rows.map((row) => ({ id: row.id, slug: row.slug, name: jsonObject(row.name, { vi: row.id, en: row.id }) }))
  } catch (error) {
    if (isUndefinedTable(error)) return DEFAULT_CATEGORIES
    throw error
  }
}

export async function createCategory(payload: { id: string; slug: string; name: LocalizedText }) {
  const rows = await query<{ id: string; slug: string; name: unknown }>(
    "insert into categories (id, slug, name) values ($1, $2, $3) returning id, slug, name",
    [payload.id, payload.slug, payload.name],
  )
  return { ...rows[0], name: jsonObject(rows[0].name, payload.name) }
}

export async function updateCategory(categoryId: string, payload: { slug: string; name: LocalizedText }) {
  const rows = await query<{ id: string; slug: string; name: unknown }>(
    "update categories set slug = $1, name = $2 where id = $3 returning id, slug, name",
    [payload.slug, payload.name, categoryId],
  )
  return rows[0] ? { ...rows[0], name: jsonObject(rows[0].name, payload.name) } : null
}

export async function deleteCategory(categoryId: string) {
  try {
    const rows = await query("delete from categories where id = $1 returning id", [categoryId])
    return rows.length > 0
  } catch (error) {
    if (isForeignKeyError(error)) throw new Error("Cannot delete category in use")
    throw error
  }
}

function mapOrder(row: Record<string, unknown>, items: Record<string, unknown>[] = []) {
  return {
    id: String(row.id),
    order_number: String(row.order_number),
    customer: String(row.customer),
    email: String(row.email),
    phone: String(row.phone),
    total: Number(row.total ?? 0),
    deposit: Number(row.deposit ?? 0),
    status: normalizeStatus(String(row.status ?? "AWAITING_DEPOSIT")),
    event_date: dateOnly(row.event_date),
    payment_proof: row.payment_proof ? String(row.payment_proof) : null,
    items: items.map((item) => ({
      product_id: String(item.product_id),
      name: jsonObject<LocalizedText>(item.product_name, { vi: "Unknown", en: "Unknown" }).vi,
      qty: Number(item.qty ?? 1),
      price: Number(item.price ?? 0),
      days: item.days === null || typeof item.days === "undefined" ? null : Number(item.days),
    })),
  }
}

export async function listOrders() {
  const orderColumns = await tableColumns("orders")
  const proofSelect = orderColumns.has("payment_proof") ? "payment_proof" : "null::text as payment_proof"
  const orders = await query<Record<string, unknown>>(
    `
    select id, order_number, customer, email, phone, total, deposit, status::text as status,
           event_date, ${proofSelect}, created_at
    from orders
    order by created_at desc nulls last
    `,
  )
  if (!orders.length) return []
  const ids = orders.map((order) => String(order.id))
  const items = await query<Record<string, unknown>>(
    `
    select oi.order_id, oi.product_id, oi.qty, oi.price, oi.days, p.name as product_name
    from order_items oi
    left join products p on p.id = oi.product_id
    where oi.order_id = any($1)
    order by oi.id
    `,
    [ids],
  )
  const byOrder = new Map<string, Record<string, unknown>[]>()
  for (const item of items) {
    const orderId = String(item.order_id)
    byOrder.set(orderId, [...(byOrder.get(orderId) ?? []), item])
  }
  return orders.map((order) => mapOrder(order, byOrder.get(String(order.id)) ?? []))
}

export async function getOrder(orderId: string) {
  const orderColumns = await tableColumns("orders")
  const proofSelect = orderColumns.has("payment_proof") ? "payment_proof" : "null::text as payment_proof"
  const orders = await query<Record<string, unknown>>(
    `
    select id, order_number, customer, email, phone, total, deposit, status::text as status,
           event_date, ${proofSelect}, created_at
    from orders
    where id = $1
    `,
    [orderId],
  )
  if (!orders[0]) return null
  const items = await query<Record<string, unknown>>(
    `
    select oi.order_id, oi.product_id, oi.qty, oi.price, oi.days, p.name as product_name
    from order_items oi
    left join products p on p.id = oi.product_id
    where oi.order_id = $1
    order by oi.id
    `,
    [orderId],
  )
  return mapOrder(orders[0], items)
}

async function nextOrderNumber(client: PoolClient) {
  const result = await client.query<{ count: string }>("select count(*)::text as count from orders")
  return `ML-${2400 + Number(result.rows[0]?.count ?? 0)}`
}

export async function createOrder(payload: CreateOrderPayload) {
  if (!payload.items?.length) throw new Error("Order must include at least one item")
  return await withClient(async (client) => {
    await client.query("begin")
    try {
      const id = randomUUID()
      const orderNumber = await nextOrderNumber(client)
      await client.query(
        `
        insert into orders (
          id, order_number, customer, email, phone, total, deposit, status,
          event_date, notes, created_at, updated_at
        )
        values ($1, $2, $3, $4, $5, $6, $7, 'AWAITING_DEPOSIT', $8, $9, now(), now())
        `,
        [
          id,
          orderNumber,
          payload.customer,
          payload.email,
          payload.phone,
          Math.round(Number(payload.total)),
          Math.round(Number(payload.deposit)),
          dateOnly(payload.event_date || new Date().toISOString()),
          payload.notes ?? null,
        ],
      )
      for (const item of payload.items) {
        await client.query(
          `
          insert into order_items (id, order_id, product_id, qty, price, days)
          values ($1, $2, $3, $4, $5, $6)
          `,
          [
            randomUUID(),
            id,
            item.product_id,
            Math.max(1, Math.round(Number(item.qty))),
            Math.max(0, Math.round(Number(item.price))),
            item.days ? Math.max(1, Math.round(Number(item.days))) : null,
          ],
        )
      }
      await client.query("commit")
      return { id, order_number: orderNumber }
    } catch (error) {
      await client.query("rollback")
      throw error
    }
  })
}

export async function updateOrderStatus(orderId: string, status: string) {
  const rows = await query<Record<string, unknown>>(
    "update orders set status = $1, updated_at = now() where id = $2 returning id",
    [normalizeStatus(status), orderId],
  )
  if (!rows[0]) return null
  return await getOrder(orderId)
}

export async function deleteOrder(orderId: string) {
  const rows = await query("delete from orders where id = $1 returning id", [orderId])
  return rows.length > 0
}

export async function bulkDeleteOrders(ids: string[]) {
  if (!ids.length) return 0
  const rows = await query("delete from orders where id = any($1) returning id", [ids])
  return rows.length
}

export async function uploadOrderProof(orderId: string, proof: string) {
  await query("alter table orders add column if not exists payment_proof text")
  columnCache.delete("orders")
  const rows = await query<Record<string, unknown>>(
    "update orders set payment_proof = $1, status = 'PAID', updated_at = now() where id = $2 returning status::text as status",
    [proof, orderId],
  )
  return rows[0] ? { success: true, status: rows[0].status } : null
}

export async function getAiSettings(): Promise<AISettings> {
  await ensureSchema()
  const columns = await tableColumns("ai_settings")
  if (!columns.size) return DEFAULT_AI_SETTINGS

  const rows = await query<Record<string, unknown>>("select * from ai_settings where id = 1")
  if (!rows[0]) return await upsertAiSettings(DEFAULT_AI_SETTINGS)

  return {
    ...DEFAULT_AI_SETTINGS,
    chat_provider: String(rows[0].chat_provider ?? DEFAULT_AI_SETTINGS.chat_provider),
    chat_model: String(rows[0].chat_model ?? DEFAULT_AI_SETTINGS.chat_model),
    embedding_provider: String(rows[0].embedding_provider ?? DEFAULT_AI_SETTINGS.embedding_provider),
    embedding_model: String(rows[0].embedding_model ?? DEFAULT_AI_SETTINGS.embedding_model),
    google_client_id: columns.has("google_client_id")
      ? (rows[0].google_client_id as string | null) ?? DEFAULT_AI_SETTINGS.google_client_id
      : DEFAULT_AI_SETTINGS.google_client_id,
    google_client_secret: columns.has("google_client_secret")
      ? (rows[0].google_client_secret as string | null) ?? DEFAULT_AI_SETTINGS.google_client_secret
      : DEFAULT_AI_SETTINGS.google_client_secret,
    database_url: columns.has("database_url")
      ? (rows[0].database_url as string | null) ?? DEFAULT_AI_SETTINGS.database_url
      : DEFAULT_AI_SETTINGS.database_url,
    system_prompt: columns.has("system_prompt") ? (rows[0].system_prompt as string | null) : null,
    telegram_bot_token: columns.has("telegram_bot_token")
      ? (rows[0].telegram_bot_token as string | null) ?? DEFAULT_AI_SETTINGS.telegram_bot_token
      : DEFAULT_AI_SETTINGS.telegram_bot_token,
    telegram_chat_id: columns.has("telegram_chat_id")
      ? (rows[0].telegram_chat_id as string | null) ?? DEFAULT_AI_SETTINGS.telegram_chat_id
      : DEFAULT_AI_SETTINGS.telegram_chat_id,
    telegram_enabled: columns.has("telegram_enabled")
      ? Boolean(rows[0].telegram_enabled)
      : DEFAULT_AI_SETTINGS.telegram_enabled,
  }
}

export async function upsertAiSettings(payload: AISettingsPayload): Promise<AISettings> {
  await ensureSchema()
  const columns = await tableColumns("ai_settings")
  if (!columns.size) return { ...DEFAULT_AI_SETTINGS, ...payload }

  const fieldValues: Record<string, unknown> = {
    chat_provider: payload.chat_provider ?? DEFAULT_AI_SETTINGS.chat_provider,
    chat_model: payload.chat_model ?? DEFAULT_AI_SETTINGS.chat_model,
    embedding_provider: payload.embedding_provider ?? DEFAULT_AI_SETTINGS.embedding_provider,
    embedding_model: payload.embedding_model ?? DEFAULT_AI_SETTINGS.embedding_model,
    google_client_id:
      typeof payload.google_client_id === "undefined" ? DEFAULT_AI_SETTINGS.google_client_id : payload.google_client_id,
    google_client_secret:
      typeof payload.google_client_secret === "undefined"
        ? DEFAULT_AI_SETTINGS.google_client_secret
        : payload.google_client_secret,
    database_url: typeof payload.database_url === "undefined" ? DEFAULT_AI_SETTINGS.database_url : payload.database_url,
    system_prompt: typeof payload.system_prompt === "undefined" ? DEFAULT_AI_SETTINGS.system_prompt : payload.system_prompt,
    telegram_bot_token:
      typeof payload.telegram_bot_token === "undefined"
        ? DEFAULT_AI_SETTINGS.telegram_bot_token
        : payload.telegram_bot_token,
    telegram_chat_id:
      typeof payload.telegram_chat_id === "undefined" ? DEFAULT_AI_SETTINGS.telegram_chat_id : payload.telegram_chat_id,
    telegram_enabled: payload.telegram_enabled ?? DEFAULT_AI_SETTINGS.telegram_enabled,
  }
  const insertColumns = ["id", ...Object.keys(fieldValues).filter((name) => columns.has(name))]
  const params = insertColumns.map((name) => (name === "id" ? 1 : fieldValues[name]))
  const placeholders = insertColumns.map((_, index) => `$${index + 1}`)
  const assignments = insertColumns
    .filter((name) => name !== "id")
    .map((name) => `${name} = excluded.${name}`)
  if (columns.has("updated_at")) assignments.push("updated_at = now()")

  const rows = await query<Record<string, unknown>>(
    `
    insert into ai_settings (${insertColumns.join(", ")})
    values (${placeholders.join(", ")})
    on conflict (id) do update set ${assignments.join(", ")}
    returning *
    `,
    params,
  )
  const row = rows[0] ?? {}
  return {
    ...DEFAULT_AI_SETTINGS,
    chat_provider: String(row.chat_provider ?? fieldValues.chat_provider),
    chat_model: String(row.chat_model ?? fieldValues.chat_model),
    embedding_provider: String(row.embedding_provider ?? fieldValues.embedding_provider),
    embedding_model: String(row.embedding_model ?? fieldValues.embedding_model),
    google_client_id: (row.google_client_id as string | null | undefined) ?? (fieldValues.google_client_id as string | null),
    google_client_secret:
      (row.google_client_secret as string | null | undefined) ?? (fieldValues.google_client_secret as string | null),
    database_url: (row.database_url as string | null | undefined) ?? (fieldValues.database_url as string | null),
    system_prompt: (row.system_prompt as string | null | undefined) ?? (fieldValues.system_prompt as string | null),
    telegram_bot_token:
      (row.telegram_bot_token as string | null | undefined) ?? (fieldValues.telegram_bot_token as string | null),
    telegram_chat_id: (row.telegram_chat_id as string | null | undefined) ?? (fieldValues.telegram_chat_id as string | null),
    telegram_enabled: Boolean(row.telegram_enabled ?? fieldValues.telegram_enabled),
  }
}

export async function getPrimaryPolicy() {
  try {
    const rows = await query<Record<string, unknown>>(
      `
      select id, title, content, locale, policy_type
      from store_policies
      where policy_type = 'studio'
      order by updated_at desc nulls last
      limit 1
      `,
    )
    if (!rows[0]) return null
    return {
      id: String(rows[0].id),
      title: rows[0].title ? String(rows[0].title) : null,
      content: String(rows[0].content ?? ""),
      locale: String(rows[0].locale ?? "vi"),
      policy_type: String(rows[0].policy_type ?? "studio"),
    }
  } catch (error) {
    if (isUndefinedTable(error)) return null
    throw error
  }
}

export async function upsertPrimaryPolicy(payload: { content: string; title?: string | null; locale?: string; policy_type?: string }) {
  const policyType = payload.policy_type ?? "studio"
  const locale = payload.locale ?? "vi"
  const existing = await query<{ id: string }>(
    "select id from store_policies where policy_type = $1 and locale = $2 order by updated_at desc nulls last limit 1",
    [policyType, locale],
  )
  const id = existing[0]?.id ?? randomUUID()
  const rows = await query<Record<string, unknown>>(
    `
    insert into store_policies (id, policy_type, locale, title, content, created_at, updated_at)
    values ($1, $2, $3, $4, $5, now(), now())
    on conflict (id) do update set
      policy_type = excluded.policy_type,
      locale = excluded.locale,
      title = excluded.title,
      content = excluded.content,
      updated_at = now()
    returning id, title, content, locale, policy_type
    `,
    [id, policyType, locale, payload.title ?? null, payload.content],
  )
  return {
    id: String(rows[0].id),
    title: rows[0].title ? String(rows[0].title) : null,
    content: String(rows[0].content ?? ""),
    locale: String(rows[0].locale ?? "vi"),
    policy_type: String(rows[0].policy_type ?? "studio"),
  }
}

export async function getStudioProfile(): Promise<StudioProfile> {
  const columns = await tableColumns("studio_profile")
  if (!columns.size) return DEFAULT_PROFILE
  const rows = await query<Record<string, unknown>>("select * from studio_profile where id = 1")
  if (!rows[0]) return await updateStudioProfile(DEFAULT_PROFILE)
  return {
    ...DEFAULT_PROFILE,
    name: String(rows[0].name ?? DEFAULT_PROFILE.name),
    address: String(rows[0].address ?? DEFAULT_PROFILE.address),
    email: String(rows[0].email ?? DEFAULT_PROFILE.email),
    bank_name: String(rows[0].bank_name ?? DEFAULT_PROFILE.bank_name),
    bank_account: String(rows[0].bank_account ?? DEFAULT_PROFILE.bank_account),
    bank_beneficiary: String(rows[0].bank_beneficiary ?? DEFAULT_PROFILE.bank_beneficiary),
    facebook_link: columns.has("facebook_link") ? (rows[0].facebook_link as string | null) : null,
    instagram_link: columns.has("instagram_link") ? (rows[0].instagram_link as string | null) : null,
  }
}

export async function updateStudioProfile(payload: StudioProfilePayload): Promise<StudioProfile> {
  const columns = await tableColumns("studio_profile")
  if (!columns.size) return { ...DEFAULT_PROFILE, ...payload }
  const fieldValues: Record<string, unknown> = {
    name: payload.name,
    address: payload.address,
    email: payload.email,
    bank_name: payload.bank_name,
    bank_account: payload.bank_account,
    bank_beneficiary: payload.bank_beneficiary,
    facebook_link: payload.facebook_link ?? null,
    instagram_link: payload.instagram_link ?? null,
  }
  const insertColumns = ["id", ...Object.keys(fieldValues).filter((name) => columns.has(name))]
  const params = insertColumns.map((name) => (name === "id" ? 1 : fieldValues[name]))
  const placeholders = insertColumns.map((_, index) => `$${index + 1}`)
  const assignments = insertColumns
    .filter((name) => name !== "id")
    .map((name) => `${name} = excluded.${name}`)
  if (columns.has("updated_at")) assignments.push("updated_at = now()")
  await query(
    `
    insert into studio_profile (${insertColumns.join(", ")})
    values (${placeholders.join(", ")})
    on conflict (id) do update set ${assignments.join(", ")}
    `,
    params,
  )
  return await getStudioProfile()
}

export async function listUsers() {
  const rows = await query<Record<string, unknown>>(
    `
    select id, email, username, full_name, role::text as role, permission::text as permission
    from users
    order by created_at desc nulls last
    `,
  )
  return rows.map((row) => ({
    id: String(row.id),
    email: String(row.email),
    username: row.username ? String(row.username) : null,
    full_name: row.full_name ? String(row.full_name) : null,
    role: String(row.role ?? "GUEST"),
    permission: String(row.permission ?? "VIEW"),
  }))
}

export async function upsertUser(payload: UserPayload) {
  const id = payload.id || randomUUID()
  const username = payload.username || payload.email
  const columns = await tableColumns("users")
  const passwordSql = payload.password && columns.has("hashed_password") ? ", hashed_password = excluded.hashed_password" : ""
  const insertColumns = [
    "id",
    "email",
    "username",
    "full_name",
    "role",
    "permission",
    ...(payload.password && columns.has("hashed_password") ? ["hashed_password"] : []),
  ]
  const params = [
    id,
    payload.email,
    username,
    payload.full_name ?? null,
    payload.role,
    payload.permission,
    ...(payload.password && columns.has("hashed_password") ? [sha256(payload.password)] : []),
  ]
  const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(", ")
  const rows = await query<Record<string, unknown>>(
    `
    insert into users (${insertColumns.join(", ")})
    values (${placeholders})
    on conflict (id) do update set
      email = excluded.email,
      username = excluded.username,
      full_name = excluded.full_name,
      role = excluded.role,
      permission = excluded.permission
      ${passwordSql},
      updated_at = now()
    returning id, email, username, full_name, role::text as role, permission::text as permission
    `,
    params,
  )
  return rows[0]
}

export async function upsertGoogleUser(payload: { email: string; full_name?: string | null; google_id?: string | null }) {
  await ensureSchema()
  const id = randomUUID()
  const username = payload.email
  const columns = await tableColumns("users")
  const insertColumns = [
    "id",
    "email",
    "username",
    "full_name",
    "role",
    "permission",
    ...(columns.has("google_id") ? ["google_id"] : []),
  ]
  const params = [
    id,
    payload.email,
    username,
    payload.full_name ?? null,
    "GUEST",
    "VIEW",
    ...(columns.has("google_id") ? [payload.google_id ?? null] : []),
  ]
  const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(", ")
  const googleIdSql = columns.has("google_id") ? ", google_id = coalesce(excluded.google_id, users.google_id)" : ""
  const rows = await query<Record<string, unknown>>(
    `
    insert into users (${insertColumns.join(", ")})
    values (${placeholders})
    on conflict (email) do update set
      username = users.username,
      full_name = coalesce(users.full_name, excluded.full_name),
      role = users.role,
      permission = users.permission
      ${googleIdSql},
      updated_at = now()
    returning id, email, username, full_name, role::text as role, permission::text as permission
    `,
    params,
  )
  return rows[0]
}

export async function deleteUser(userId: string) {
  try {
    const rows = await query("delete from users where id = $1 returning id", [userId])
    return rows.length > 0
  } catch (error) {
    if (isForeignKeyError(error)) throw new Error("User is in use")
    throw error
  }
}

export async function loginUser(identifier: string, password: string) {
  await ensureSchema()
  const rows = await query<Record<string, unknown>>(
    `
    select id, email, username, full_name, role::text as role, hashed_password
    from users
    where email = $1 or username = $1
    limit 1
    `,
    [identifier],
  )
  const user = rows[0]
  if (!user) return null
  const hash = user.hashed_password ? String(user.hashed_password) : null
  if (hash && hash !== sha256(password)) return null
  if (!hash && password !== "") return null
  return {
    id: String(user.id),
    email: String(user.email),
    username: String(user.username ?? user.email),
    full_name: user.full_name ? String(user.full_name) : null,
    role: String(user.role ?? "GUEST"),
  }
}

export async function listActiveVouchers() {
  try {
    const rows = await query<Record<string, unknown>>(
      `
      select code, discount_percent
      from vouchers
      where active = true and (expires_at is null or expires_at > now())
      order by code
      `,
    )
    return rows.map((row) => ({ code: String(row.code), discount_percent: Number(row.discount_percent ?? 0) }))
  } catch (error) {
    if (isUndefinedTable(error)) return []
    throw error
  }
}

export async function getAiContext() {
  const [products, policy, vouchers, studio_profile] = await Promise.all([
    listProducts(),
    getPrimaryPolicy(),
    listActiveVouchers(),
    getStudioProfile(),
  ])
  return {
    products,
    policies: policy ? [policy] : [],
    vouchers,
    studio_profile,
  }
}
