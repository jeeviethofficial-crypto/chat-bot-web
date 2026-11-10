import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Ensure this Route Handler is never statically evaluated during deployment
export const dynamic = 'force-dynamic';

// Initialize the Gemini client on demand using server-side environment variable.
// This ensures GEMINI_API_KEY is never exposed to the client browser.
function getGeminiClient(): GoogleGenAI {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Please add your API key to .env.local and restart next dev.'
    );
  }
  return new GoogleGenAI({ apiKey });
}

export interface ClientMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

// Low-latency Flash models with fallback cascade for high demand / retired endpoints.
// Gemini 2.0 and 2.5 models have been retired by Google in favor of Gemini 3.x Flash.
const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
].filter(Boolean) as string[];

function extractCleanErrorMessage(err: unknown): string {
  let message = '';
  if (err && typeof err === 'object') {
    const anyErr = err as Record<string, any>;
    message = anyErr.message || anyErr.error || '';
  } else if (typeof err === 'string') {
    message = err;
  }

  // Unwrap potential nested JSON strings returned by Google GenAI SDK
  for (let i = 0; i < 3; i++) {
    if (typeof message === 'string' && (message.trim().startsWith('{') || message.trim().startsWith('['))) {
      try {
        const parsed = JSON.parse(message);
        if (parsed?.error?.message) {
          message = parsed.error.message;
        } else if (parsed?.message) {
          message = parsed.message;
        } else if (parsed?.error && typeof parsed.error === 'string') {
          message = parsed.error;
        } else {
          break;
        }
      } catch {
        break;
      }
    } else {
      break;
    }
  }

  return (
    (typeof message === 'string' && message.trim()) ||
    'An unexpected error occurred while communicating with the Gemini API.'
  );
}

async function generateStreamWithFallback(ai: GoogleGenAI, contents: any[]) {
  const uniqueModels = Array.from(new Set(CANDIDATE_MODELS));
  let lastError: any = null;

  for (const model of uniqueModels) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction:
            'You are a helpful, friendly, and concise AI assistant embedded on a modern website. Format code blocks with language identifiers, use bullet points where helpful, and keep answers direct and clear.',
        },
      });

      return { responseStream, modelUsed: model };
    } catch (err: any) {
      lastError = err;
      const status = err?.status;
      // If 404 (model retired/superseded), 503 (temporary high demand), 429 (rate limit), or 500, try next candidate
      if (status === 404 || status === 503 || status === 429 || status === 500) {
        console.warn(`Model "${model}" returned HTTP ${status}. Retrying with next candidate...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Missing GEMINI_API_KEY. Please set GEMINI_API_KEY in your .env.local file.',
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: "messages" array is required.' },
        { status: 400 }
      );
    }

    // Limit history length to the last 30 messages to protect tokens and maintain low latency
    const rawMessages: ClientMessage[] = body.messages.slice(-30);

    // Format and sanitize messages for Gemini API
    const formattedContents = rawMessages
      .map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: (msg.content || '').trim() }],
      }))
      .filter((msg) => msg.parts[0].text.length > 0);

    if (formattedContents.length === 0) {
      return NextResponse.json(
        { error: 'Cannot process request with empty messages.' },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    // Call Gemini with intelligent fallback for resilient streaming
    const { responseStream, modelUsed } = await generateStreamWithFallback(
      ai,
      formattedContents
    );

    // Create a Web ReadableStream to pipe streaming text chunks to the client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (streamError: any) {
          console.error(`Error during stream chunk delivery from ${modelUsed}:`, streamError);
          controller.error(streamError);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-transform',
        'X-Gemini-Model': modelUsed,
      },
    });
  } catch (error: any) {
    console.error('Gemini Chat API Route Error:', error);
    const cleanMessage = extractCleanErrorMessage(error);
    return NextResponse.json(
      {
        error: cleanMessage,
      },
      { status: 500 }
    );
  }
}
