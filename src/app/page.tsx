'use client'

import CreateChatButton from "@/components/CreateChatButton";
import { useEffect, useState } from "react";
import Chats from '@/components/Chats'

export default function Page(){
  const [chats, setChats] = useState([]);

  useEffect(() => {
    getChats();//this should be in an api interface i think like the tictactoe
  }, []);
  
  return(
    <div className="sidebar">
      <CreateChatButton />
      {chats.length===0 && 
        <div>Loading Chats...</div>}
      {chats.length > 0 && <Chats chats={chats} /> }
    </div>
    )
    
    async function getChats(){
        const userId = 1;
        const res = await fetch("/api/chat?userId=1", {//this is not good, we should use cookies or something like that later on(security vulnerability bc anyone who has userId can get it)
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
    
        const data = await res.json();
    
        if (!res.ok) {
          console.error('Failed to get chats:', data);
          return;
        }
          setChats(data)
    }
  }