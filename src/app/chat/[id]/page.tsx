'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { id: chatId } = useParams();
  const [initialMessages, setInitialMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial messages from database
  useEffect(() => {
    if (!chatId) return;
    
    fetch(`/api/chat/${chatId}/messages`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setInitialMessages(data);
        } else {
          console.error('Unexpected data from API:', data);
          setInitialMessages([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch chat history:', err);
        setInitialMessages([]);
        setLoading(false);
      });
  }, [chatId]);

  // Use the AI SDK's useChat hook with proper configuration
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: `/api/chat/${chatId}/messages`,
    initialMessages: initialMessages,
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  if (loading) {
    return <div>Loading chat...</div>;
  }

  return (
    <div>
      {/* Render messages */}
      {messages.map((message, i) => (
        <div key={i} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.content}
        </div>
      ))}

      {/* Show loading indicator while AI is responding */}
      {isLoading && (
        <div className="whitespace-pre-wrap">
          AI: <span className="animate-pulse">Thinking...</span>
        </div>
      )}

      {/* Form using AI SDK's built-in handlers */}
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
          disabled={isLoading}
          autoFocus
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}