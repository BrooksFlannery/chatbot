import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { chatTable } from '@/server/db/schema';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const [newChat] = await db
      .insert(chatTable)
      .values({
        user_id:userId,
      })
      .returning({ id: chatTable.id });

    return NextResponse.json({ id: newChat.id });
  } catch (error) {
    console.error('Error in /api/chat POST:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

