"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Course = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  created_at: string;
};

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      try {
        const supabase = createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("Please sign in again to view your courses.");
        }

        // Reuse existing project records as course folders.
        const { data, error: queryError } = await supabase
          .from("projects")
          .select("id, name, description, category, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (queryError) throw queryError;

        if (!cancelled) {
          setCourses(data ?? []);
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your courses. Please refresh."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
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
            <p className="mt-3 text-sm font-semibold">
              Learn at your pace
            </p>
            <p className="mt-1 text-xs leading-5 text-blue-100">
              Turn your lecture materials into a study experience that works
              for you.
            </p>
          </div>
        </aside>

        {/* Main content */}
        <section className="min-w-0 flex-1">
          <header className="flex min-h-20 items-center justify-between gap-4 border-b border-blue-100 bg-white px-5 sm:px-8 lg:px-10">
            <div>
              <p className="text-sm text-slate-500">Your learning space</p>
              <h1 className="text-xl font-bold text-blue-950 sm:text-2xl">
                My courses
              </h1>
            </div>

            <Link
              href="/new-project"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
            >
              <Plus size={17} />
              <span className="hidden sm:inline">Add course</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </header>

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

            {/* Summary cards */}
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Your courses</p>
                    <p className="mt-2 text-3xl font-bold text-blue-950">
                      {isLoading ? "—" : courses.length}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <FolderOpen size={22} />
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Existing workspaces included
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Study activity</p>
                    <p className="mt-2 text-lg font-bold text-blue-950">
                      Build your streak
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                    <Flame size={22} />
                  </div>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Your activity calendar will reflect real study sessions,
                  not just logins.
                </p>
              </div>
            </div>

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
                    <p className="font-semibold">We couldn’t load your courses.</p>
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
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}`}
                        className="group rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
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
