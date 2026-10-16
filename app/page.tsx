
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  FileText,
  FolderOpen,
  GraduationCap,
  Plus,
  Sparkles,
  Flame,
  LoaderCircle,
  AlertCircle,
  LogOut,
  Trash2,
  Check,
  Trophy,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Course = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  created_at: string;
};

type LoginDay = {
  activity_date: string;
};

function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateFromString(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(value: string, amount: number) {
  const date = dateFromString(value);
  date.setDate(date.getDate() + amount);
  return localDateString(date);
}

function getStreaks(days: string[], today: string) {
  const set = new Set(days);
  const yesterday = addDays(today, -1);
  let current = 0;

  let cursor = set.has(today)
    ? today
    : set.has(yesterday)
      ? yesterday
      : "";

  while (cursor && set.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }

  let longest = 0;
  let run = 0;
  let previous = "";

  for (const day of [...set].sort()) {
    run = previous && day === addDays(previous, 1) ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = day;
  }

  return { current, longest };
}

function badgeForStreak(streak: number) {
  if (streak >= 30) {
    return {
      name: "Gold",
      description: "30-day consistency champion",
      className: "bg-amber-100 text-amber-800",
      next: null,
    };
  }

  if (streak >= 14) {
    return {
      name: "Silver",
      description: "14-day consistency achievement",
      className: "bg-slate-200 text-slate-700",
      next: 30,
    };
  }

  if (streak >= 7) {
    return {
      name: "Bronze",
      description: "7-day consistency achievement",
      className: "bg-orange-100 text-orange-800",
      next: 14,
    };
  }

  return {
    name: "Getting started",
    description: "Reach 7 consecutive days for Bronze",
    className: "bg-blue-100 text-blue-800",
    next: 7,
  };
}

export default function Home() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loginDays, setLoginDays] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activityError, setActivityError] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [deletingCourseId, setDeletingCourseId] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const today = localDateString();
  const { current: currentStreak, longest: longestStreak } = getStreaks(
    loginDays,
    today
  );
  const badge = badgeForStreak(currentStreak);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      const supabase = createClient();

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("Please sign in again to view your courses.");
        }

        const [courseResult, daysResult] = await Promise.all([
          supabase
            .from("projects")
            .select("id, name, description, category, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("user_login_days")
            .select("activity_date")
            .eq("user_id", user.id)
            .order("activity_date", { ascending: true }),
        ]);

        if (courseResult.error) throw courseResult.error;

        if (!cancelled) {
          setCourses(courseResult.data ?? []);

          if (daysResult.error) {
            console.error("Failed to load login history:", daysResult.error);
            setActivityError("Your activity calendar could not be loaded.");
          } else {
            setLoginDays(
              (daysResult.data as LoginDay[] | null)?.map(
                (item) => item.activity_date
              ) ?? []
            );
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your dashboard. Please refresh."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setSignOutError("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      router.replace("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign-out failed:", err);
      setSignOutError(
        err instanceof Error ? err.message : "Unable to sign out."
      );
      setIsSigningOut(false);
    }
  }

  async function handleDeleteCourse(course: Course) {
    const confirmed = window.confirm(
      `Delete "${course.name}"?\n\nThis will permanently delete the course, its associated documents, learning sessions and flashcard decks. This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingCourseId(course.id);
    setDeleteError("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      // Verify ownership and obtain the document storage paths.
      const { data: documents, error: documentsError } = await supabase
        .from("documents")
        .select("id, storage_path")
        .eq("project_id", course.id)
        .eq("user_id", user.id);

      if (documentsError) throw documentsError;

      const storagePaths = (documents ?? [])
        .map((doc) => doc.storage_path)
        .filter((path): path is string => Boolean(path));

      // Remove stored files before deleting their database records.
      if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("documents")
          .remove(storagePaths);

        if (storageError) throw storageError;
      }

      // Remove dependent learning records before their documents/course.
      const { error: decksError } = await supabase
        .from("flashcard_decks")
        .delete()
        .eq("project_id", course.id)
        .eq("user_id", user.id);

      if (decksError) throw decksError;

      const { error: sessionsError } = await supabase
        .from("learning_sessions")
        .delete()
        .eq("project_id", course.id)
        .eq("user_id", user.id);

      if (sessionsError) throw sessionsError;

      const { error: documentsDeleteError } = await supabase
        .from("documents")
        .delete()
        .eq("project_id", course.id)
        .eq("user_id", user.id);

      if (documentsDeleteError) throw documentsDeleteError;

      // Ownership is checked explicitly; RLS remains an additional guard.
      const { data: deletedCourse, error: courseDeleteError } = await supabase
        .from("projects")
        .delete()
        .eq("id", course.id)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

      if (courseDeleteError) throw courseDeleteError;

      if (!deletedCourse) {
        throw new Error(
          "The course could not be deleted. It may no longer exist or you may not have access."
        );
      }

      setCourses((previous) => previous.filter((item) => item.id !== course.id));
    } catch (err) {
      console.error("Course deletion failed:", err);
      setDeleteError(
        err instanceof Error
          ? err.message
          : "The course could not be deleted. Please try again."
      );
    } finally {
      setDeletingCourseId("");
    }
  }

  const monthYear = calendarMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const firstWeekday = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    1
  ).getDay();
  const daysInMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    0
  ).getDate();
  const calendarCells = [
    ...Array.from({ length: firstWeekday }, () => null as number | null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const loginDaySet = new Set(loginDays);

  function changeMonth(amount: number) {
    setCalendarMonth(
      new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth() + amount,
        1
      )
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-blue-100 bg-white lg:flex">
          <Link
            href="/"
            className="flex h-20 items-center gap-3 border-b border-blue-100 px-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white">
              <GraduationCap size={23} />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-blue-950">
                SkulPadi
              </p>
              <p className="text-xs text-slate-500">
                Your learning companion
              </p>
            </div>
          </Link>

          <nav className="flex-1 space-y-2 p-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800"
            >
              <BookOpen size={18} />
              My courses
            </Link>
            <Link
              href="/documents"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-50"
            >
              <FileText size={18} />
              My documents
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-50"
            >
              <Sparkles size={18} />
              AI study chat
            </Link>
          </nav>

          <div className="m-4 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 p-4 text-white">
            <Sparkles size={20} />
            <p className="mt-3 text-sm font-semibold">Learn at your pace</p>
            <p className="mt-1 text-xs leading-5 text-blue-100">
              Turn your lecture materials into a study experience that works
              for you.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex min-h-20 items-center justify-between gap-4 border-b border-blue-100 bg-white px-5 sm:px-8 lg:px-10">
            <div>
              <p className="text-sm text-slate-500">Your learning space</p>
              <h1 className="text-xl font-bold text-blue-950 sm:text-2xl">
                My courses
              </h1>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/new-project"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
              >
                <Plus size={17} />
                <span className="hidden sm:inline">Add course</span>
                <span className="sm:hidden">Add</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 sm:px-4"
              >
                {isSigningOut ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <LogOut size={17} />
                )}
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </header>

          {signOutError && (
            <div
              role="alert"
              className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-8"
            >
              {signOutError}
            </div>
          )}

          <div className="mx-auto max-w-7xl p-5 sm:p-8 lg:p-10">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 p-6 text-white sm:p-9">
              <div className="relative z-10 max-w-2xl">
                <p className="text-sm font-medium text-blue-100">
                  YOUR LECTURES. YOUR LEARNING. YOUR PADI.
                </p>
                <h2 className="mt-3 text-2xl font-bold leading-tight sm:text-4xl">
                  Ready to make your next study session count?
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                  Keep your courses organised, learn from your materials, and
                  test what you know—all in one place.
                </p>
                <Link
                  href="/new-project"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
                >
                  Create a course
                  <ChevronRight size={17} />
                </Link>
              </div>
              <GraduationCap
                className="absolute -bottom-8 -right-5 hidden text-white/10 sm:block"
                size={210}
                strokeWidth={1.2}
              />
            </div>

            {/* Streak summary */}
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Current streak</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {currentStreak}{" "}
                      <span className="text-base font-medium">days</span>
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Flame size={25} />
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {currentStreak > 0
                    ? "Keep showing up every day!"
                    : "Sign in daily to start your streak."}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Longest streak</p>
                    <p className="mt-2 text-3xl font-bold text-blue-950">
                      {longestStreak}{" "}
                      <span className="text-base font-medium">days</span>
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Trophy size={24} />
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Your personal consistency record
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Achievement</p>
                    <p className="mt-2 text-xl font-bold text-blue-950">
                      {badge.name}
                    </p>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${badge.className}`}
                  >
                    <Trophy size={24} />
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {badge.description}
                </p>
                {badge.next && (
                  <p className="mt-1 text-xs font-medium text-blue-700">
                    {Math.max(0, badge.next - currentStreak)} days to{" "}
                    {badge.next === 14 ? "Silver" : badge.next === 30 ? "Gold" : "Bronze"}
                  </p>
                )}
              </div>
            </div>

            {/* Login calendar */}
            <section className="mt-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-blue-950">
                    Your consistency calendar
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Checkmarks show days you signed in.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    aria-label="Previous month"
                    className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="min-w-32 text-center text-sm font-semibold text-blue-950">
                    {monthYear}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    disabled={
                      calendarMonth.getFullYear() === new Date().getFullYear() &&
                      calendarMonth.getMonth() === new Date().getMonth()
                    }
                    aria-label="Next month"
                    className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {activityError && (
                <p role="status" className="mt-3 text-sm text-amber-700">
                  {activityError}
                </p>
              )}

              <div className="mt-5 grid grid-cols-7 gap-1 sm:gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="py-2 text-center text-xs font-semibold text-slate-400"
                    >
                      {day}
                    </div>
                  )
                )}

                {calendarCells.map((day, index) => {
                  if (day === null) {
                    return <div key={`blank-${index}`} />;
                  }

                  const date = localDateString(
                    new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth(),
                      day
                    )
                  );
                  const completed = loginDaySet.has(date);
                  const isToday = date === today;

                  return (
                    <div
                      key={date}
                      title={completed ? `Signed in on ${date}` : date}
                      className={`flex min-h-10 flex-col items-center justify-center rounded-lg text-sm sm:min-h-12 ${
                        completed
                          ? "bg-emerald-50 font-semibold text-emerald-800"
                          : isToday
                            ? "border border-blue-300 bg-blue-50 font-semibold text-blue-800"
                            : "text-slate-600"
                      }`}
                    >
                      <span>{day}</span>
                      {completed && (
                        <Check
                          size={14}
                          className="text-emerald-600"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-emerald-100" />
                  Signed in
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm border border-blue-300 bg-blue-50" />
                  Today
                </span>
              </div>
            </section>

            {/* Course folders */}
            <div className="mt-9">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-blue-950">
                    Your course folders
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Open a course to choose Learn or Quiz.
                  </p>
                </div>
                <CalendarDays
                  className="hidden text-blue-600 sm:block"
                  size={24}
                />
              </div>

              {deleteError && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {deleteError}
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center gap-3 rounded-2xl border border-blue-100 bg-white py-16 text-sm text-slate-500">
                  <LoaderCircle className="animate-spin" size={19} />
                  Loading your courses...
                </div>
              ) : error ? (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
                >
                  <AlertCircle className="mt-0.5 shrink-0" size={19} />
                  <div>
                    <p className="font-semibold">
                      We couldn’t load your courses.
                    </p>
                    <p className="mt-1">{error}</p>
                  </div>
                </div>
              ) : courses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-blue-200 bg-white px-6 py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <BookOpen size={27} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-blue-950">
                    Your study space starts here
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Create a course folder for a subject, such as CPE 410 or
                    EEG 432. You can organise your learning around each course.
                  </p>
                  <Link
                    href="/new-project"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    <Plus size={17} />
                    Create your first course
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {courses.map((course, index) => {
                    const accents = [
                      "bg-blue-50 text-blue-700",
                      "bg-indigo-50 text-indigo-700",
                      "bg-sky-50 text-sky-700",
                    ];
                    const accent = accents[index % accents.length];

                    return (
                      <article
                        key={course.id}
                        className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                      >
                        <Link
                          href={`/courses/${course.id}`}
                          className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}
                            >
                              <FolderOpen size={23} />
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                              Course folder
                            </span>
                          </div>
                          <h3 className="mt-5 truncate text-lg font-bold text-blue-950">
                            {course.name}
                          </h3>
                          <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
                            {course.description?.trim() ||
                              "Your lecture materials and study sessions belong here."}
                          </p>
                          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                            <span className="text-sm font-medium text-blue-700">
                              Open course
                            </span>
                            <ChevronRight
                              size={18}
                              className="text-blue-600 transition group-hover:translate-x-1"
                            />
                          </div>
                        </Link>

                        <button
                          type="button"
                          onClick={() => void handleDeleteCourse(course)}
                          disabled={deletingCourseId === course.id}
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingCourseId === course.id ? (
                            <LoaderCircle size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                          {deletingCourseId === course.id
                            ? "Deleting course..."
                            : "Delete course"}
                        </button>
                      </article>
                    );
                  })}

                  <Link
                    href="/new-project"
                    className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                      <Plus size={23} />
                    </div>
                    <p className="mt-4 font-semibold text-blue-950">
                      Add another course
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Create a folder for another subject
                    </p>
                  </Link>
                </div>
              )}
            </div>

            <p className="mt-10 text-center text-xs text-slate-400">
              SkulPadi · Study smarter, one course at a time.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
