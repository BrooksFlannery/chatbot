import {string, z} from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().max(256),
  emailVerified: z.union([z.date(), z.null()]),
  createdAt: z.preprocess((val) => new Date(val as string), z.date()),
  updatedAt: z.preprocess((val) => new Date(val as string), z.date()),
  firstName: z.string().max(256).optional(),
  lastName: z.string().max(256).optional(),
  image: z.string().url().optional(),
});


export const chatSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  chatName: z.string().max(256),
  createdAt: z.preprocess((val) => new Date(val as string), z.date()),
});


export const roleEnumValues = ['user', 'assistant', 'tool', 'system'] as const;

export const messageSchema = z.object({
  id: z.string().uuid(),
  chatId: z.string().uuid(),
  content: z.string(),
  role: z.enum(roleEnumValues),
  createdAt: z.preprocess((val) => new Date(val as string), z.date()),
  accessedAt: z.preprocess((val) => new Date(val as string), z.date()),
});

export const sessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  expiresAt: z.preprocess((val) => new Date(val as string), z.date()),
  createdAt: z.preprocess((val) => new Date(val as string), z.date()),
  updatedAt: z.preprocess((val) => new Date(val as string), z.date()),
  ip: z.string().max(256).optional(),
  userAgent: z.string().max(512).optional(),
  active: z.boolean().optional(),
});

