import { db } from '@/lib/db';
import { messageTable } from '@/lib/db/schema';

export async function POST(request: Request, {params}: { params: Promise<{id:string}>}) {
    const { id } = await params
    const chatId = Number(id);

    if (isNaN(chatId)) {
        return new Response(JSON.stringify({ error: 'Invalid chat id' }), { status: 400 });
    }
    const { content } = await request.json();
    const [savedMessage] = await db.insert(messageTable).values({
        chat_id: chatId,
        content: content,
        role: 'assistant'
    }).returning();
    return Response.json(savedMessage);
}