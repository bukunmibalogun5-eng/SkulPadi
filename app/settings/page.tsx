
"use client";

import Link from "next/link";
import { Sparkles, User, Bell, Shield, Palette } from "lucide-react";

export default function Settings() {
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
            <SidebarItem label="Analytics" href="/analytics" />
            <SidebarItem label="Settings" href="/settings" active />
          </nav>
        </aside>

        {/* Main */}
        <section className="flex-1">
          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-[#eee7dc] bg-white px-6 lg:px-10">
            <div>
              <h2 className="text-lg font-semibold">Settings</h2>
              <p className="text-xs text-zinc-500">
                Manage your workspace preferences
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8a35d] text-sm font-semibold text-white">
              SB
            </div>
          </header>

          <div className="p-6 lg:p-10">
            {/* Heading */}
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Manage your account and AI assistant preferences.
              </p>
            </div>

            {/* Settings cards */}
            <div className="mt-7 max-w-4xl space-y-5">
              {/* Profile */}
              <SettingsCard
                icon={<User size={18} />}
                title="Profile"
                description="Manage your personal information."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="profile-name"
                      className="text-xs font-medium text-zinc-600"
                    >
                      Name
                    </label>

                    <input
                      id="profile-name"
                      type="text"
                      defaultValue="Shivang"
                      className="mt-2 w-full rounded-lg border border-[#e8dfd0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c58a3a]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-email"
                      className="text-xs font-medium text-zinc-600"
                    >
                      Email
                    </label>

                    <input
                      id="profile-email"
                      type="email"
                      defaultValue="shivang@example.com"
                      className="mt-2 w-full rounded-lg border border-[#e8dfd0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c58a3a]"
                    />
                  </div>
                </div>
              </SettingsCard>

              {/* AI Preferences */}
              <SettingsCard
                icon={<Sparkles size={18} />}
                title="AI Preferences"
                description="Customize how the AI assistant works."
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-[#eee7dc] p-4">
                    <div>
                      <p className="text-sm font-medium">
                        AI assistance
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Enable AI-powered suggestions and generation.
                      </p>
                    </div>

                    <div
                      role="switch"
                      aria-checked="true"
                      aria-label="AI assistance"
                      className="h-6 w-11 rounded-full bg-[#a66b16] p-1"
                    >
                      <div className="h-4 w-4 translate-x-5 rounded-full bg-white" />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="response-style"
                      className="text-xs font-medium text-zinc-600"
                    >
                      Response style
                    </label>

                    <select
                      id="response-style"
                      className="mt-2 w-full rounded-lg border border-[#e8dfd0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c58a3a]"
                      defaultValue="Balanced"
                    >
                      <option>Balanced</option>
                      <option>Concise</option>
                      <option>Detailed</option>
                    </select>
                  </div>
                </div>
              </SettingsCard>

              {/* Notifications */}
              <SettingsCard
                icon={<Bell size={18} />}
                title="Notifications"
                description="Choose which notifications you receive."
              >
                <div className="space-y-4">
                  <ToggleRow
                    title="AI generation updates"
                    description="Get notified when an AI task is completed."
                  />

                  <ToggleRow
                    title="Document processing"
                    description="Get notified when document processing finishes."
                  />

                  <ToggleRow
                    title="Product updates"
                    description="Receive updates about the assistant."
                  />
                </div>
              </SettingsCard>

              {/* Appearance */}
              <SettingsCard
                icon={<Palette size={18} />}
                title="Appearance"
                description="Customize the look of your workspace."
              >
                <div>
                  <label
                    htmlFor="theme"
                    className="text-xs font-medium text-zinc-600"
                  >
                    Theme
                  </label>

                  <select
                    id="theme"
                    defaultValue="Light"
                    className="mt-2 w-full rounded-lg border border-[#e8dfd0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c58a3a]"
                  >
                    <option>Light</option>
                    <option>Dark</option>
                    <option>System</option>
                  </select>
                </div>
              </SettingsCard>

              {/* Security */}
              <SettingsCard
                icon={<Shield size={18} />}
                title="Security"
                description="Manage account security settings."
              >
                <button
                  type="button"
                  className="rounded-lg border border-[#e8dfd0] bg-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-50"
                >
                  Change Password
                </button>
              </SettingsCard>

              {/* Save */}
              <div className="flex justify-end gap-3 pt-2">
                <Link
                  href="/"
                  className="rounded-lg border border-[#e8dfd0] bg-white px-5 py-2.5 text-sm font-medium hover:bg-zinc-50"
                >
                  Cancel
                </Link>

                <button
                  type="button"
                  className="rounded-lg bg-[#a66b16] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#925c12]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SettingsCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e8dfd0] bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
          {icon}
        </div>

        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-xs text-zinc-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#eee7dc] p-4">
      <div>
        <p className="text-sm font-medium">{title}</p>

        <p className="mt-1 text-xs text-zinc-500">
          {description}
        </p>
      </div>

      <div
        role="switch"
        aria-checked="true"
        aria-label={title}
        className="h-6 w-11 rounded-full bg-[#a66b16] p-1"
      >
        <div className="h-4 w-4 translate-x-5 rounded-full bg-white" />
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
