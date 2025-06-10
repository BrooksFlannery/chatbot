import { db } from '@/server/db';
import { messageTable } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(_: Request, { params }: { params: { id: string } }) {
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
