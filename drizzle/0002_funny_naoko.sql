ALTER TABLE "chats" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "chats" RENAME COLUMN "chatName" TO "chat_name";--> statement-breakpoint
ALTER TABLE "chats" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "chatId" TO "chat_id";--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "userName" TO "user_name";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "chats" DROP CONSTRAINT "chats_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_chatId_chats_id_fk";
--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;