import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { chatTable, roleEnum } from '@/server/db/schema';
import { MsgData } from '@/lib/definitions/types';
import { eq } from 'drizzle-orm';


//get route next, must return array of messages. i should prob be defining message typs somewhere
export async function GET(req: NextRequest) {
  console.log('hello wordl')
  try{
    const userIdString  = req.nextUrl.searchParams.get('userId');//this is bad and a security vulnerability
    
    if (!userIdString) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const userId = Number(userIdString);

    const chats = await db
      .select()
      .from(chatTable)
      .where(eq(chatTable.user_id, userId))
      .orderBy(chatTable.created_at);

    return new Response(JSON.stringify(chats), { status: 200 });
  }catch (error){
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });//is this correct?
  }
}


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

