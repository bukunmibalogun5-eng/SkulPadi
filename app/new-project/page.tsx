"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  GraduationCap,
  LoaderCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NewProject() {
  const router = useRouter();

  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleCreateCourse() {
    setError("");

    if (!courseName.trim()) {
      setError("Enter a course name, such as CPE 410.");
      return;
    }

    if (isSaving) return;

    setIsSaving(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Your session has expired. Please sign in again.");
        return;
      }

      const { data, error: insertError } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          name: courseName.trim(),
          description: description.trim() || null,
          category: "Course",
          status: "active",
          ai_enabled: true,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Supabase course creation error:", insertError);
        setError("We couldn't create this course. Please try again.");
        return;
      }

      // Return to the dashboard; the new course is loaded from Supabase.
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Failed to create course:", err);
      setError("Something went wrong while creating your course.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-blue-100 bg-white">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white">
              <GraduationCap size={23} />
            </div>
            <div>
              <p className="text-lg font-bold text-blue-950">SkulPadi</p>
              <p className="text-xs text-slate-500">Your learning companion</p>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-700"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to dashboard</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <BookOpen size={28} />
          </div>
          <p className="mt-6 text-sm font-semibold text-blue-700">
            YOUR NEXT STUDY SPACE
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
            Create a course
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Create a folder for a subject. You’ll be able to keep its lecture
            materials and study activities organised in one place.
          </p>
        </div>

        <div className="space-y-6 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-8">
          <div>
            <label
              htmlFor="course-name"
              className="block text-sm font-semibold text-slate-800"
            >
              Course name or code <span className="text-red-500">*</span>
            </label>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Use the name you recognise from your timetable.
            </p>
            <input
              id="course-name"
              type="text"
              value={courseName}
              onChange={(event) => setCourseName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !isSaving) {
                  event.preventDefault();
                  void handleCreateCourse();
                }
              }}
              placeholder="e.g. CPE 410 — Computer Engineering"
              maxLength={100}
              disabled={isSaving}
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="course-description"
              className="block text-sm font-semibold text-slate-800"
            >
              Description <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Add a short note to help you identify this subject.
            </p>
            <textarea
              id="course-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="e.g. Lecture notes, tutorials and exam preparation"
              rows={4}
              maxLength={500}
              disabled={isSaving}
              className="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:opacity-60"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={() => void handleCreateCourse()}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <LoaderCircle className="animate-spin" size={17} />
              ) : (
                <Check size={17} />
              )}
              {isSaving ? "Creating course..." : "Create course"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          Your courses are saved to your account in SkulPadi.
        </p>
      </div>
    </main>
  );
}