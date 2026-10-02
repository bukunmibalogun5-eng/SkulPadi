"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  FileText,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";

const suggestions = [
  "Summarize my documents",
  "Help me write an article",
  "Analyze my data",
  "Create a marketing plan",
];

export default function Chat() {
  return (
    <main className="min-h-screen bg-[#faf7f0] text-zinc-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-[#e8dfd0] bg-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center gap-3 border-b border-[#eee7dc] px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#a66b16] text-white">
              <Sparkles size={19} />
            </div>

            <div>
              <h1 className="text-sm font-bold">AI Content</h1>
              <p className="text-xs text-zinc-500">Assistant</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-5">
            <SidebarItem label="Dashboard" href="/" />
            <SidebarItem label="New Project" href="/new-project" />
            <SidebarItem label="Documents" href="/documents" />
            <SidebarItem label="AI Chat" href="/chat" active />
            <SidebarItem label="Templates" href="/templates" />
            <SidebarItem label="Analytics" href="/analytics" />
            <SidebarItem label="Settings" href="/settings" />
          </nav>

          <div className="border-t border-[#eee7dc] p-4">
            <div className="rounded-xl bg-[#fbf4e8] p-4">
              <p className="text-xs font-semibold text-[#8a5b16]">
                AI Assistant
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Ask questions, generate content, and analyze your work.
              </p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <section className="flex min-h-screen flex-1 flex-col">
          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-[#eee7dc] bg-white px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e8dfd0] text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
              >
                <ArrowLeft size={17} />
              </Link>

              <div>
                <h2 className="text-lg font-semibold">AI Chat</h2>
                <p className="text-xs text-zinc-500">
                  Your AI-powered workspace
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="hidden items-center gap-2 rounded-lg border border-[#ded5c7] bg-white px-4 py-2 text-sm font-medium sm:flex">
                <Plus size={16} />
                New Chat
              </button>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8a35d] text-sm font-semibold text-white">
                SB
              </div>
            </div>
          </header>

          {/* Chat area */}
          <div className="flex flex-1 flex-col">
            {/* Messages */}
            <div className="flex flex-1 items-center justify-center px-6 py-12">
              <div className="w-full max-w-3xl">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#a66b16] text-white shadow-sm">
                    <Bot size={30} />
                  </div>

                  <h1 className="mt-6 text-2xl font-bold">
                    How can I help you today?
                  </h1>

                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-500">
                    Ask questions, create content, summarize documents, or
                    analyze information with your AI assistant.
                  </p>
                </div>

                {/* Suggestions */}
                <div className="mt-10 grid gap-3 sm:grid-cols-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      className="flex items-center gap-3 rounded-xl border border-[#e8dfd0] bg-white p-4 text-left text-sm transition hover:border-[#d8a35d] hover:bg-[#fffdf9]"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                        <Sparkles size={15} />
                      </div>

                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-[#eee7dc] bg-white px-6 py-5 lg:px-10">
              <div className="mx-auto max-w-3xl">
                <div className="rounded-xl border border-[#ded5c7] bg-white p-2 shadow-sm focus-within:border-[#a66b16] focus-within:ring-2 focus-within:ring-[#a66b16]/10">
                  <div className="flex items-end gap-2">
                    <textarea
                      rows={1}
                      placeholder="Ask anything..."
                      className="max-h-32 min-h-11 flex-1 resize-none border-0 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-zinc-400"
                    />

                    <button
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#a66b16] text-white transition hover:bg-[#8e5a12]"
                      aria-label="Send message"
                    >
                      <Send size={17} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between px-3 pb-1 pt-1">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <MessageCircle size={13} />
                      AI Assistant
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <FileText size={13} />
                      Documents available
                    </div>
                  </div>
                </div>

                <p className="mt-2 text-center text-[11px] text-zinc-400">
                  AI-generated responses may contain mistakes. Check important
                  information.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SidebarItem({
  label,
  href,
  active = false,
}: {
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2.5 text-sm transition ${
        active
          ? "bg-[#fbf1df] font-semibold text-[#9a6317]"
          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
      }`}
    >
      {label}
    </Link>
  );
}