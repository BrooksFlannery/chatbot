'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { ChatData } from '@/lib/definitions/types';
import { chatSchema } from '@/lib/definitions/zod';
import { clientBotAPI } from '@/lib/api';

export default function Chat() {
  const api = new clientBotAPI();

  const { id: chatId } = useParams();
  const [thinking, setThinking] = useState<boolean>(false);
  const [responding, setResponding] = useState<boolean>(false);
  const [chat, setChat] = useState<ChatData | undefined>(undefined)
  
  const [input, setInput] = useState('');
  const [messages, setMsgs] = useState([]);

  useEffect(() => {
    if (!chatId) return;//maybe redirect here

    const numericChatId = Number(chatId);
   if (isNaN(numericChatId)) return; 

    api.getChat(numericChatId).then(setChat)
    api.getMsgs(numericChatId).then(setMsgs);//also maybe this is a good spot for the no waterfall thing?
  }, [chatId]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  const newUserMsg = {
    id: 'temp-user',
    role: 'user', 
    content: input,
  };

  setMsgs(prev => [...prev, newUserMsg]);
  setResponding(true);
  
  try {
    await api.postMsg(
      input, 
      Number(chatId), 
      setMsgs, 
      setThinking,
      setResponding,
    );
  } catch (error) {
    console.error('Failed to send message:', error);
  } finally {
    setResponding(false);
    setInput('');
  }
};


  return (
    <div className='chat-container'>

      {!chat &&
      <div>Loading Chat Info...</div>}
      {chat &&
      <div>{JSON.stringify(chat.chatName)}</div>}

      {!messages &&
      <div>Loading Messages...</div>}
      {messages && messages.map((message, i) => {
        return (
          <div
            key={i}
            className={`message ${message.role === 'user' ? 'user' : 'bot'}`}
          >
            {message.role === 'user' ? '' : 'AI: '}
            {message.content}
            {message.role === 'user' ? ': User' : ''}

          </div>

        );
      })}

      {thinking && (
        <div className="whitespace-pre-wrap">
          AI: <span className="animate-pulse">Thinking...</span>
        </div>
      )}

          <form className ="input-form" onSubmit={handleSubmit}>  
          <input
          value={input}
          placeholder="Say something..."
          onChange={(e) => {setInput(e.target.value)}}
          disabled={ responding }
          autoFocus
        />
        <button type="submit" disabled={responding || !chat}>
          {/* remember to disable on !input */}
          Send
        </button>
      </form>
    </div>
  );
}