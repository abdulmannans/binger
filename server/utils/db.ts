import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { createClient, type Client } from '@libsql/client'
import type { MediaType, SheetItem, SheetList, SheetUser, WatchStatus } from '#shared/types'

let client: Client | null = null
let schemaReady = false

function resolveDbUrl(url: string) {
  const pathPart = url.replace(/^file:(\/\/)?/, '')
  const abs = resolve(pathPart)
  mkdirSync(dirname(abs), { recursive: true })
  return `file:${abs}`
}

function isRemoteDb(url: string) {
  return url.startsWith('libsql://') || url.startsWith('https://')
}

function isServerless() {
  return Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL)
}

function dbFailure(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  throw createError({
    statusCode: 500,
    statusMessage: `Database connection failed. On Netlify set DATABASE_URL and DATABASE_AUTH_TOKEN. ${message}`,
  })
}

export function db() {
  if (client) return client
  const url = databaseUrl()
  const authToken = databaseAuthToken()

  if (isServerless() && url.startsWith('file:')) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Netlify cannot use a local SQLite file. Set DATABASE_URL and DATABASE_AUTH_TOKEN to your Turso database.',
    })
  }

  if (isRemoteDb(url) && !authToken) {
    throw createError({
      statusCode: 500,
      statusMessage: 'DATABASE_AUTH_TOKEN is missing. Add the Turso token in your host env vars.',
    })
  }

  const resolved = url.startsWith('file:') ? resolveDbUrl(url) : url
  client = createClient({
    url: resolved,
    authToken: authToken || undefined,
  })
  return client
}

export async function ensureSchema() {
  if (schemaReady) return
  const database = db()
  try {
    await database.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      list_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      tmdb_id TEXT NOT NULL,
      media_type TEXT NOT NULL,
      title TEXT NOT NULL,
      poster_path TEXT NOT NULL DEFAULT '',
      year TEXT NOT NULL DEFAULT '',
      imdb_id TEXT NOT NULL DEFAULT '',
      imdb_rating TEXT NOT NULL DEFAULT '',
      user_rating TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT '',
      added_at TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_lists_user ON lists(user_id);
    CREATE INDEX IF NOT EXISTS idx_items_list ON items(list_id);
    CREATE INDEX IF NOT EXISTS idx_items_user ON items(user_id);
  `)
    await ensurePositionColumn(database)
  }
  catch (error) {
    dbFailure(error)
  }
  schemaReady = true
}

async function ensurePositionColumn(database: Client) {
  try {
    const info = await database.execute('PRAGMA table_info(items)')
    const hasPosition = info.rows.some(row => String(row.name) === 'position')
    if (!hasPosition) {
      await database.execute('ALTER TABLE items ADD COLUMN position INTEGER NOT NULL DEFAULT 0')
    }
    await backfillZeroPositions(database)
  }
  catch {
    try {
      await database.execute('ALTER TABLE items ADD COLUMN position INTEGER NOT NULL DEFAULT 0')
    }
    catch {
      // already exists
    }
    await backfillZeroPositions(database)
  }
}

async function backfillZeroPositions(database: Client) {
  const lists = await database.execute(`
    SELECT list_id FROM items
    GROUP BY list_id
    HAVING MAX(position) = 0 AND COUNT(*) > 0
  `)
  for (const row of lists.rows) {
    const listId = String(row.list_id)
    const items = await database.execute({
      sql: 'SELECT id FROM items WHERE list_id = ? ORDER BY added_at ASC',
      args: [listId],
    })
    for (const [index, item] of items.rows.entries()) {
      await database.execute({
        sql: 'UPDATE items SET position = ? WHERE id = ?',
        args: [index + 1, item.id],
      })
    }
  }
}

function text(value: unknown) {
  return value == null ? '' : String(value)
}

function toUser(row: Record<string, unknown>): SheetUser {
  return {
    id: text(row.id),
    email: text(row.email),
    password_hash: text(row.password_hash),
    display_name: text(row.display_name),
    created_at: text(row.created_at),
  }
}

function toList(row: Record<string, unknown>): SheetList {
  return {
    id: text(row.id),
    user_id: text(row.user_id),
    name: text(row.name),
    description: text(row.description),
    created_at: text(row.created_at),
  }
}

function toItem(row: Record<string, unknown>): SheetItem {
  return {
    id: text(row.id),
    list_id: text(row.list_id),
    user_id: text(row.user_id),
    tmdb_id: text(row.tmdb_id),
    media_type: row.media_type === 'tv' ? 'tv' : 'movie',
    title: text(row.title),
    poster_path: text(row.poster_path),
    year: text(row.year),
    imdb_id: text(row.imdb_id),
    imdb_rating: text(row.imdb_rating),
    user_rating: text(row.user_rating),
    notes: text(row.notes),
    status: (text(row.status) as WatchStatus | ''),
    added_at: text(row.added_at),
    position: text(row.position || '0'),
  }
}

export async function findUserByEmail(email: string) {
  await ensureSchema()
  const result = await db().execute({
    sql: 'SELECT * FROM users WHERE lower(email) = ? LIMIT 1',
    args: [email.trim().toLowerCase()],
  })
  const row = result.rows[0]
  return row ? toUser(row as unknown as Record<string, unknown>) : null
}

export async function findUserById(id: string) {
  await ensureSchema()
  const result = await db().execute({
    sql: 'SELECT * FROM users WHERE id = ? LIMIT 1',
    args: [id],
  })
  const row = result.rows[0]
  return row ? toUser(row as unknown as Record<string, unknown>) : null
}

export async function createUser(user: SheetUser) {
  await ensureSchema()
  await db().execute({
    sql: 'INSERT INTO users (id, email, password_hash, display_name, created_at) VALUES (?, ?, ?, ?, ?)',
    args: [user.id, user.email, user.password_hash, user.display_name, user.created_at],
  })
  return user
}

export async function listListsByUser(userId: string) {
  await ensureSchema()
  const result = await db().execute({
    sql: 'SELECT * FROM lists WHERE user_id = ? ORDER BY created_at DESC',
    args: [userId],
  })
  return result.rows.map(row => toList(row as unknown as Record<string, unknown>))
}

export async function findListById(id: string) {
  await ensureSchema()
  const result = await db().execute({
    sql: 'SELECT * FROM lists WHERE id = ? LIMIT 1',
    args: [id],
  })
  const row = result.rows[0]
  return row ? toList(row as unknown as Record<string, unknown>) : null
}

export async function createList(list: SheetList) {
  await ensureSchema()
  await db().execute({
    sql: 'INSERT INTO lists (id, user_id, name, description, created_at) VALUES (?, ?, ?, ?, ?)',
    args: [list.id, list.user_id, list.name, list.description, list.created_at],
  })
  return list
}

export async function updateList(list: SheetList) {
  await ensureSchema()
  await db().execute({
    sql: 'UPDATE lists SET name = ?, description = ? WHERE id = ?',
    args: [list.name, list.description, list.id],
  })
  return list
}

export async function deleteList(id: string) {
  await ensureSchema()
  const database = db()
  await database.execute({ sql: 'DELETE FROM items WHERE list_id = ?', args: [id] })
  await database.execute({ sql: 'DELETE FROM lists WHERE id = ?', args: [id] })
}

export async function listItemsByUser(userId: string) {
  await ensureSchema()
  const result = await db().execute({
    sql: 'SELECT * FROM items WHERE user_id = ? ORDER BY added_at DESC',
    args: [userId],
  })
  return result.rows.map(row => toItem(row as unknown as Record<string, unknown>))
}

export async function listItemsByList(listId: string) {
  await ensureSchema()
  const result = await db().execute({
    sql: 'SELECT * FROM items WHERE list_id = ? ORDER BY position ASC, year ASC, added_at ASC',
    args: [listId],
  })
  return result.rows.map(row => toItem(row as unknown as Record<string, unknown>))
}

export async function findItemById(id: string) {
  await ensureSchema()
  const result = await db().execute({
    sql: 'SELECT * FROM items WHERE id = ? LIMIT 1',
    args: [id],
  })
  const row = result.rows[0]
  return row ? toItem(row as unknown as Record<string, unknown>) : null
}

export async function createItem(item: SheetItem) {
  await ensureSchema()
  await db().execute({
    sql: `INSERT INTO items (
      id, list_id, user_id, tmdb_id, media_type, title, poster_path, year,
      imdb_id, imdb_rating, user_rating, notes, status, added_at, position
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      item.id,
      item.list_id,
      item.user_id,
      item.tmdb_id,
      item.media_type,
      item.title,
      item.poster_path,
      item.year,
      item.imdb_id,
      item.imdb_rating,
      item.user_rating,
      item.notes,
      item.status,
      item.added_at,
      item.position || '0',
    ],
  })
  return item
}

