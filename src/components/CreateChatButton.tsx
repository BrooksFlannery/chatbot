"use client";
import { useRouter } from 'next/navigation';
import { clientBotAPI } from '@/lib/api';

export default function CreateChatButton() {
  const api = new clientBotAPI();
  const router = useRouter();

  async function handleClick(){
    const chatId = await api.createChat();
    router.push(`/chat/${chatId}`);
  }

  return <button className='create-button' onClick={handleClick}>Create Chat</button>;
}