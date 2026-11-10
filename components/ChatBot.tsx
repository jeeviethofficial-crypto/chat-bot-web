'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string; // ISO string for safe localStorage serialization
}

interface ChatBotProps {
  initialOpen?: boolean;
  mode?: 'floating' | 'embedded';
}

const STORAGE_KEY = 'gemini_chatbot_history_v1';

const STARTER_SUGGESTIONS = [
  'What are the key features of this website?',
  'How does Gemini 2.0 Flash differ from earlier models?',
  'Help me draft a concise product announcement.',
];

/**
 * Lightweight helper to render formatted text (code blocks, inline code, bold, lists)
 * without requiring heavy third-party markdown packages.
 */
function FormattedMessage({ content }: { content: string }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Split content by triple backticks for code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {parts.map((part, partIdx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trimStart().split('\n');
          const firstLine = lines[0].trim();
          const language = /^[a-zA-Z0-9_-]+$/.test(firstLine) ? firstLine : '';
          const codeBody = language ? lines.slice(1).join('\n') : lines.join('\n');

          return (
            <div
              key={partIdx}
              className="my-2 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950 text-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-400">
                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300">
                  {language || 'code'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeBody, partIdx)}
                  className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  {copiedIndex === partIdx ? (
                    <>
                      <svg className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.83-.07 1.67-.108 2.518-.108 1.05 0 2.083.058 3.097.172 1.037.116 1.83 1.007 1.83 2.052V7.5M9.75 16.5H6.375A2.625 2.625 0 013.75 13.875v-6.75A2.625 2.625 0 016.375 4.5h11.25a2.625 2.625 0 012.625 2.625v6.75a2.625 2.625 0 01-2.625 2.625H14.25m-4.5 0h4.5m-4.5 0l2.25 2.25m0 0l2.25-2.25" />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-3 font-mono text-xs text-emerald-300">
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        // Process inline styles: bold, inline code, and line breaks
        const paragraphs = part.split('\n\n');
        return (
          <div key={partIdx} className="space-y-2">
            {paragraphs.map((para, paraIdx) => {
              if (!para.trim()) return null;

              // Check for bullet list lines
              const lines = para.split('\n');
              return (
                <p key={paraIdx} className="leading-relaxed">
                  {lines.map((line, lineIdx) => {
                    const isBullet = line.trimStart().startsWith('- ') || line.trimStart().startsWith('* ');
                    const cleanLine = isBullet ? line.trimStart().slice(2) : line;

                    // Inline bold & code parser
                    const lineTokens = cleanLine.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

                    return (
                      <React.Fragment key={lineIdx}>
                        {isBullet && <span className="inline-block w-4 text-indigo-500 font-bold">•</span>}
                        {lineTokens.map((token, tIdx) => {
                          if (token.startsWith('`') && token.endsWith('`')) {
                            return (
                              <code
                                key={tIdx}
                                className="rounded bg-slate-200/80 px-1.5 py-0.5 font-mono text-xs text-indigo-700"
                              >
                                {token.slice(1, -1)}
                              </code>
                            );
                          }
                          if (token.startsWith('**') && token.endsWith('**')) {
                            return (
                              <strong key={tIdx} className="font-semibold text-slate-900">
                                {token.slice(2, -2)}
                              </strong>
                            );
                          }
                          return token;
                        })}
                        {lineIdx < lines.length - 1 && <br />}
                      </React.Fragment>
                    );
                  })}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function ChatBot({ initialOpen = false, mode = 'floating' }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load chat history from localStorage on mount (hydration-safe)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      // Fallback silently if localStorage is restricted
    }

    setMessages([
      {
        id: 'welcome-message',
        role: 'model',
        content:
          '👋 Hi! I am your AI assistant powered by **Gemini 2.0 Flash**. How can I assist you today?',
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  // Sync messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        // LocalStorage quota or privacy mode error ignored
      }
    }
  }, [messages]);

  // Auto-scroll to latest message
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (isOpen || mode === 'embedded') {
      scrollToBottom('auto');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, mode]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend ?? input).trim();
    if (!messageContent || isLoading) return;

    setError(null);
    setInput('');

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const assistantMsgId = `model-${Date.now()}`;

    try {
      const payloadMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payloadMessages }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server responded with status ${res.status}`
        );
      }

      if (!res.body) {
        throw new Error('ReadableStream is not supported by this browser.');
      }

      // Add empty placeholder for the assistant
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'model',
          content: '',
          timestamp: new Date().toISOString(),
        },
      ]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedResponse += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: accumulatedResponse }
              : msg
          )
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      console.error('Chat error:', err);
      const errorMessage =
        err?.message || 'Failed to reach Gemini. Please check your network and API key.';
      setError(errorMessage);

      setMessages((prev) =>
        prev.filter((msg) => !(msg.id === assistantMsgId && msg.content === ''))
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    handleStopGeneration();
    const freshMessage: Message = {
      id: `welcome-${Date.now()}`,
      role: 'model',
      content:
        '👋 Chat history cleared. How can I assist you with Gemini 2.0 Flash today?',
      timestamp: new Date().toISOString(),
    };
    setMessages([freshMessage]);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([freshMessage]));
    } catch {
      // Ignored
    }
    setError(null);
  };

  const handleCopyMessage = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  // IME-safe Enter-to-submit handler (modern-web-guidance)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      // Block premature submission during IME composition
      if (e.nativeEvent.isComposing || (e as any).keyCode === 229) {
        return;
      }

      handleSendMessage();
    }
  };

  const chatWindowContent = (
    <div
      role="region"
      aria-label="Gemini AI Chat Window"
      className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl backdrop-blur-sm"
    >
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-400 shadow-md">
            <svg
              className="h-5 w-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide">Gemini Assistant</h2>
              <span className="rounded bg-indigo-500/30 px-1.5 py-0.5 text-[10px] font-medium text-indigo-200">
                2.0 Flash
              </span>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              Online & Ready
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-slate-300">
          <button
            type="button"
            onClick={handleClearChat}
            title="Clear chat history"
            aria-label="Clear chat"
            className="rounded-lg p-1.5 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
          {mode === 'floating' && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              title="Close chat window"
              aria-label="Close chat"
              className="rounded-lg p-1.5 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4 text-sm leading-relaxed">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                    />
                  </svg>
                </div>
              )}

              <div
                className={`group relative max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                  isUser
                    ? 'rounded-br-xs bg-blue-600 text-white'
                    : 'rounded-bl-xs border border-slate-200/80 bg-white text-slate-800'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                ) : (
                  <FormattedMessage content={msg.content} />
                )}

                <div className="mt-1 flex items-center justify-between gap-3 text-[10px]">
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.content, msg.id)}
                      className="opacity-0 transition group-hover:opacity-100 text-slate-400 hover:text-slate-600 flex items-center gap-1"
                      title="Copy response"
                    >
                      {copiedMessageId === msg.id ? (
                        <span className="text-emerald-600 font-medium">Copied!</span>
                      ) : (
                        <span>Copy</span>
                      )}
                    </button>
                  )}
                  <span
                    className={`block font-light ml-auto ${
                      isUser ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {isUser && (
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-700 text-white shadow-xs">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-end gap-2 justify-start">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="rounded-2xl rounded-bl-xs border border-slate-200/80 bg-white px-4 py-3 shadow-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:0.2s]"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}

        {/* Suggested Prompts on New Conversations */}
        {messages.length === 1 && (
          <div className="pt-2">
            <p className="mb-2 text-xs font-medium text-slate-400">
              Suggested prompts:
            </p>
            <div className="flex flex-col gap-1.5">
              {STARTER_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(suggestion)}
                  className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-xs transition hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 shadow-xs"
          >
            <div className="flex items-start gap-2">
              <svg className="h-4 w-4 flex-shrink-0 text-rose-500 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">Chat Error</p>
                <p className="mt-0.5 text-rose-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <footer className="border-t border-slate-200/80 bg-white p-3">
        {isLoading && (
          <div className="mb-2 flex justify-center">
            <button
              type="button"
              onClick={handleStopGeneration}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-xs hover:bg-slate-50 hover:text-slate-900"
            >
              <span className="h-2 w-2 rounded-xs bg-slate-600"></span>
              Stop generating
            </button>
          </div>
        )}

        <form
          id="chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-end gap-2"
        >
          <label htmlFor="chat-input" className="sr-only">
            Your message
          </label>
          {/* Automatically fits contents with modern CSS field-sizing */}
          <textarea
            id="chat-input"
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Gemini anything... (Enter to send)"
            disabled={isLoading}
            style={{ fieldSizing: 'content' as any }}
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
          <span>Shift + Enter for new line</span>
          <span>Powered by @google/genai</span>
        </div>
      </footer>
    </div>
  );

  if (mode === 'embedded') {
    return <div className="h-[600px] w-full max-w-xl">{chatWindowContent}</div>;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Chatbot"
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500"></span>
          </span>

          <svg
            className="h-7 w-7 transition-transform group-hover:rotate-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.8"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.892-.892c.162-.734.42-1.428.756-2.057C3.96 16.52 3 14.39 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="h-[560px] w-[380px] max-w-[calc(100vw-2rem)] sm:w-[420px]">
          {chatWindowContent}
        </div>
      )}
    </div>
  );
}
