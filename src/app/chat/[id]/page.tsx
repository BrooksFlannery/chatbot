'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { ChatData } from '@/lib/definitions/types';
import { chatSchema } from '@/lib/definitions/zod';

export default function Chat() {
  const { id: chatId } = useParams();
  const [loadingMsgs, setLoadingMsg] = useState<boolean>(true);
  const [loadingChat, setLoadingChat] = useState<boolean>(true);
  const [loadingRes, setLoadingRes] = useState<boolean>(false);
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
      setLoadingChat(false);
    })
    .catch((err) => {
      console.error('Failed to fetch chat history:', err);
      setChat(undefined);
      setLoadingChat(false);
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
          setLoadingMsg(false);
        })
        .catch((err) => {
          console.error('Failed to fetch chat history:', err);
          setMessages([]);
          setLoadingMsg(false);
        });
    }

 async function sendMsg(msg: string) {
  setLoadingRes(true);
  
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

    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    const aiMessageId = `ai-${Date.now()}`; // Use timestamp for unique ID
    let aiMessageContent = ''; // Track content separately
    let buffer = ''; // Move buffer outside the loop

    try {
      // Create AI message placeholder
      const newAiMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
      };
      setMessages(prev => [...prev, newAiMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += value; // Accumulate chunks
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const content = JSON.parse(line.slice(2));
              const textToAdd = content.textDelta || content.text || content; // Handle different response formats
              
              aiMessageContent += textToAdd; // Update our local content tracker
              
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

      // Save AI message to database using the accumulated content
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
          // Update the message with the real database ID
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
    setLoadingRes(false);
  }
}

  return (
    <div>

      {loadingChat &&
      <div>Loading Chat Info...</div>}
      {!loadingChat &&
      <div>{JSON.stringify(chat.chatName)}</div>}

      {loadingMsgs &&
      <div>Loading Messages...</div>}
      {!loadingMsgs &&
      messages.map((message, i) => {
        return(
        <div key={i} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.content}
        </div>)
      })}

      {loadingRes && (
        <div className="whitespace-pre-wrap">
          AI: <span className="animate-pulse">Thinking...</span>
        </div>
      )}

          <form onSubmit={e => {
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
          disabled={loadingChat || loadingRes}//i think this might be weird
          autoFocus
        />
        <button type="submit" disabled={loadingRes || !input}>
          {loadingRes ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}