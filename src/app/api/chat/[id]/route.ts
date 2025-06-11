import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import type { CoreMessage } from 'ai';
import { db } from '@/lib/db';
import { chatTable, messageTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export async function GET( req : NextRequest, { params }: { params: { id: string } }) {
  const searchParams = await params;

  const chatId = Number(searchParams.id);
  if (isNaN(chatId)) {
    return new Response(JSON.stringify({ error: 'Invalid chat id' }), { status: 400 });
  }

  const [chat] = await db
    .select()
    .from(chatTable)
    .where(eq(chatTable.id, chatId))

  return new Response(JSON.stringify(chat));
}