export async function updateItem(item: SheetItem) {
  await ensureSchema()
  await db().execute({
    sql: `UPDATE items SET
      user_rating = ?, notes = ?, status = ?, position = ?
      WHERE id = ?`,
    args: [item.user_rating, item.notes, item.status, item.position || '0', item.id],
  })
  return item
}

export async function deleteItem(id: string) {
  await ensureSchema()
  await db().execute({
    sql: 'DELETE FROM items WHERE id = ?',
    args: [id],
  })
}

export function newId() {
  return crypto.randomUUID()
}

export function toLibraryItem(item: SheetItem) {
  const rating = item.user_rating.trim()
  return {
    id: item.id,
    listId: item.list_id,
    tmdbId: Number(item.tmdb_id),
    mediaType: (item.media_type === 'tv' ? 'tv' : 'movie') as MediaType,
    title: item.title,
    posterPath: item.poster_path || null,
    year: item.year || null,
    imdbId: item.imdb_id || null,
    imdbRating: item.imdb_rating || null,
    userRating: rating ? Number(rating) : null,
    notes: item.notes,
    status: (item.status || '') as WatchStatus | '',
    addedAt: item.added_at,
    position: Number(item.position) || 0,
  }
}

export async function nextItemPosition(listId: string) {
  await ensureSchema()
  const result = await db().execute({
    sql: 'SELECT MAX(position) as max_pos FROM items WHERE list_id = ?',
    args: [listId],
  })
  const max = Number(result.rows[0]?.max_pos ?? 0)
  return Number.isFinite(max) ? max + 1 : 1
}

export async function reorderListItems(listId: string, ids: string[]) {
  await ensureSchema()
  const database = db()
  for (const [index, id] of ids.entries()) {
    await database.execute({
      sql: 'UPDATE items SET position = ? WHERE id = ? AND list_id = ?',
      args: [index + 1, id, listId],
    })
  }
}

export function isWatchStatus(value: unknown): value is WatchStatus {
  return value === 'want' || value === 'watching' || value === 'watched'
}
