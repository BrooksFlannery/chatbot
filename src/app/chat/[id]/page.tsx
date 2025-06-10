'use client';

import { useChat } from '@ai-sdk/react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Chat() {
  const { id: chatId } = useParams();
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: `/api/chat/${chatId}`,
  });

  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!chatId) return;
    fetch(`/api/chat/${chatId}/messages`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHistory(data);
        } else {
          console.error('Unexpected data from API:', data);
          setHistory([]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch chat history:', err);
        setHistory([]);
      });
  }, [chatId]);

  const combinedMessages = [...history, ...messages];

  return (
    <div>
      {combinedMessages.map((m, i) => (
        <div key={i} className="whitespace-pre-wrap">
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.content}
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
          autoFocus
        />
      </form>
    </div>
  );
}
