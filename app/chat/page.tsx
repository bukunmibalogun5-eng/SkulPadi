
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type ChatRow = {
  id: string;
  role: string;
  content: string;
  created_at: string;
  interaction_id: string | null;
};

type DocumentOption = {
  id: string;
  name: string;
};

const welcomeMessage: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm your AI Content Assistant. I can help you brainstorm ideas, improve your writing, summarize content, and work with your documents. Select a document below whenever you want me to use its contents.",
  createdAt: "2026-01-01T00:00:00.000Z",
};

export default function Chat() {
  const [supabase] = useState(() => createClient());

  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [documents, setDocuments] = useState<DocumentOption[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);

  const loadMessages = useCallback(async () => {
    setIsLoadingHistory(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "Your session could not be verified. Please sign in again."
        );
      }

      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, role, content, created_at, interaction_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const rows = (data ?? []) as ChatRow[];

      const savedMessages: Message[] = rows
        .filter(
          (row) =>
            (row.role === "user" || row.role === "assistant") &&
            typeof row.content === "string"
        )
        .map((row) => ({
          id: row.id,
          role: row.role as Message["role"],
          content: row.content,
          createdAt: row.created_at,
        }));

      const latestInteraction = [...rows]
        .reverse()
        .find(
          (row) =>
            typeof row.interaction_id === "string" &&
            row.interaction_id.length > 0
        );

      setMessages(
        savedMessages.length > 0 ? savedMessages : [welcomeMessage]
      );
      setInteractionId(latestInteraction?.interaction_id ?? null);
    } catch (error) {
      console.error("Failed to load chat history:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not load your saved chat history."
      );
    } finally {
      setIsLoadingHistory(false);
    }
  }, [supabase]);

  const loadDocuments = useCallback(async () => {
    setIsLoadingDocuments(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "Please sign in again to load your documents."
        );
      }

      const { data, error } = await supabase
        .from("documents")
        .select("id, name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDocuments((data ?? []) as DocumentOption[]);

      // Clear the selection if the selected document no longer exists.
      setSelectedDocumentId((currentId) => {
        if (!currentId) return "";

        const stillExists = (data ?? []).some(
          (document) => document.id === currentId
        );

        return stillExists ? currentId : "";
      });
    } catch (error) {
      console.error("Failed to load documents:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not load your documents."
      );
    } finally {
      setIsLoadingDocuments(false);
    }
  }, [supabase]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadMessages();
      void loadDocuments();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadMessages, loadDocuments]);

  async function handleSendMessage() {
    const trimmedInput = input.trim();

    if (
      !trimmedInput ||
      isThinking ||
      isLoadingHistory
    ) {
      return;
    }

    setErrorMessage("");
    setIsThinking(true);
    setInput("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      const userId = user.id;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmedInput,
        createdAt: new Date().toISOString(),
      };

      // Save the user's message before calling Gemini.
      const {
        data: savedUserRow,
        error: insertUserError,
      } = await supabase
        .from("chat_messages")
        .insert({
          user_id: userId,
          role: "user",
          content: trimmedInput,
          interaction_id: interactionId,
        })
        .select("id, created_at")
        .single();

      if (insertUserError) throw insertUserError;

      userMessage.id = savedUserRow.id;
      userMessage.createdAt = savedUserRow.created_at;

      setMessages((current) => {
        const withoutWelcome = current.filter(
          (message) => message.id !== "welcome"
        );

        return [...withoutWelcome, userMessage];
      });

      // Send the selected document ID, not the document text.
      // The server retrieves and verifies the document in Supabase.
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedInput,
          previousInteractionId: interactionId,
          documentId: selectedDocumentId || null,
        }),
      });

      // Read the response safely in case the server returns
      // an unexpected non-JSON error.
      const responseText = await response.text();

      let data: {
        reply?: unknown;
        interactionId?: unknown;
        error?: string;
      };

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "The server returned an invalid response. Check the terminal for errors."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to get an AI response."
        );
      }

      if (typeof data.reply !== "string") {
        throw new Error(
          "The AI returned an invalid response."
        );
      }

      const nextInteractionId =
        typeof data.interactionId === "string"
          ? data.interactionId
          : interactionId;

      // Save Gemini's complete response to Supabase.
      const {
        data: savedAssistantRow,
        error: insertAssistantError,
      } = await supabase
        .from("chat_messages")
        .insert({
          user_id: userId,
          role: "assistant",
          content: data.reply,
          interaction_id: nextInteractionId,
        })
        .select("id, created_at")
        .single();

      if (insertAssistantError) throw insertAssistantError;

      const assistantMessage: Message = {
        id: savedAssistantRow.id,
        role: "assistant",
        content: data.reply,
        createdAt: savedAssistantRow.created_at,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);

      setInteractionId(nextInteractionId);
    } catch (error) {
      console.error("Chat error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsThinking(false);
    }
  }

  async function handleClearChat() {
    if (isThinking || isLoadingHistory) return;

    const confirmed = window.confirm(
      "Clear your saved chat history? This cannot be undone."
    );

    if (!confirmed) return;

    setErrorMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error(
          "Please sign in again to clear your chat."
        );
      }

      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      setMessages([welcomeMessage]);
      setInteractionId(null);
    } catch (error) {
      console.error("Failed to clear chat:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not clear your saved chat history."
      );
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  }

  return (
    <main className="min-h-screen bg-[#faf7f0] text-zinc-900">
      <div className="flex min-h-screen">
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

        <section className="flex min-h-screen flex-1 flex-col">
          <header className="flex h-20 shrink-0 items-center justify-between border-b border-[#eee7dc] bg-white px-6 lg:px-10">
            <div>
              <h2 className="text-lg font-semibold">AI Chat</h2>
              <p className="text-xs text-zinc-500">
                Chat with your AI content assistant
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void handleClearChat()}
                disabled={isThinking || isLoadingHistory}
                className="inline-flex items-center gap-2 rounded-lg border border-[#e8dfd0] bg-white px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={14} />
                Clear Chat
              </button>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8a35d] text-sm font-semibold text-white">
                <User size={16} />
              </div>
            </div>
          </header>

          <div className="flex flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-16">
              <div className="mx-auto max-w-4xl space-y-6">
                {isLoadingHistory && (
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                    Loading your saved chat...
                  </div>
                )}

                {errorMessage && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    <p>{errorMessage}</p>

                    <button
                      type="button"
                      onClick={() => {
                        void loadMessages();
                        void loadDocuments();
                      }}
                      className="mt-2 font-semibold underline"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!isLoadingHistory &&
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                          <Bot size={17} />
                        </div>
                      )}

                      <div
                        className={`min-w-0 max-w-[85%] overflow-hidden rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[75%] ${
                          message.role === "user"
                            ? "whitespace-pre-wrap rounded-br-md bg-[#a66b16] text-white"
                            : "rounded-bl-md border border-[#e8dfd0] bg-white text-zinc-700"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="break-words">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({ children }) => (
                                  <h1 className="mb-3 mt-4 text-xl font-bold leading-7 text-zinc-900 first:mt-0">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="mb-2 mt-4 text-lg font-bold leading-7 text-zinc-900 first:mt-0">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="mb-2 mt-3 text-base font-semibold leading-6 text-zinc-900 first:mt-0">
                                    {children}
                                  </h3>
                                ),
                                p: ({ children }) => (
                                  <p className="mb-3 last:mb-0">
                                    {children}
                                  </p>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-zinc-900">
                                    {children}
                                  </strong>
                                ),
                                em: ({ children }) => (
                                  <em className="italic">{children}</em>
                                ),
                                ul: ({ children }) => (
                                  <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="pl-1">{children}</li>
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote className="my-3 border-l-4 border-[#d8a35d] pl-3 italic text-zinc-600">
                                    {children}
                                  </blockquote>
                                ),
                                a: ({ href, children }) => {
                                  const safeHref =
                                    href &&
                                    /^(https?:|mailto:)/i.test(href)
                                      ? href
                                      : undefined;

                                  return (
                                    <a
                                      href={safeHref}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#a66b16] underline underline-offset-2"
                                    >
                                      {children}
                                    </a>
                                  );
                                },
                                code: ({ children, className }) => (
                                  <code
                                    className={`rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-800 ${
                                      className ?? ""
                                    }`}
                                  >
                                    {children}
                                  </code>
                                ),
                                pre: ({ children }) => (
                                  <pre className="my-3 max-w-full overflow-x-auto whitespace-pre rounded-lg bg-zinc-900 p-3 text-xs leading-5 text-white">
                                    {children}
                                  </pre>
                                ),
                                table: ({ children }) => (
                                  <div className="my-3 max-w-full overflow-x-auto">
                                    <table className="w-full border-collapse text-left text-xs">
                                      {children}
                                    </table>
                                  </div>
                                ),
                                th: ({ children }) => (
                                  <th className="border border-[#e8dfd0] bg-[#fbf4e8] px-3 py-2 font-semibold text-zinc-900">
                                    {children}
                                  </th>
                                ),
                                td: ({ children }) => (
                                  <td className="border border-[#e8dfd0] px-3 py-2">
                                    {children}
                                  </td>
                                ),
                                hr: () => (
                                  <hr className="my-4 border-[#e8dfd0]" />
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          message.content
                        )}
                      </div>

                      {message.role === "user" && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d8a35d] text-white">
                          <User size={16} />
                        </div>
                      )}
                    </div>
                  ))}

                {isThinking && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                      <Bot size={17} />
                    </div>

                    <div
                      role="status"
                      aria-live="polite"
                      className="rounded-2xl rounded-bl-md border border-[#e8dfd0] bg-white px-4 py-3"
                    >
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

            <div className="border-t border-[#eee7dc] bg-white px-6 py-5 lg:px-16">
              <div className="mx-auto max-w-4xl">
                <div className="rounded-xl border border-[#e8dfd0] bg-[#fcfaf6] p-2 shadow-sm">
                  <div className="px-3 pb-2">
                    <label
                      htmlFor="chat-document"
                      className="mb-1 block text-xs font-medium text-zinc-600"
                    >
                      Use a document (optional)
                    </label>

                    <select
                      id="chat-document"
                      value={selectedDocumentId}
                      onChange={(event) =>
                        setSelectedDocumentId(event.target.value)
                      }
                      disabled={
                        isLoadingDocuments || isThinking
                      }
                      className="w-full rounded-lg border border-[#e8dfd0] bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-[#a66b16] disabled:opacity-60"
                    >
                      <option value="">
                        {isLoadingDocuments
                          ? "Loading documents..."
                          : documents.length === 0
                            ? "No saved documents available"
                            : "General chat — no document selected"}
                      </option>

                      {documents.map((document) => (
                        <option
                          key={document.id}
                          value={document.id}
                        >
                          {document.name}
                        </option>
                      ))}
                    </select>

                    {selectedDocumentId && (
                      <p className="mt-1 text-xs text-zinc-500">
                        Your question will be answered using the selected document.
                      </p>
                    )}

                    {!isLoadingDocuments &&
                      documents.length === 0 && (
                        <Link
                          href="/documents"
                          className="mt-1 inline-block text-xs text-[#a66b16] underline underline-offset-2"
                        >
                          Upload a document
                        </Link>
                      )}
                  </div>

                  <textarea
                    value={input}
                    onChange={(event) =>
                      setInput(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder={
                      selectedDocumentId
                        ? "Ask a question about your selected document..."
                        : "Ask your AI assistant anything..."
                    }
                    rows={3}
                    aria-label="Message your AI assistant"
                    disabled={isLoadingHistory}
                    className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400"
                  />

                  <div className="flex items-center justify-between border-t border-[#eee7dc] px-2 pt-2">
                    <p className="text-xs text-zinc-400">
                      Press Enter to send • Shift + Enter for a new line
                    </p>

                    <button
                      type="button"
                      onClick={() => void handleSendMessage()}
                      disabled={
                        !input.trim() ||
                        isThinking ||
                        isLoadingHistory
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-[#a66b16] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#8e5a12] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send size={14} />
                      Send
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-center text-[11px] text-zinc-400">
                  AI responses are generated by Gemini.
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
