"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  FileText,
  Bot,
  FolderOpen,
  Check,
} from "lucide-react";

type Project = {
  id: string;
  name: string;
  description: string;
  type: string;
  aiEnabled: boolean;
  createdAt: string;
};

export default function NewProject() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("Content");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [error, setError] = useState("");

  function handleCreateProject() {
    setError("");

    if (!projectName.trim()) {
      setError("Please enter a project name.");
      return;
    }

    const newProject: Project = {
      id: crypto.randomUUID(),
      name: projectName.trim(),
      description: description.trim(),
      type: projectType,
      aiEnabled,
      createdAt: new Date().toISOString(),
    };

    const existingProjects = JSON.parse(
      localStorage.getItem("projects") || "[]"
    );

    localStorage.setItem(
      "projects",
      JSON.stringify([...existingProjects, newProject])
    );

    window.location.href = "/";
  }

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
            <SidebarItem
              label="New Project"
              href="/new-project"
              active
            />
            <SidebarItem label="Documents" href="/documents" />
            <SidebarItem label="AI Chat" href="/chat" />
            <SidebarItem label="Templates" href="/templates" />
            <SidebarItem label="Analytics" href="/analytics" />
            <SidebarItem label="Settings" href="/settings" />
          </nav>
        </aside>

        {/* Main */}
        <section className="flex-1">

          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-[#eee7dc] bg-white px-6 lg:px-10">
            <div>
              <h2 className="text-lg font-semibold">New Project</h2>
              <p className="text-xs text-zinc-500">
                Create a new AI workspace
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8a35d] text-sm font-semibold text-white">
              SB
            </div>
          </header>

          <div className="p-6 lg:p-10">

            {/* Back */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            {/* Heading */}
            <div className="mt-6">
              <h1 className="text-2xl font-bold">
                Create a New Project
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Set up a workspace for your next project.
              </p>
            </div>

            {/* Form */}
            <div className="mt-8 max-w-3xl space-y-6">

              {/* Project Name */}
              <div className="rounded-xl border border-[#e8dfd0] bg-white p-6 shadow-sm">
                <label className="text-sm font-semibold">
                  Project Name
                </label>

                <p className="mt-1 text-xs text-zinc-500">
                  Give your project a clear name.
                </p>

                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Marketing Campaign"
                  className="mt-4 w-full rounded-lg border border-[#e8dfd0] bg-white px-3 py-3 text-sm outline-none focus:border-[#c58a3a]"
                />
              </div>

              {/* Project Description */}
              <div className="rounded-xl border border-[#e8dfd0] bg-white p-6 shadow-sm">
                <label className="text-sm font-semibold">
                  Project Description
                </label>

                <p className="mt-1 text-xs text-zinc-500">
                  Briefly describe what you're working on.
                </p>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project..."
                  rows={5}
                  className="mt-4 w-full resize-none rounded-lg border border-[#e8dfd0] bg-white px-3 py-3 text-sm outline-none focus:border-[#c58a3a]"
                />
              </div>

              {/* Project Type */}
              <div className="rounded-xl border border-[#e8dfd0] bg-white p-6 shadow-sm">
                <div>
                  <h3 className="text-sm font-semibold">
                    Project Type
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500">
                    Choose the type that best describes your project.
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">

                  {/* Content */}
                  <ProjectType
                    icon={<FileText size={20} />}
                    title="Content"
                    description="Create and manage content"
                    selected={projectType === "Content"}
                    onClick={() => setProjectType("Content")}
                  />

                  {/* AI Assistant */}
                  <ProjectType
                    icon={<Bot size={20} />}
                    title="AI Assistant"
                    description="Build with AI assistance"
                    selected={projectType === "AI Assistant"}
                    onClick={() => setProjectType("AI Assistant")}
                  />

                  {/* Other */}
                  <ProjectType
                    icon={<FolderOpen size={20} />}
                    title="Other"
                    description="Another type of project"
                    selected={projectType === "Other"}
                    onClick={() => setProjectType("Other")}
                  />

                </div>
              </div>

              {/* AI Assistance */}
              <div className="rounded-xl border border-[#e8dfd0] bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                      <Sparkles size={18} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold">
                        AI Assistance
                      </h3>

                      <p className="mt-1 text-xs text-zinc-500">
                        Enable AI-powered assistance for this project.
                      </p>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() => setAiEnabled(!aiEnabled)}
                    className={`h-6 w-11 rounded-full p-1 transition ${
                      aiEnabled
                        ? "bg-[#a66b16]"
                        : "bg-zinc-300"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white transition ${
                        aiEnabled
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>

                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3">

                <Link
                  href="/"
                  className="rounded-lg border border-[#e8dfd0] bg-white px-5 py-2.5 text-sm font-medium hover:bg-zinc-50"
                >
                  Cancel
                </Link>

                <button
                  type="button"
                  onClick={handleCreateProject}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#a66b16] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#925c12]"
                >
                  <Check size={16} />
                  Create Project
                </button>

              </div>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


/* -------------------------------- */
/* Project Type Card                */
/* -------------------------------- */

function ProjectType({
  icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative rounded-xl border p-4 text-left transition ${
        selected
          ? "border-[#c58a3a] bg-[#fbf1df]"
          : "border-[#e8dfd0] bg-white hover:bg-zinc-50"
      }`}
    >

      {/* Checkmark for selected card */}
      {selected && (
        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#a66b16] text-white">
          <Check size={13} />
        </div>
      )}

      {/* Icon */}
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          selected
            ? "bg-[#a66b16] text-white"
            : "bg-[#f5f0e8] text-[#a66b16]"
        }`}
      >
        {icon}
      </div>

      {/* Title */}
      <p className="mt-3 text-sm font-semibold">
        {title}
      </p>

      {/* Description */}
      <p className="mt-1 text-xs text-zinc-500">
        {description}
      </p>

    </button>
  );
}


/* -------------------------------- */
/* Sidebar Item                     */
/* -------------------------------- */

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