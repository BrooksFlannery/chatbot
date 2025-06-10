import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import type { CoreMessage } from 'ai';
import { db } from '@/server/db';
import { messageTable } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

// post route that takes messages, new message, adds new message to db, then runs ai sdk on combined messages, then returns result(dont worry about saving result to db for now)
//get route that takes an chat id, filters db message table by it, then returns result
//app/api/chat/[id]/messages
export async function POST(req: Request, context: { params: { id: string } }) {
  const params = await context.params;
  const chatId = Number(params.id);

  if (isNaN(chatId)) {
    return new Response(JSON.stringify({ error: 'Invalid chat id' }), { status: 400 });
  }

  const body = (await req.json()) as { messages: CoreMessage[] };
  const newMessages = body.messages;

  const existingMessages = await db
    .select()
    .from(messageTable)
    .where(eq(messageTable.chat_id, chatId))
    .orderBy(messageTable.created_at);

  const dbMessages: CoreMessage[] = existingMessages.map(msg => ({
    role: 'assistant', // this is wrong bc ai thinks that is them
    content: msg.content,
  }));

  const allMessages = [...dbMessages, ...newMessages];

  const result = streamText({
    model: openai('gpt-4-turbo'),
    system: 'You are a helpful assistant.',
    messages: allMessages,
  });
  return result.toDataStreamResponse();
}

export async function GET( req : Request, { params }: { params: { id: string } }) {
  const chatId = Number(params.id);
  if (isNaN(chatId)) {
    return new Response(JSON.stringify({ error: 'Invalid chat id' }), { status: 400 });
  }

  const messages = await db
    .select()
    .from(messageTable)
    .where(eq(messageTable.chat_id, chatId))
    .orderBy(messageTable.created_at);

  const formatted = messages.map(msg => ({
    role: 'assistant',
    content: msg.content,
  }));

  return new Response(JSON.stringify(formatted));
}