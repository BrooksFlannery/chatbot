import { pgTable, integer, text, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userTable = pgTable("users", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  // author_id: integer(),//maybe later this will be useful
  user_name: varchar({ length: 256 }).notNull(),
  email: varchar({ length: 256 }).notNull(),
  created_at: timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const chatTable = pgTable("chats", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  user_id: integer().notNull().references(() => userTable.id),
  chat_name: varchar({ length: 256 }).default(sql`'New Chat'`),
  created_at: timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const roleEnum = pgEnum('role', ['user', 'assistant', 'tool', 'system']);

export const messageTable = pgTable("messages", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  chat_id: integer().notNull().references(() => chatTable.id),
  content: text().notNull(),
  created_at: timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  role: roleEnum('role').notNull(),
  accessed_at: timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});
