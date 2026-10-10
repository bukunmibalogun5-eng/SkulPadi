
"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Plus,
  FileText,
  MessageCircle,
  PanelsTopLeft,
  BarChart3,
  Settings,
  Upload,
  FilePlus2,
  Sparkles,
  TrendingUp,
  Clock3,
  ChevronRight,
  FolderOpen,
} from "lucide-react";

type Project = {
  id: string;
  name: string;
  description: string;
  type: string;
  aiEnabled: boolean;
  createdAt: string;
};

const defaultStats = [
  {
    label: "Total Projects",
    value: "0",
    change: "Projects created",
    icon: FileText,
  },
  {
    label: "Documents",
    value: "156",
    change: "15% this week",
    icon: FileText,
  },
  {
    label: "AI Generations",
    value: "1,248",
    change: "32% this week",
    icon: Sparkles,
  },
  {
    label: "Hours Saved",
    value: "48",
    change: "25% this week",
    icon: Clock3,
  },
];

const defaultActivities = [
  {
    title: "Marketing Strategy.docx",
    description: "Summarized • 2 min ago",
    icon: FileText,
  },
  {
    title: "Product Launch Ideas",
    description: "AI Chat • 1 hour ago",
    icon: MessageCircle,
  },
  {
    title: "Q2 Sales Report.pdf",
    description: "Insights extracted • 3 hours ago",
    icon: BarChart3,
  },
];

const quickActions = [
  { title: "Chat with AI", icon: MessageCircle, href: "/chat" },
  { title: "Upload Document", icon: Upload, href: "/documents" },
  { title: "Create Template", icon: FilePlus2, href: "/templates" },
  { title: "Analyze Data", icon: BarChart3, href: "/analytics" },
];

function subscribeToProjects(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("projectsUpdated", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("projectsUpdated", callback);
  };
}

function getProjectsSnapshot() {
  return localStorage.getItem("projects") ?? "[]";
}

function getProjectsServerSnapshot() {
  return "[]";
}

export default function Home() {
  const savedProjects = useSyncExternalStore(
    subscribeToProjects,
    getProjectsSnapshot,
    getProjectsServerSnapshot
  );

  const projects = useMemo<Project[]>(() => {
    try {
      const parsed: unknown = JSON.parse(savedProjects);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(
        (item): item is Project =>
          typeof item === "object" &&
          item !== null &&
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          typeof item.type === "string" &&
          typeof item.createdAt === "string"
      );
    } catch (error) {
      console.error("Failed to load saved projects:", error);
      return [];
    }
  }, [savedProjects]);

  const stats = useMemo(
    () =>
      defaultStats.map((stat) =>
        stat.label === "Total Projects"
          ? { ...stat, value: String(projects.length) }
          : stat
      ),
    [projects.length]
  );

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
              <h1 className="text-sm font-bold">AI Content</h1>
              <p className="text-xs text-zinc-500">Assistant</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-5">
            <SidebarItem
              icon={<LayoutDashboard size={17} />}
              label="Dashboard"
              href="/"
              active
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
        <section className="flex-1">
          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-[#eee7dc] bg-white px-6 lg:px-10">
            <div>
              <h2 className="text-lg font-semibold">Dashboard</h2>
              <p className="text-xs text-zinc-500">
                Your AI workspace at a glance
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/new-project"
                className="rounded-lg bg-[#a66b16] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#8e5a12]"
              >
                + New Project
              </Link>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8a35d] text-sm font-semibold text-white">
                SB
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-6 lg:p-10">
            {/* Welcome */}
            <div className="mb-7">
              <h3 className="text-2xl font-bold tracking-tight">
                Welcome back, Shivang! 👋
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Here&apos;s what&apos;s happening with your projects.
              </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-[#e8dfd0] bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-zinc-500">
                        {stat.label}
                      </p>

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                        <Icon size={16} />
                      </div>
                    </div>

                    <p className="mt-4 text-2xl font-bold">{stat.value}</p>

                    <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp size={13} />
                      {stat.change}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Middle Section */}
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              {/* Recent Activity */}
              <div className="rounded-xl border border-[#e8dfd0] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Recent Activity</h4>
                    <p className="mt-1 text-xs text-zinc-500">
                      Your latest AI workspace activity
                    </p>
                  </div>

                  <Link
                    href="/documents"
                    className="flex items-center gap-1 text-xs font-medium text-[#a66b16]"
                  >
                    View all
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="mt-6 space-y-4">
                  {projects.length > 0 ? (
                    [...projects]
                      .reverse()
                      .slice(0, 3)
                      .map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center gap-4 rounded-lg border border-[#f0e9de] p-3"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                            <FolderOpen size={16} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {project.name}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {project.type} Project •{" "}
                              {formatTimeAgo(project.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                  ) : (
                    defaultActivities.map((activity) => {
                      const Icon = activity.icon;

                      return (
                        <div
                          key={activity.title}
                          className="flex items-center gap-4 rounded-lg border border-[#f0e9de] p-3"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                            <Icon size={16} />
                          </div>

                          <div>
                            <p className="text-sm font-medium">
                              {activity.title}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Usage Overview */}
              <div className="rounded-xl border border-[#e8dfd0] bg-white p-6 shadow-sm">
                <div>
                  <h4 className="font-semibold">Usage Overview</h4>
                  <p className="mt-1 text-xs text-zinc-500">
                    AI usage during the week
                  </p>
                </div>

                <div className="mt-8 flex h-48 items-end justify-between gap-3">
                  {[35, 48, 55, 72, 58, 78, 92].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="flex h-full flex-1 items-end"
                      >
                        <div
                          className="w-full rounded-t-md bg-[#d8a35d]"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    )
                  )}
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
            </div>

            {/* Quick Actions */}
            <div className="mt-6">
              <h4 className="mb-4 font-semibold">Quick Actions</h4>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <Link
                      key={action.title}
                      href={action.href}
                      className="flex items-center gap-3 rounded-xl border border-[#e8dfd0] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#d8a35d]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                        <Icon size={17} />
                      </div>

                      <span className="text-sm font-medium">
                        {action.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatTimeAgo(dateString: string) {
  const createdAt = new Date(dateString);
  const now = new Date();

  const difference = Math.floor(
    (now.getTime() - createdAt.getTime()) / 1000
  );

  if (difference < 60) {
    return "just now";
  }

  const minutes = Math.floor(difference / 60);

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days} day${days === 1 ? "" : "s"} ago`;
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
