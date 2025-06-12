'use client'

import CreateChatButton from "@/components/CreateChatButton";
import { useEffect, useState } from "react";
import Chats from '@/components/Chats'
import { clientBotAPI } from "@/lib/api";

export default function Page(){
  const [chats, setChats] = useState([]);
  const api = new clientBotAPI();

  useEffect(() => {
    api.getChats().then(setChats);
  }, []);
  
  return(
    <div className="sidebar">
      <CreateChatButton />
      {chats.length===0 && 
        <div>Loading Chats...</div>}
      {chats.length > 0 && <Chats chats={chats} /> }
    </div>
    )        
  }