import { useRouter } from "next/navigation"

export default function Chats({chats}){
    const router = useRouter();
    return(
        <ul>
            {chats.map((chat)=> {
              return(
                <div className="chats" onClick={ () => router.push(`/chat/${chat.id}`)}
                  key={chat.id}> {chat.chat_name} {chat.created_at}</div>
              )
            })}
        </ul>
    )
}