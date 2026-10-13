"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  FileText,
  GraduationCap,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Course = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
};

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourse() {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const { data, error: courseError } = await supabase
        .from("projects")
        .select("id, name, description, category")
        .eq("id", courseId)
        .eq("user_id", user.id)
        .single();

      if (courseError || !data) {
        setError("We couldn't find this course. It may have been removed or you may not have access to it.");
        setLoading(false);
        return;
      }

      setCourse(data as Course);
      setLoading(false);
    }

    if (courseId) {
      loadCourse();
    }
  }, [courseId, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-blue-600" />
        Loading your course...
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <GraduationCap className="mx-auto mb-4 h-10 w-10 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-900">
            Course unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {error || "This course could not be loaded."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight">
                SkulPadi
              </p>
              <p className="text-xs text-slate-500">
                Your lectures. Your learning. Your Padi.
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold text-blue-600">
            YOUR COURSE WORKSPACE
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {course.name}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            {course.description ||
              "Your dedicated study space. Upload your lecture materials, understand difficult concepts, and prepare for assessments."}
          </p>
        </div>

        <div className="mb-5">
          <h2 className="text-xl font-bold">How would you like to study?</h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose a study mode to continue learning in this course.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href={`/courses/${course.id}/learn`}
            className="group rounded-3xl border border-blue-100 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg sm:p-9"
          >
            <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
              <BookOpen className="h-7 w-7" />
            </div>

            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-2xl font-bold">Learn</h3>
              <Sparkles className="h-5 w-5 text-blue-500" />
            </div>

            <p className="mb-7 leading-7 text-slate-600">
              Turn your lecture materials into detailed, understandable notes.
              Ask questions about your documents and work through difficult
              concepts at your own pace.
            </p>

            <div className="space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-blue-600" />
                Upload lecture materials
              </div>
              <div className="flex items-center gap-3">
                <Brain className="h-4 w-4 text-blue-600" />
                Generate AI study notes
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-blue-600" />
                Ask questions and understand concepts
              </div>
            </div>

            <div className="mt-8 inline-flex items-center gap-2 font-semibold text-blue-700">
              Open Learn <span aria-hidden="true">→</span>
            </div>
          </Link>

          <Link
            href={`/courses/${course.id}/quiz`}
            className="group rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg sm:p-9"
          >
            <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white">
              <Brain className="h-7 w-7" />
            </div>

            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-2xl font-bold">Quiz</h3>
              <Sparkles className="h-5 w-5 text-indigo-500" />
            </div>

            <p className="mb-7 leading-7 text-slate-600">
              Test your understanding with AI-generated flashcards and
              practice questions based on your lecture materials. Reinforce
              what you learn and track your progress.
            </p>

            <div className="space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-indigo-600" />
                Upload materials for revision
              </div>
              <div className="flex items-center gap-3">
                <Brain className="h-4 w-4 text-indigo-600" />
                Generate flashcards
              </div>
              <div className="flex items-center gap-3">
                <GraduationCap className="h-4 w-4 text-indigo-600" />
                Practise and review your knowledge
              </div>
            </div>

            <div className="mt-8 inline-flex items-center gap-2 font-semibold text-indigo-700">
              Open Quiz <span aria-hidden="true">→</span>
            </div>
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <h3 className="font-semibold text-slate-900">
                Your course, your progress
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Keep your learning materials and revision activities organised
                by course. Your study workspace is designed to grow with you.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
