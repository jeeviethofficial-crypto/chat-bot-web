'use client';

import React from 'react';
import ChatBot from '@/components/ChatBot';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Background Subtle Gradient Blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-100/60 blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 h-[450px] w-[450px] rounded-full bg-indigo-100/50 blur-3xl"></div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
              <svg
                className="h-5 w-5"
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
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Gemini<span className="text-blue-600">Next</span>
            </span>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-slate-900">
              Features
            </a>
            <a href="#architecture" className="transition hover:text-slate-900">
              Architecture
            </a>
            <a href="#quickstart" className="transition hover:text-slate-900">
              Quickstart
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900"
            >
              Get Gemini Key ↗
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative mx-auto max-w-6xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1 text-xs font-medium text-blue-700 shadow-xs backdrop-blur-xs">
            <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
            Powered by @google/genai & Gemini 3.8 Flash
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Clean, Minimal AI Chatbot for{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Next.js
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
            A production-ready chatbot widget built with Next.js App Router,
            TypeScript, Tailwind CSS, and the official Google Gen AI SDK with
            server-side streaming.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 shadow-xs">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Chatbot live in the bottom right corner
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <section id="features" className="mt-20">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Engineered for Simplicity & Performance
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Everything you need, nothing you don&apos;t.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                Gemini 3.8 Flash
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Utilizes the latest low-latency multimodal model from Google
                with multi-model fallback through the official <code>@google/genai</code> SDK.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                Real-Time Streaming
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Zero heavy streaming libraries needed. Native Web Streams
                ReadableStream delivers tokens progressively to the client.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                Secure & Isolated
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                The Gemini API key stays safe on the server inside{' '}
                <code>.env.local</code> and is never leaked to the browser.
              </p>
            </div>
          </div>
        </section>

        {/* Architecture & Flow Diagram */}
        <section
          id="architecture"
          className="mt-20 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm"
        >
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Clean Architecture Overview
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              A straightforward request-response pipeline designed for
              reliability:
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                1. Client
              </span>
              <h4 className="mt-1 font-semibold text-slate-800">
                ChatBot Component
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Dispatches conversation history to <code>/api/chat</code>,
                handles IME composition safely, and decodes streaming response.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                2. Server Route
              </span>
              <h4 className="mt-1 font-semibold text-slate-800">
                app/api/chat/route.ts
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Validates input, securely loads <code>GEMINI_API_KEY</code>, and
                invokes <code>ai.models.generateContentStream()</code>.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                3. Google AI
              </span>
              <h4 className="mt-1 font-semibold text-slate-800">
                Gemini 3.8 Flash
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Streams tokens back over HTTP chunked transfer encoding directly
                into the user interface.
              </p>
            </div>
          </div>
        </section>

        {/* Quickstart Setup Guide */}
        <section
          id="quickstart"
          className="mt-16 rounded-3xl bg-slate-900 p-8 text-white shadow-xl"
        >
          <h2 className="text-xl font-bold sm:text-2xl">
            Quickstart Configuration
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Create a <code>.env.local</code> file in your project root with your
            API key:
          </p>

          <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 border border-slate-800">
            <code>GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here</code>
          </pre>

          <p className="mt-4 text-xs text-slate-400">
            Don&apos;t have an API key? Get one for free at{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline hover:text-blue-300"
            >
              Google AI Studio
            </a>
            .
          </p>
        </section>
      </main>

      {/* Floating ChatBot Component */}
      <ChatBot />
    </div>
  );
}

