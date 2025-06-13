'use client'

import { redirect } from 'next/navigation';
import CreateChatButton from "@/components/CreateChatButton";
import Chats from '@/components/Chats';
import { authClient } from '@/lib/auth-client';
authClient

export default async function Page() {
  const {
    data: session
  } = authClient.useSession()
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="sidebar">
      {/* <CreateChatButton />
            <Chats /> */}
    </div>
  );
}