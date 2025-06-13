import { pgTable, uuid, varchar, timestamp, text, pgEnum, boolean } from "drizzle-orm/pg-core";

// Users table — matches Better Auth spec exactly
export const user = pgTable("user", {
  id: text('id').primaryKey(), // Changed back to text - Better Auth will generate IDs
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
});

export const session = pgTable("session", {
  id: text('id').primaryKey(), // Changed back to text
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }) // Changed back to text
});

export const chat = pgTable("chat", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => user.id), // Changed to text to match user.id
  chatName: varchar("chatName", { length: 256 }).default("New Chat"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export const roleEnum = pgEnum("role", ["user", "assistant", "tool", "system"]);

export const message = pgTable("message", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatId: uuid("chatId").notNull().references(() => chat.id),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  accessedAt: timestamp("accessedAt", { withTimezone: true }).defaultNow().notNull(),
  role: roleEnum("role").notNull(),
});