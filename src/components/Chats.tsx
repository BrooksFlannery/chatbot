import { useRouter } from "next/navigation"
import { clientBotAPI } from "@/lib/api";
import { useEffect, useState } from "react";



export default function Chats(){
    const [chats, setChats] = useState([]);
    const api = new clientBotAPI();
    const router = useRouter();


  useEffect(() => {
    api.getChats().then(setChats);
  }, []);

    return(
      <>
        {chats.length===0 && 
        <div>Loading Chats...</div>}
        {chats.length > 0 &&
          <ul>
              {chats.map((chat)=> {
                return(
                  <div className="chats" onClick={ () => router.push(`/chat/${chat.id}`)}
                    key={chat.id}> {chat.chat_name} {chat.created_at}</div>
                )
              })}
          </ul>}
        </>
    )
}