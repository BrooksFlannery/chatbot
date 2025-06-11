import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import type { CoreMessage } from 'ai';
import { db } from '@/lib/db';
import { messageTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export async function POST( req: NextRequest, { params }: { params: Promise<{id:string}>}) {
  const { id } = await params
  const chatId = Number(id);

  if (isNaN(chatId)) {
    return new Response(JSON.stringify({ error: 'Invalid chat id' }), { status: 400 });
  }

  const body = (await req.json())
  const message = JSON.stringify(body.msg);
  if (!message || typeof message !== 'string') {
    return new Response(JSON.stringify({ error: 'No message provided' }), { status: 400 });
  }

  await db.insert(messageTable).values({
    chat_id: chatId,
    content: message,
    role: 'user'
  });

  const messages = await db 
    .select()
    .from(messageTable)
    .where(eq(messageTable.chat_id, chatId))
    .orderBy(messageTable.created_at);

  const mappedMsgs = messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  })) as CoreMessage[];


  const result = streamText({
    model: openai('gpt-4-turbo'),
    system: "You are a helpful assistant, but the longer the conversation goes, the more rude you become.",
    messages: mappedMsgs,
  });

  return result.toDataStreamResponse();
}

export async function GET( req: NextRequest, { params }: { params: Promise<{id:string}>}) {
  const {id} = await params
  const chatId = Number(id);
  
  if (isNaN(chatId)) {
    return new Response(JSON.stringify({ error: 'Invalid chat id' }), { status: 400 });
  }

  const messages = await db
    .select()
    .from(messageTable)
    .where(eq(messageTable.chat_id, chatId))
    .orderBy(messageTable.created_at);

  const formatted = messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  return Response.json(formatted);
}