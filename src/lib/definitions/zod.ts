import {string, z} from 'zod';

export const userSchema = z.object({
    id: z.number(),
    userName: z.string().max(256),
    email: z.string().max(256),
    createdAt: z.preprocess((val) => new Date(val as string), z.date()),
})

export const chatSchema = z.object({
    id: z.number(),
    userId: z.number(),
    chatName: z.string().max(256),
    createdAt: z.preprocess((val) => new Date(val as string), z.date())
})

export const roleEnumValues = ['user', 'assistant', 'tool', 'system'] as const;

export const messageSchema = z.object({
    id: z.number(),
    chatId: z.number(),
    content: z.string(),
    role: z.enum(roleEnumValues),
    createdAt: z.preprocess((val) => new Date(val as string), z.date()),
    accessedAt: z.preprocess((val) => new Date(val as string), z.date())
})

