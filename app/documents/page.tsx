
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  LayoutDashboard,
  Plus,
  FileText,
  MessageCircle,
  PanelsTopLeft,
  BarChart3,
  Settings,
  Upload,
  Search,
  Trash2,
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  FileType,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type DocumentItem = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  storagePath: string | null;
  sizeBytes: number | null;
};

type DocumentRow = {
  id: string;
  name: string;
  type: string | null;
  created_at: string;
  storage_path: string | null;
  file_size_bytes: number | string | null;
};

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  status: string | null;
  ai_enabled: boolean;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "doc",
  "docx",
  "pptx",
  "txt",
  "xlsx",
  "xls",
  "csv",
  "png",
  "jpg",
  "jpeg",
]);

const EXTRACTABLE_EXTENSIONS = new Set([
  "pdf",
  "docx",
  "pptx",
  "txt",
  "xlsx",
  "xls",
  "csv",
]);

function formatFileSize(bytes: number | null) {
  if (bytes === null || !Number.isFinite(bytes)) return "Unknown";
  if (bytes === 0) return "0 Bytes";

  const units = ["Bytes", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(bytes / Math.pow(1024, index)).toFixed(
    index === 0 ? 0 : 1
  )} ${units[index]}`;
}

function getFileType(fileName: string) {
  return fileName.split(".").pop()?.toUpperCase() || "FILE";
}

function getFileIcon(type: string) {
  if (["PNG", "JPG", "JPEG"].includes(type)) {
    return <ImageIcon size={17} aria-hidden="true" />;
  }

  if (["XLSX", "XLS", "CSV"].includes(type)) {
    return <FileSpreadsheet size={17} aria-hidden="true" />;
  }

  if (["DOC", "DOCX"].includes(type)) {
    return <FileType size={17} aria-hidden="true" />;
  }

  return <FileText size={17} aria-hidden="true" />;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function mapDocument(row: DocumentRow): DocumentItem {
  const sizeBytes =
    row.file_size_bytes == null ? null : Number(row.file_size_bytes);

  return {
    id: row.id,
    name: row.name,
    type: row.type || getFileType(row.name),
    size: formatFileSize(sizeBytes),
    uploadedAt: formatDate(row.created_at),
    storagePath: row.storage_path,
    sizeBytes,
  };
}

export default function DocumentsPage() {
  const supabase = createClient();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchDocuments() {
      setIsLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          if (!cancelled) {
            setDocuments([]);
            setProjects([]);
            setError("Please log in to view your documents.");
          }
          return;
        }

        const [
          { data: documentData, error: documentError },
          { data: projectData, error: projectError },
        ] = await Promise.all([
          supabase
            .from("documents")
            .select(
              "id, name, type, created_at, storage_path, file_size_bytes"
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("projects")
            .select("id, name, description, category, status, ai_enabled")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
        ]);

        if (documentError) throw documentError;
        if (projectError) throw projectError;

        if (!cancelled) {
          setProjects((projectData ?? []) as ProjectRow[]);
          setDocuments(
            ((documentData ?? []) as DocumentRow[]).map(mapDocument)
          );
        }
      } catch (err) {
        console.error("Loading documents failed:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load your documents."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchDocuments();

    return () => {
      cancelled = true;
    };
  }, [supabase, refreshVersion]);

  const refreshDocuments = useCallback(() => {
    setRefreshVersion((version) => version + 1);
  }, []);

  function handleUploadClick() {
    const input = document.getElementById(
      "document-file-input"
    ) as HTMLInputElement | null;

    input?.click();
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    input.value = "";

    if (files.length === 0) return;

    setError("");
    setNotice("");
    setIsUploading(true);

    let uploadedCount = 0;

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please log in before uploading files.");

      // Validate every file before beginning the upload batch.
      for (const file of files) {
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

        if (!ALLOWED_EXTENSIONS.has(extension)) {
          throw new Error(`"${file.name}" is not a supported file type.`);
        }

        if (file.size === 0) {
          throw new Error(`"${file.name}" is empty.`);
        }

        if (file.size > MAX_FILE_SIZE) {
          throw new Error(
            `"${file.name}" exceeds the 10 MB file size limit.`
          );
        }
      }

      // Check that the selected project belongs to this user.
      if (selectedProjectId) {
        const { data: project, error: selectedProjectError } =
          await supabase
            .from("projects")
            .select("id")
            .eq("id", selectedProjectId)
            .eq("user_id", user.id)
            .maybeSingle();

        if (selectedProjectError) throw selectedProjectError;

        if (!project) {
          throw new Error(
            "The selected course could not be verified. Please select it again."
          );
        }
      }

      for (const file of files) {
        const documentId = crypto.randomUUID();
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
        const safeFileName = file.name.replace(/[^\w.\-() ]/g, "_");
        const storagePath = `${user.id}/${documentId}/${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(storagePath, file, {
            upsert: false,
            contentType: file.type || undefined,
          });

        if (uploadError) throw uploadError;

        let content = "";

        try {
          // Extract text before saving the document record.
          if (EXTRACTABLE_EXTENSIONS.has(extension)) {
            const formData = new FormData();
            formData.append("file", file);

            const extractionResponse = await fetch("/documents/extract", {
              method: "POST",
              body: formData,
            });

            const extractionData = await extractionResponse.json();

            if (!extractionResponse.ok) {
              throw new Error(
                extractionData.error ||
                  `Could not extract text from "${file.name}".`
              );
            }

            if (typeof extractionData.content !== "string") {
              throw new Error(
                "The extraction API returned invalid document content."
              );
            }

            content = extractionData.content;
          }

          const { error: insertError } = await supabase
            .from("documents")
            .insert({
              id: documentId,
              user_id: user.id,
              project_id: selectedProjectId || null,
              name: file.name,
              content,
              type: getFileType(file.name),
              storage_path: storagePath,
              file_size_bytes: file.size,
            });

          if (insertError) throw insertError;

          uploadedCount++;
        } catch (err) {
          // Remove the stored file if extraction or database insertion fails.
          const { error: cleanupError } = await supabase.storage
            .from("documents")
            .remove([storagePath]);

          if (cleanupError) {
            console.error("Storage cleanup failed:", cleanupError);
          }

          throw err;
        }
      }

      setNotice(
        `${uploadedCount} file${uploadedCount === 1 ? "" : "s"} uploaded successfully.`
      );

      refreshDocuments();
    } catch (err) {
      console.error("Document upload failed:", err);

      setError(
        err instanceof Error ? err.message : "Could not upload your files."
      );

      if (uploadedCount > 0) {
        setNotice(
          `${uploadedCount} file${uploadedCount === 1 ? "" : "s"} uploaded before the error occurred.`
        );
        refreshDocuments();
      }
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(documentItem: DocumentItem) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${documentItem.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");
    setDeletingDocumentId(documentItem.id);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please log in before deleting files.");

      const { data: row, error: lookupError } = await supabase
        .from("documents")
        .select("id, storage_path")
        .eq("id", documentItem.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (lookupError) throw lookupError;
      if (!row) throw new Error("This document could not be found.");

      const { error: deleteError } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentItem.id)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      if (row.storage_path) {
        const { error: storageError } = await supabase.storage
          .from("documents")
          .remove([row.storage_path]);

        if (storageError) {
          console.error("Storage file cleanup failed:", storageError);
        }
      }

      setNotice(`"${documentItem.name}" was deleted.`);
      refreshDocuments();
    } catch (err) {
      console.error("Deleting document failed:", err);

      setError(
        err instanceof Error ? err.message : "Could not delete this document."
      );
    } finally {
      setDeletingDocumentId(null);
    }
  }

  const documentTypes = [
    "All",
    ...Array.from(new Set(documents.map((document) => document.type))).sort(),
  ];

  const filteredDocuments = documents.filter((document) => {
    const matchesSearch = document.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === "All" || document.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-5 lg:block">
          <Link href="/" className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Sparkles size={21} />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">SkulPadi</p>
              <p className="text-xs text-slate-500">Your learning companion</p>
            </div>
          </Link>

          <nav className="space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>

            <Link
              href="/new-project"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              <Plus size={18} />
              Create course
            </Link>

            <Link
              href="/documents"
              className="flex items-center gap-3 rounded-xl bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-700"
            >
              <FileText size={18} />
              Documents
            </Link>

            <Link
              href="/chat"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              <MessageCircle size={18} />
              AI chat
            </Link>

            <Link
              href="/analytics"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              <BarChart3 size={18} />
              Analytics
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              <Settings size={18} />
              Settings
            </Link>
          </nav>

          <div className="mt-10 rounded-2xl bg-indigo-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-indigo-700">
              <PanelsTopLeft size={18} />
              <span className="text-sm font-semibold">Study smarter</span>
            </div>
            <p className="text-xs leading-5 text-slate-600">
              Keep your lecture materials organised and ready for AI-powered
              learning.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
            <div>
              <p className="text-sm text-slate-500">Your workspace</p>
              <h1 className="text-xl font-bold tracking-tight">Documents</h1>
            </div>

            <Link
              href="/"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Dashboard
            </Link>
          </header>

          <div className="mx-auto max-w-6xl p-5 sm:p-8">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Your lecture library
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Upload and organise your lecture materials. SkulPadi can
                  extract text from supported files to help you study.
                </p>
              </div>

              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isUploading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Upload size={18} />
                {isUploading ? "Uploading..." : "Upload documents"}
              </button>
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
                className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
              >
                {notice}
              </div>
            )}

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
              <label
                htmlFor="course-select"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Assign uploads to a course (optional)
              </label>

              <select
                id="course-select"
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:max-w-md"
              >
                <option value="">No course selected</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Files assigned to a course can be used as study materials for
                that course.
              </p>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText size={20} />
                </div>
                <p className="text-sm text-slate-500">Total documents</p>
                <p className="mt-1 text-2xl font-bold">{documents.length}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <PanelsTopLeft size={20} />
                </div>
                <p className="text-sm text-slate-500">Courses</p>
                <p className="mt-1 text-2xl font-bold">{projects.length}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Sparkles size={20} />
                </div>
                <p className="text-sm text-slate-500">Text-extractable formats</p>
                <p className="mt-1 text-2xl font-bold">
                  {documents.filter((document) =>
                    EXTRACTABLE_EXTENSIONS.has(document.type.toLowerCase())
                  ).length}
                </p>
              </div>
            </div>

            <div className="mb-5 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search your documents..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <select
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
                aria-label="Filter by file type"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "All" ? "All file types" : type}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h3 className="font-semibold">Uploaded files</h3>
                <span className="text-xs text-slate-500">
                  {filteredDocuments.length} shown
                </span>
              </div>

              {isLoading ? (
                <div className="p-10 text-center text-sm text-slate-500">
                  Loading your documents...
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center px-5 py-14 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <File size={25} />
                  </div>
                  <h4 className="font-semibold">No documents found</h4>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    {documents.length === 0
                      ? "Upload your first lecture material to start building your study library."
                      : "Try a different search term or file type filter."}
                  </p>
                  {documents.length === 0 && (
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      disabled={isUploading}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                      <Upload size={17} />
                      Upload your first file
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredDocuments.map((documentItem) => (
                    <div
                      key={documentItem.id}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        {getFileIcon(documentItem.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {documentItem.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {documentItem.type} · {documentItem.size} · Uploaded{" "}
                          {documentItem.uploadedAt}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleDelete(documentItem)}
                        disabled={deletingDocumentId === documentItem.id}
                        aria-label={`Delete ${documentItem.name}`}
                        title="Delete document"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingDocumentId === documentItem.id ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <Trash2 size={17} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500">
              Supported formats: PDF, DOC, DOCX, PPTX, TXT, XLSX, XLS, CSV,
              PNG, JPG and JPEG. Maximum file size: 10 MB per file. Text
              extraction is available for PDF, DOCX, PPTX, TXT, XLSX, XLS and
              CSV files.
            </div>

            <input
              id="document-file-input"
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.pptx,.txt,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
