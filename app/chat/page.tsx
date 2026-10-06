"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  LayoutDashboard,
  Plus,
  FileText,
  MessageCircle,
  PanelsTopLeft,
  BarChart3,
  Settings,
  Send,
  Trash2,
  Bot,
  User,
  LoaderCircle,
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

const welcomeMessage: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm your AI Content Assistant. I can help you brainstorm ideas, improve your writing, summarize content, and work with your documents.",
  createdAt: new Date().toISOString(),
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    welcomeMessage,
  ]);

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  /*
   * Load saved conversation from localStorage.
   *
   * We wait until this finishes before allowing the
   * messages state to be written back to localStorage.
   */
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");

    if (savedMessages) {
      try {
        const parsedMessages: Message[] =
          JSON.parse(savedMessages);

        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          setMessages(parsedMessages);
        }
      } catch {
        console.error("Could not load saved chat messages.");
      }
    }

    setIsLoaded(true);
  }, []);

  /*
   * Save conversation after it has been loaded.
   *
   * The isLoaded check prevents the initial welcome message
   * from overwriting an existing conversation.
   */
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    localStorage.setItem(
      "chatMessages",
      JSON.stringify(messages)
    );
  }, [messages, isLoaded]);

  function handleSendMessage() {
    const trimmedInput = input.trim();

    if (!trimmedInput || isThinking) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedInput,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setIsThinking(true);

    /*
     * Temporary simulated AI response.
     *
     * We will replace this with a real AI API later.
     */
    setTimeout(() => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: generateResponse(trimmedInput),
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);

      setIsThinking(false);
    }, 900);
  }

  function handleClearChat() {
    setMessages([welcomeMessage]);
    localStorage.removeItem("chatMessages");
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }

  return (
    <main className="min-h-screen bg-[#faf7f0] text-zinc-900">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-[#e8dfd0] bg-white lg:flex lg:flex-col">

          {/* Logo */}
          <div className="flex h-20 items-center gap-3 border-b border-[#eee7dc] px-6">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#a66b16] text-white">
              <Sparkles size={19} />
            </div>

            <div>
              <h1 className="text-sm font-bold">
                AI Content
              </h1>

              <p className="text-xs text-zinc-500">
                Assistant
              </p>
            </div>

          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-5">

            <SidebarItem
              icon={<LayoutDashboard size={17} />}
              label="Dashboard"
              href="/"
            />

            <SidebarItem
              icon={<Plus size={17} />}
              label="New Project"
              href="/new-project"
            />

            <SidebarItem
              icon={<FileText size={17} />}
              label="Documents"
              href="/documents"
            />

            <SidebarItem
              icon={<MessageCircle size={17} />}
              label="AI Chat"
              href="/chat"
              active
            />

            <SidebarItem
              icon={<PanelsTopLeft size={17} />}
              label="Templates"
              href="/templates"
            />

            <SidebarItem
              icon={<BarChart3 size={17} />}
              label="Analytics"
              href="/analytics"
            />

            <SidebarItem
              icon={<Settings size={17} />}
              label="Settings"
              href="/settings"
            />

          </nav>

          {/* AI Assistant */}
          <div className="border-t border-[#eee7dc] p-4">

            <div className="rounded-xl bg-[#fbf4e8] p-4">

              <p className="text-xs font-semibold text-[#8a5b16]">
                AI Assistant
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Create smarter content with AI-powered tools.
              </p>

            </div>

          </div>

        </aside>

        {/* Main */}
        <section className="flex min-h-screen flex-1 flex-col">

          {/* Header */}
          <header className="flex h-20 shrink-0 items-center justify-between border-b border-[#eee7dc] bg-white px-6 lg:px-10">

            <div>
              <h2 className="text-lg font-semibold">
                AI Chat
              </h2>

              <p className="text-xs text-zinc-500">
                Chat with your AI content assistant
              </p>
            </div>

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={handleClearChat}
                className="inline-flex items-center gap-2 rounded-lg border border-[#e8dfd0] bg-white px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
              >
                <Trash2 size={14} />
                Clear Chat
              </button>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8a35d] text-sm font-semibold text-white">
                SB
              </div>

            </div>

          </header>

          {/* Chat area */}
          <div className="flex flex-1 flex-col">

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-16">

              <div className="mx-auto max-w-4xl space-y-6">

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    {/* Assistant icon */}
                    {message.role === "assistant" && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                        <Bot size={17} />
                      </div>
                    )}

                    {/* Message */}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        message.role === "user"
                          ? "rounded-br-md bg-[#a66b16] text-white"
                          : "rounded-bl-md border border-[#e8dfd0] bg-white text-zinc-700"
                      }`}
                    >
                      {message.content}
                    </div>

                    {/* User icon */}
                    {message.role === "user" && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d8a35d] text-white">
                        <User size={16} />
                      </div>
                    )}

                  </div>
                ))}

                {/* Thinking indicator */}
                {isThinking && (
                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                      <Bot size={17} />
                    </div>

                    <div className="rounded-2xl rounded-bl-md border border-[#e8dfd0] bg-white px-4 py-3">

                      <div className="flex items-center gap-2 text-xs text-zinc-500">

                        <LoaderCircle
                          size={14}
                          className="animate-spin"
                        />

                        AI is thinking...

                      </div>

                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* Input area */}
            <div className="border-t border-[#eee7dc] bg-white px-6 py-5 lg:px-16">

              <div className="mx-auto max-w-4xl">

                <div className="rounded-xl border border-[#e8dfd0] bg-[#fcfaf6] p-2 shadow-sm">

                  <textarea
                    value={input}
                    onChange={(event) =>
                      setInput(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Ask your AI assistant anything..."
                    rows={3}
                    className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400"
                  />

                  <div className="flex items-center justify-between border-t border-[#eee7dc] px-2 pt-2">

                    <p className="text-xs text-zinc-400">
                      Press Enter to send • Shift + Enter for a new line
                    </p>

                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isThinking}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#a66b16] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#8e5a12] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send size={14} />
                      Send
                    </button>

                  </div>

                </div>

                <p className="mt-3 text-center text-[11px] text-zinc-400">
                  AI responses are currently simulated. Real AI
                  integration will be connected next.
                </p>

              </div>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}


/* -------------------------------- */
/* Sidebar Item                     */
/* -------------------------------- */

function SidebarItem({
  icon,
  label,
  href,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
        active
          ? "bg-[#fbf1df] font-semibold text-[#9a6317]"
          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}


/* -------------------------------- */
/* Temporary AI Response            */
/* -------------------------------- */

function generateResponse(message: string) {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi")
  ) {
    return "Hello! What would you like to work on today?";
  }

  if (
    lowerMessage.includes("summarize") ||
    lowerMessage.includes("summary")
  ) {
    return "I can help summarize your content. Once document processing is connected, you will be able to select a document and have me summarize it directly.";
  }

  if (
    lowerMessage.includes("write") ||
    lowerMessage.includes("content")
  ) {
    return "Absolutely. Tell me what you want to create, who it is for, and the tone you want, and I can help structure the content.";
  }

  if (lowerMessage.includes("document")) {
    return "Your Documents section is ready for uploads. Once the AI backend is connected, I will be able to work directly with those documents.";
  }

  return "I understand. This chat interface is working, but the real AI model has not been connected yet. The next step will be connecting this conversation to an AI API.";
}