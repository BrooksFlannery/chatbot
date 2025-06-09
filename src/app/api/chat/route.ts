import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Call openai with model ID to get model object
    const model = openai('gpt-4-turbo');

    // Use the model's send() method to generate a response
    const completion = await model.send({
      system: 'You are a helpful assistant.',
      messages,
    });

    return new Response(JSON.stringify(completion), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
