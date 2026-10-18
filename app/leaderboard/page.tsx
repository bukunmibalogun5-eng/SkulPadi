
"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Flame,
  Trophy,
  Medal,
  Users,
  ShieldCheck,
  LoaderCircle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type LeaderboardEntry = {
  leaderboard_rank: number;
  display_name: string;
  current_streak: number;
  longest_streak: number;
};

type StudyProfile = {
  display_name: string;
  leaderboard_opt_in: boolean;
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function rankStyle(rank: number) {
  if (rank === 1) return "bg-amber-100 text-amber-800";
  if (rank === 2) return "bg-slate-200 text-slate-700";
  if (rank === 3) return "bg-orange-100 text-orange-800";
  return "bg-blue-50 text-blue-700";
}

export default function LeaderboardPage() {
  const router = useRouter();

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [profile, setProfile] = useState<StudyProfile>({
    display_name: "",
    leaderboard_opt_in: false,
  });
  const [nameInput, setNameInput] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadLeaderboard = useCallback(
    async (showSpinner = true) => {
      const supabase = createClient();

      if (showSpinner) setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        setUserId(user.id);

        const [profileResult, leaderboardResult] = await Promise.all([
          supabase
            .from("study_profiles")
            .select("display_name, leaderboard_opt_in")
            .eq("user_id", user.id)
            .maybeSingle(),

          supabase.rpc("get_streak_leaderboard"),
        ]);

        if (profileResult.error) throw profileResult.error;
        if (leaderboardResult.error) throw leaderboardResult.error;

        const existingProfile =
          profileResult.data as StudyProfile | null;

        if (existingProfile) {
          setProfile(existingProfile);
          setNameInput(existingProfile.display_name);
        } else {
          const suggestedName =
            user.user_metadata?.display_name ||
            user.user_metadata?.full_name ||
            "";

          setNameInput(
            typeof suggestedName === "string"
              ? suggestedName.slice(0, 30)
              : ""
          );

          setProfile({
            display_name: "",
            leaderboard_opt_in: false,
          });
        }

        setEntries(
          (leaderboardResult.data as LeaderboardEntry[] | null) ?? []
        );
      } catch (err) {
        console.error("Failed to load leaderboard:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Could not load the leaderboard. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    // Load the initial profile and leaderboard data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadLeaderboard();
  }, [loadLeaderboard]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const cleanName = nameInput.trim();

    if (cleanName.length < 2 || cleanName.length > 30) {
      setError("Your display name must be between 2 and 30 characters.");
      return;
    }

    if (!userId) {
      setError("Your session could not be verified. Please sign in again.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const { error: saveError } = await supabase
        .from("study_profiles")
        .upsert(
          {
            user_id: userId,
            display_name: cleanName,
            leaderboard_opt_in: profile.leaderboard_opt_in,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (saveError) throw saveError;

      setProfile((current) => ({
        ...current,
        display_name: cleanName,
      }));

      await loadLeaderboard(false);

      setNotice(
        profile.leaderboard_opt_in
          ? "Your profile is saved and you have opted into the leaderboard."
          : "Your profile is saved. You are not participating in the leaderboard."
      );
    } catch (err) {
      console.error("Failed to save study profile:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function toggleParticipation() {
    setProfile((current) => ({
      ...current,
      leaderboard_opt_in: !current.leaderboard_opt_in,
    }));

    setNotice("");
    setError("");
  }

  async function refreshLeaderboard() {
    setRefreshing(true);
    await loadLeaderboard(false);
  }

  const participantCount = entries.length;

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white">
              <Flame size={22} />
            </div>

            <div>
              <p className="text-lg font-bold text-blue-950">SkulPadi</p>
              <p className="text-xs text-slate-500">
                Your lectures. Your learning. Your Padi.
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-blue-700"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 p-7 text-white sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm text-blue-50">
                <Trophy size={15} />
                Study streaks
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                The Study Leaderboard
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Build a study habit, keep your streak alive, and celebrate
                consistent learning with your fellow students.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4">
              <div className="rounded-xl bg-white/15 p-3">
                <Users size={25} />
              </div>

              <div>
                <p className="text-2xl font-bold">{participantCount}</p>
                <p className="text-sm text-blue-100">
                  {participantCount === 1 ? "Participant" : "Participants"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-6 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            {notice}
          </div>
        )}

        <div className="grid gap-7 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Top study streaks
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ranked by current streak, then longest streak.
                </p>
              </div>

              <button
                type="button"
                onClick={refreshLeaderboard}
                disabled={loading || refreshing}
                aria-label="Refresh leaderboard"
                className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>
            </div>

            {loading ? (
              <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-slate-500">
                <LoaderCircle className="animate-spin" size={20} />
                Loading leaderboard...
              </div>
            ) : entries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-12 text-center">
                <Trophy className="mx-auto mb-3 text-slate-400" size={32} />

                <h3 className="font-semibold text-slate-800">
                  The leaderboard is waiting for you
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Students who opt in will appear here. Be the first to join
                  and start building your study streak.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={`${entry.leaderboard_rank}-${entry.display_name}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 sm:gap-4 sm:p-4"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${rankStyle(
                        entry.leaderboard_rank
                      )}`}
                    >
                      {entry.leaderboard_rank <= 3 ? (
                        <Medal size={20} />
                      ) : (
                        `#${entry.leaderboard_rank}`
                      )}
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">
                      {getInitials(entry.display_name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">
                        {entry.display_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Longest: {entry.longest_streak}{" "}
                        {entry.longest_streak === 1 ? "day" : "days"}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="flex items-center justify-end gap-1.5 font-bold text-orange-600">
                        <Flame size={17} />
                        {entry.current_streak}
                      </p>
                      <p className="text-xs text-slate-500">
                        {entry.current_streak === 1 ? "day" : "days"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-5 text-xs leading-5 text-slate-400">
              Only students who have opted in are listed. A current streak
              remains active if you logged in today or yesterday.
            </p>
          </section>

          <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <ShieldCheck size={23} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Your leaderboard profile
                </h2>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  You control how you appear to other students.
                </p>
              </div>
            </div>

            <form onSubmit={saveProfile} className="space-y-5">
              <div>
                <label
                  htmlFor="displayName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Display name
                </label>

                <input
                  id="displayName"
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  minLength={2}
                  maxLength={30}
                  required
                  placeholder="e.g. StudyAce"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-500">
                  2–30 characters. This is the name other participants see.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={profile.leaderboard_opt_in}
                    onChange={toggleParticipation}
                    className="mt-1 h-4 w-4 accent-blue-700"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Join the leaderboard
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-slate-500">
                      Show my display name and study streaks to other
                      participating students.
                    </span>
                  </span>
                </label>
              </div>

              <div className="flex items-start gap-2 text-xs leading-5 text-slate-500">
                <ShieldCheck size={15} className="mt-0.5 shrink-0" />
                Your email address and account ID are not displayed. You can
                opt out at any time by unchecking the box and saving.
              </div>

              <button
                type="submit"
                disabled={saving || loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <LoaderCircle size={17} className="animate-spin" />
                )}
                {saving ? "Saving..." : "Save profile"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
