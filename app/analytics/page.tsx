"use client";

import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock3,
  FileText,
  MessageCircle,
} from "lucide-react";

const stats = [
  {
    title: "AI Generations",
    value: "1,248",
    change: "+32%",
    positive: true,
    icon: Sparkles,
  },
  {
    title: "Documents Processed",
    value: "156",
    change: "+15%",
    positive: true,
    icon: FileText,
  },
  {
    title: "AI Conversations",
    value: "324",
    change: "+18%",
    positive: true,
    icon: MessageCircle,
  },
  {
    title: "Hours Saved",
    value: "48",
    change: "+25%",
    positive: true,
    icon: Clock3,
  },
];

const usage = [42, 55, 48, 68, 61, 78, 92];

export default function Analytics() {
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
            <SidebarItem label="Templates" href="/templates" />
            <SidebarItem label="Analytics" href="/analytics" active />
            <SidebarItem label="Settings" href="/settings" />
          </nav>
        </aside>

        {/* Main */}
        <section className="flex-1">
          <header className="flex h-20 items-center justify-between border-b border-[#eee7dc] bg-white px-6 lg:px-10">
            <div>
              <h2 className="text-lg font-semibold">Analytics</h2>
              <p className="text-xs text-zinc-500">
                Track your AI workspace usage
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8a35d] text-sm font-semibold text-white">
              SB
            </div>
          </header>

          <div className="p-6 lg:p-10">
            {/* Heading */}
            <div>
              <h1 className="text-2xl font-bold">Analytics Overview</h1>

              <p className="mt-1 text-sm text-zinc-500">
                Understand how you're using your AI workspace.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.title}
                    className="rounded-xl border border-[#e8dfd0] bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-zinc-500">
                        {stat.title}
                      </p>

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                        <Icon size={16} />
                      </div>
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                      <p className="text-2xl font-bold">{stat.value}</p>

                      <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                        <TrendingUp size={13} />
                        {stat.change}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts */}
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              {/* Usage chart */}
              <div className="rounded-xl border border-[#e8dfd0] bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">AI Usage</h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      Generations over the last 7 days
                    </p>
                  </div>

                  <BarChart3 size={19} className="text-[#a66b16]" />
                </div>

                <div className="mt-8 flex h-56 items-end gap-3">
                  {usage.map((height, index) => (
                    <div
                      key={index}
                      className="flex h-full flex-1 items-end"
                    >
                      <div
                        className="w-full rounded-t-md bg-[#d8a35d]"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-between text-xs text-zinc-400">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>

              {/* Activity breakdown */}
              <div className="rounded-xl border border-[#e8dfd0] bg-white p-6 shadow-sm">
                <h3 className="font-semibold">Activity Breakdown</h3>

                <p className="mt-1 text-xs text-zinc-500">
                  How you're using the assistant
                </p>

                <div className="mt-7 space-y-6">
                  <ActivityRow
                    label="Content Generation"
                    value="48%"
                    width="48%"
                  />

                  <ActivityRow
                    label="Document Analysis"
                    value="27%"
                    width="27%"
                  />

                  <ActivityRow
                    label="AI Chat"
                    value="17%"
                    width="17%"
                  />

                  <ActivityRow
                    label="Other"
                    value="8%"
                    width="8%"
                  />
                </div>
              </div>
            </div>

            {/* Usage summary */}
            <div className="mt-6 rounded-xl border border-[#e8dfd0] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                  <Clock3 size={18} />
                </div>

                <div>
                  <h3 className="font-semibold">Time Saved</h3>
                  <p className="text-xs text-zinc-500">
                    Estimated time saved through AI assistance
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-4xl font-bold">48 hours</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    saved this month
                  </p>
                </div>

                <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                  <TrendingUp size={16} />
                  25% increase
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ActivityRow({
  label,
  value,
  width,
}: {
  label: string;
  value: string;
  width: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-zinc-600">{label}</span>
        <span className="text-xs font-medium text-zinc-500">{value}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#f1ebe2]">
        <div
          className="h-full rounded-full bg-[#d8a35d]"
          style={{ width }}
        />
      </div>
    </div>
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