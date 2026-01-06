import { SQL, sql } from 'drizzle-orm';
import { AnySQLiteColumn } from 'drizzle-orm/sqlite-core';


export function lower(email: AnySQLiteColumn): SQL {
  return sql`lower(${email})`;
}