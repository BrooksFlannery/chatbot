'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { ChatData } from '@/lib/definitions/types';
import { chatSchema } from '@/lib/definitions/zod';

export default function Chat() {
  const { id: chatId } = useParams();
  // const [loadingMsgs, setLoadingMsg] = useState<boolean>(true);
  // const [loadingChat, setLoadingChat] = useState<boolean>(true);
  const [thinking, setThinking] = useState<boolean>(false);
  const [responding, setResponding] = useState<boolean>(false);
  const [chat, setChat] = useState<ChatData | undefined>(undefined)
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!chatId) return;//maybe redirect here
    getChat();//these should prob get put into an api class implementing an interface like the tictactoe
    getMsg();//also maybe this is a good spot for the no waterfall thing?
  }, [chatId]);

  function getChat(){
    fetch(`/api/chat/${chatId}`)
    .then((res) => res.json())
    .then((data) => {
      if (data) {//this doesnt check for incorrect data
        const mappedData = {
          id: data.id,
          userId: data.user_id,
          chatName: data.chat_name,
          createdAt: new Date(data.created_at),
        };

        const parsedData = chatSchema.parse(mappedData)
        setChat(parsedData);
      } else {
        console.error('Unexpected data from API:', data);
        setChat(undefined)
      }
    })
    .catch((err) => {
      console.error('Failed to fetch chat history:', err);
      setChat(undefined);
    });
  }
  function getMsg(){
      fetch(`/api/chat/${chatId}/messages`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setMessages(data);
          } else {
            console.error('Unexpected data from API:', data);
            setMessages([]);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch chat history:', err);
          setMessages([]);
        });
    }

 async function sendMsg(msg: string) {
  setResponding(true);
  setThinking(true);
  
  try {
    const res = await fetch(`/api/chat/${chatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msg }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error('Failed to send message:', data);
      return;
    }

    if (!res.body) return;

    setThinking(false);
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    const aiMessageId = `ai-${Date.now()}`;
    let aiMessageContent = '';
    let buffer = '';

    try {
      const newAiMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
      };
      setMessages(prev => [...prev, newAiMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += value; 
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const content = JSON.parse(line.slice(2));
              aiMessageContent += content;
              
              setMessages(prev => 
                prev.map(msg =>
                  msg.id === aiMessageId
                    ? { ...msg, content: aiMessageContent }
                    : msg
                )
              );
            } catch (e) {
              console.error('Failed to parse streaming content:', e);
            }
          }
        }
      }

      if (aiMessageContent.trim()) {
        console.log('Saving AI message:', aiMessageContent);
        
        const saveResponse = await fetch(`/api/chat/${chatId}/messages/ai`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: aiMessageContent,
          }),
        });

        if (saveResponse.ok) {
          const savedMessage = await saveResponse.json();
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId 
                ? { ...msg, id: savedMessage.id.toString() }
                : msg
            )
          );
        } else {
          console.error('Failed to save AI message');
        }
      }

    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('Error in sendMsg:', error);
  } finally {
    setResponding(false);
    setThinking(false);
  }
}

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

          <form className ="input-form" onSubmit={e => {
            e.preventDefault();
            const newUserMsg = {
              id: 'temp-user',
              role: 'user',
              content: input,
            };

            setMessages(prev => [...prev, newUserMsg]);
              sendMsg(input);
            setInput('');
          }}>        
          <input
          value={input}
          placeholder="Say something..."
          onChange={(e) => {setInput(e.target.value)}}
          disabled={ responding }
          autoFocus
        />
        <button type="submit" disabled={responding || !input}>
          Send
        </button>
      </form>
    </div>
  );
}