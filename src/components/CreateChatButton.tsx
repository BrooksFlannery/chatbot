"use client";
import { useRouter } from 'next/navigation';

export default function CreateChatButton() {
    const router = useRouter();

    async function handleCreateChat() {
      const userId = 1;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok || !data?.id) {
        console.error('Failed to create chat:', data);
        return;
      }

      router.push(`/chat/${data.id}`);
    
    }

  return <button className='create-button' onClick={handleCreateChat}>Create Chat</button>;
}