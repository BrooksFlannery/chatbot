import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import type { CoreMessage } from 'ai';
import { db } from '@/server/db';
import { messageTable } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request, context: { params: { id: string } }) {
  const params = await context.params;
  const chatId = Number(params.id);

  if (isNaN(chatId)) {
    return new Response(JSON.stringify({ error: 'Invalid chat id' }), { status: 400 });
  }

  const body = (await req.json()) as { messages: CoreMessage[] };//i have no idea why im sending all the msgs i should just send the one i want to update...
  const messages = body.messages || [];
  
  const newMessage = messages[messages.length - 1];
  
  if (!newMessage) {
    return new Response(JSON.stringify({ error: 'No message provided' }), { status: 400 });
  }

  await db.insert(messageTable).values({
    chat_id: chatId,
    content: typeof newMessage.content === 'string' ? newMessage.content : JSON.stringify(newMessage.content),
  });

  const existingMessages = await db
    .select()
    .from(messageTable)
    .where(eq(messageTable.chat_id, chatId))
    .orderBy(messageTable.created_at);

  const dbMessages: CoreMessage[] = existingMessages.map(msg => ({
    role: 'assistant',
    content: msg.content,
  }));

  const result = streamText({
    model: openai('gpt-4-turbo'),
    system: 'You are a helpful assistant.',
    messages: dbMessages,
    onFinish: async (result) => {
      await db.insert(messageTable).values({
        chat_id: chatId,
        content: result.text,
      });
    },
  });

  return result.toDataStreamResponse();
}

export async function GET( req : Request, {params}: { params: { id: string } }) {
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
    role: 'assistant',//this is dumb i need to update db
    content: msg.content,
  }));

  return Response.json(formatted);
}