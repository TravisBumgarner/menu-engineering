import BetterSqlite3 from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { app } from 'electron'
import Logger from 'electron-log'
import fs from 'node:fs'
import path from 'node:path'

// Use userData directory for the database in production, current directory in dev
const dbPath = app.isPackaged
  ? path.join(app.getPath('userData'), 'data.sqlite')
  : './data.sqlite'

// Ensure the directory exists
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Connect to your local SQLite file
const sqlite = new BetterSqlite3(dbPath)

// Create the Drizzle client
export const db = drizzle(sqlite)

Logger.info('ruda', app)
Logger.info('ruda', app.isPackaged)
// Run migrations automatically in production
if (app.isPackaged) {
  Logger.info('I do run...')
  try {
    // In production, migrations are bundled with the app
    const migrationsFolder = path.join(process.resourcesPath, 'drizzle')
    migrate(db, { migrationsFolder })
    Logger.info('Database migrations applied successfully')
  } catch (error) {
    Logger.error('Failed to apply migrations:', error)
  }
}
