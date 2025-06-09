import type { CoreMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { messages: CoreMessage[] };
    const messages = body.messages;

    const result = streamText({
      model: openai('gpt-4-turbo'),
      system: 'You are a helpful assistant.',
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
