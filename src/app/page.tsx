'use client'

import CreateChatButton from "@/components/CreateChatButton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page(){
  
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();


  
  useEffect(() => {
    getChats();
  }, []);
  
  return(
    <>
        <CreateChatButton />
        
        {loading && 
          <div>Loading Chats...</div>
        }
        {!loading &&
        chats.map((chat)=> {
          console.log(chat)
          return(
            <div onClick={ () => router.push(`/chat/${chat.id}`)}
              key={chat.id}> {chat.chat_name} {chat.created_at}</div>
          )
        })}
      </>
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
          setLoading(false)
    }
  }