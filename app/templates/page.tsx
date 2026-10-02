"use client";

import Link from "next/link";
import {
  FileText,
  Sparkles,
  Plus,
  Search,
  MoreVertical,
  Mail,
  Megaphone,
  FileEdit,
  Presentation,
} from "lucide-react";

const templates = [
  {
    title: "Blog Post",
    description: "Create engaging blog content with AI assistance.",
    category: "Content",
    icon: FileText,
  },
  {
    title: "Marketing Email",
    description: "Write professional marketing emails quickly.",
    category: "Marketing",
    icon: Mail,
  },
  {
    title: "Social Media Post",
    description: "Generate engaging social media content.",
    category: "Marketing",
    icon: Megaphone,
  },
  {
    title: "Business Report",
    description: "Create structured and professional reports.",
    category: "Business",
    icon: FileEdit,
  },
  {
    title: "Presentation",
    description: "Create an outline for an effective presentation.",
    category: "Business",
    icon: Presentation,
  },
  {
    title: "Product Description",
    description: "Generate clear and compelling product descriptions.",
    category: "Content",
    icon: Sparkles,
  },
];

export default function Templates() {
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
            <SidebarItem label="AI Chat" href="/chat" />
            <SidebarItem label="Templates" href="/templates" active />
            <SidebarItem label="Analytics" href="/analytics" />
            <SidebarItem label="Settings" href="/settings" />
          </nav>
        </aside>

        {/* Main */}
        <section className="flex-1">
          <header className="flex h-20 items-center justify-between border-b border-[#eee7dc] bg-white px-6 lg:px-10">
            <div>
              <h2 className="text-lg font-semibold">Templates</h2>
              <p className="text-xs text-zinc-500">
                Start creating with ready-made AI templates
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8a35d] text-sm font-semibold text-white">
              SB
            </div>
          </header>

          <div className="p-6 lg:p-10">
            {/* Heading */}
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-bold">Template Library</h1>

                <p className="mt-1 text-sm text-zinc-500">
                  Choose a template to start creating faster.
                </p>
              </div>

              <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#a66b16] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#8e5a12]">
                <Plus size={16} />
                Create Template
              </button>
            </div>

            {/* Search */}
            <div className="mt-7">
              <div className="relative max-w-xl">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                />

                <input
                  type="text"
                  placeholder="Search templates..."
                  className="w-full rounded-lg border border-[#ded5c7] bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#a66b16] focus:ring-2 focus:ring-[#a66b16]/10"
                />
              </div>
            </div>

            {/* Template cards */}
            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => {
                const Icon = template.icon;

                return (
                  <div
                    key={template.title}
                    className="group rounded-xl border border-[#e8dfd0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#d8a35d]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                        <Icon size={19} />
                      </div>

                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700">
                        <MoreVertical size={17} />
                      </button>
                    </div>

                    <h3 className="mt-5 text-sm font-semibold">
                      {template.title}
                    </h3>

                    <p className="mt-2 min-h-10 text-xs leading-5 text-zinc-500">
                      {template.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-[#f0e9de] pt-4">
                      <span className="rounded-full bg-[#fbf1df] px-2.5 py-1 text-[11px] font-medium text-[#8a5b16]">
                        {template.category}
                      </span>

                      <button className="text-xs font-medium text-[#a66b16] hover:underline">
                        Use template
                      </button>
                    </div>
                  </div>
                );
              })}
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