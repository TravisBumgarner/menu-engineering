import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

// Connect to your local SQLite file
const sqlite = new Database("./data.sqlite");

// Create the Drizzle client
export const db = drizzle(sqlite);