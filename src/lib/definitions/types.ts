export type UserData = {
    id: number;
    userName: string;
    email: string;
    createdAt:string;//is there some timestamp type idk
}

export type ChatData = {
    id: number;
    userId: number;
    chatName: string;
    createdAt: string;
}

export type MsgData = {
    id: number;
    chatId: number;
    content: string;
    createdAt;
}
