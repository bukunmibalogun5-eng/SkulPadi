
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Check,
  GraduationCap,
  LogOut,
  Save,
  Settings2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type StudyPreferences = {
  noteStyle: "concise" | "detailed";
  quizLength: "10" | "15" | "20";
};

const DEFAULT_PREFERENCES: StudyPreferences = {
  noteStyle: "detailed",
  quizLength: "20",
};

export default function SettingsPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);
  const [preferences, setPreferences] =
    useState<StudyPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("study_profiles")
          .select("display_name, leaderboard_opt_in")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        let savedPreferences = DEFAULT_PREFERENCES;

        try {
          const raw = window.localStorage.getItem(
            `skulpadi-study-preferences-${user.id}`
          );

          if (raw) {
            const parsed = JSON.parse(raw) as Partial<StudyPreferences>;

            savedPreferences = {
              noteStyle:
                parsed.noteStyle === "concise" ? "concise" : "detailed",
              quizLength:
                parsed.quizLength === "10" ||
                parsed.quizLength === "15" ||
                parsed.quizLength === "20"
                  ? parsed.quizLength
                  : "20",
            };
          }
        } catch {
          // Use defaults if local preferences are unavailable.
        }

        if (!cancelled) {
          setUserId(user.id);
          setEmail(user.email ?? "");
          setDisplayName(
            profile?.display_name ??
              user.user_metadata?.display_name ??
              ""
          );
          setLeaderboardOptIn(profile?.leaderboard_opt_in ?? false);
          setPreferences(savedPreferences);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load your settings."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function saveSettings() {
    if (!userId || saving) return;

    const cleanName = displayName.trim();

    if (cleanName.length < 2 || cleanName.length > 30) {
      setError("Your display name must be between 2 and 30 characters.");
      setNotice("");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const supabase = createClient();

      const { data: { user }, error: authError } =
        await supabase.auth.getUser();

      if (authError || !user || user.id !== userId) {
        router.replace("/login");
        return;
      }

      const { error: profileError } = await supabase
        .from("study_profiles")
        .upsert(
          {
            user_id: userId,
            display_name: cleanName,
            leaderboard_opt_in: leaderboardOptIn,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (profileError) throw profileError;

      window.localStorage.setItem(
        `skulpadi-study-preferences-${userId}`,
        JSON.stringify(preferences)
      );

      setDisplayName(cleanName);
      setNotice("Your settings have been saved.");
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not save your settings."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) throw signOutError;

      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not sign out."
      );
      setSigningOut(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading your settings...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-blue-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white">
              <GraduationCap size={23} />
            </span>
            <span>
              <span className="block font-bold text-blue-950">SkulPadi</span>
              <span className="block text-xs text-slate-500">
                Your learning companion
              </span>
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-700">
            YOUR ACCOUNT
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-blue-950">
            Settings
          </h1>
          <p className="mt-2 text-slate-600">
            Personalise your study experience and control your privacy.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <Check size={18} />
            {notice}
          </div>
        )}

        <div className="space-y-6">
          <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start gap-3">
              <span className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <UserRound size={21} />
              </span>
              <div>
                <h2 className="font-bold text-blue-950">Profile</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose how you appear to other SkulPadi learners.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="displayName"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Display name
                </label>
                <input
                  id="displayName"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  maxLength={30}
                  placeholder="Your study name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-slate-500">
                  2–30 characters. This name may appear on the leaderboard
                  if you opt in.
                </p>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Account email
                </label>
                <input
                  id="email"
                  value={email}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Your email is not displayed on the study leaderboard.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start gap-3">
              <span className="rounded-xl bg-violet-50 p-3 text-violet-700">
                <BookOpen size={21} />
              </span>
              <div>
                <h2 className="font-bold text-blue-950">Study preferences</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Set your preferred learning defaults.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="noteStyle"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Preferred notes style
                </label>
                <select
                  id="noteStyle"
                  value={preferences.noteStyle}
                  onChange={(event) =>
                    setPreferences((previous) => ({
                      ...previous,
                      noteStyle:
                        event.target.value === "concise"
                          ? "concise"
                          : "detailed",
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="detailed">Detailed notes</option>
                  <option value="concise">Concise revision notes</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="quizLength"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Preferred quiz length
                </label>
                <select
                  id="quizLength"
                  value={preferences.quizLength}
                  onChange={(event) =>
                    setPreferences((previous) => ({
                      ...previous,
                      quizLength: ["10", "15", "20"].includes(
                        event.target.value
                      )
                        ? (event.target.value as "10" | "15" | "20")
                        : "20",
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="10">10 flashcards</option>
                  <option value="15">15 flashcards</option>
                  <option value="20">20 flashcards</option>
                </select>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              These preferences are saved in this browser for your account.
              They will become defaults for note generation and quizzes once
              those features are connected to them.
            </p>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-start gap-3">
              <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <ShieldCheck size={21} />
              </span>
              <div>
                <h2 className="font-bold text-blue-950">Privacy</h2>
                <p className="mt-1 text-sm text-slate-500">
                  You decide whether your study streak appears publicly.
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
              <input
                type="checkbox"
                checked={leaderboardOptIn}
                onChange={(event) =>
                  setLeaderboardOptIn(event.target.checked)
                }
                className="mt-1 h-4 w-4 accent-blue-700"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  Show me on the study leaderboard
                </span>
                <span className="mt-1 block text-sm leading-5 text-slate-500">
                  When enabled, your display name and streak statistics may
                  appear on the leaderboard. Your email address is not shown.
                </span>
              </span>
            </label>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-start gap-3">
              <span className="rounded-xl bg-slate-100 p-3 text-slate-700">
                <Settings2 size={21} />
              </span>
              <div>
                <h2 className="font-bold text-blue-950">Account</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage your current session.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <LogOut size={17} />
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/"
              className="rounded-xl border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-white"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={saveSettings}
              disabled={saving || !userId}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save size={17} />
                  Save settings
                </>
              )}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          SkulPadi · Your lectures. Your learning. Your Padi.
        </p>
      </div>
    </main>
  );
}
