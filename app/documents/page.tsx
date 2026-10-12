
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

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([
  "pdf", "doc", "docx", "txt", "xlsx", "xls", "csv",
  "png", "jpg", "jpeg",
]);

const EXTRACTABLE_EXTENSIONS = new Set([
  "pdf", "docx", "txt", "xlsx", "xls", "csv",
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

export default function Documents() {
  const [supabase] = useState(() => createClient());

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchDocuments() {
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
            setError("Please log in to view your documents.");
          }
          return;
        }

        const { data, error: queryError } = await supabase
          .from("documents")
          .select(
            "id, name, type, created_at, storage_path, file_size_bytes"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (queryError) throw queryError;

        if (!cancelled) {
          setDocuments(((data ?? []) as DocumentRow[]).map(mapDocument));
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

      // Validate all files before starting the upload batch.
      for (const file of files) {
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

        if (!ALLOWED_EXTENSIONS.has(extension)) {
          throw new Error(`"${file.name}" is not a supported file type.`);
        }

        if (file.size === 0) {
          throw new Error(`"${file.name}" is empty.`);
        }

        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`"${file.name}" exceeds the 10 MB file size limit.`);
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

            // Route location: app/documents/extract/route.ts
            const extractionResponse = await fetch(
              "/documents/extract",
              {
                method: "POST",
                body: formData,
              }
            );

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
              name: file.name,
              content,
              type: getFileType(file.name),
              storage_path: storagePath,
              file_size_bytes: file.size,
            });

          if (insertError) throw insertError;

          uploadedCount++;
        } catch (processingError) {
          // Avoid leaving an orphaned Storage object if processing or
          // saving its database record fails.
          const { error: cleanupError } = await supabase.storage
            .from("documents")
            .remove([storagePath]);

          if (cleanupError) {
            console.error("Storage cleanup failed:", cleanupError);
          }

          throw processingError;
        }
      }

      setNotice(
        `${uploadedCount} document${uploadedCount === 1 ? "" : "s"} uploaded successfully.`
      );
      refreshDocuments();
    } catch (err) {
      console.error("Document upload failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while uploading documents."
      );

      if (uploadedCount > 0) {
        setNotice(
          `${uploadedCount} document${uploadedCount === 1 ? "" : "s"} uploaded before an error occurred.`
        );
      }

      refreshDocuments();
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(documentItem: DocumentItem) {
    const confirmed = window.confirm(
      `Delete "${documentItem.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");
    setDeletingId(documentItem.id);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please log in to delete documents.");

      const { data: record, error: findError } = await supabase
        .from("documents")
        .select("id, storage_path")
        .eq("id", documentItem.id)
        .eq("user_id", user.id)
        .single();

      if (findError) throw findError;

      if (record.storage_path) {
        const { error: storageError } = await supabase.storage
          .from("documents")
          .remove([record.storage_path]);

        if (storageError) throw storageError;
      }

      const { error: deleteError } = await supabase
        .from("documents")
        .delete()
        .eq("id", record.id)
        .eq("user_id", user.id);

      if (deleteError) {
        throw new Error(
          "The file was removed from Storage, but its database record could not be deleted. Refresh and check the record."
        );
      }

      setNotice("Document deleted successfully.");
      refreshDocuments();
    } catch (err) {
      console.error("Document deletion failed:", err);

      setError(
        err instanceof Error ? err.message : "Could not delete this document."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredDocuments = documents.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#faf7f0] text-zinc-900">
      <div className="flex min-h-screen">
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
            <SidebarItem
              icon={<LayoutDashboard size={17} />}
              label="Dashboard"
              href="/"
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
              active
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

        <section className="flex-1">
          <header className="flex h-20 items-center justify-between border-b border-[#eee7dc] bg-white px-6 lg:px-10">
            <div>
              <h2 className="text-lg font-semibold">Documents</h2>
              <p className="text-xs text-zinc-500">
                Manage your project documents
              </p>
            </div>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8a35d] text-sm font-semibold text-white"
              aria-label="User profile"
            >
              SB
            </div>
          </header>

          <div className="p-6 lg:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">Documents</h1>
                <p className="mt-1 text-sm text-zinc-500">
                  Upload and manage the documents used by your AI workspace.
                </p>
              </div>

              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isUploading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#a66b16] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#8e5a12] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Upload size={16} />
                {isUploading ? "Uploading..." : "Upload Document"}
              </button>

              <input
                id="document-file-input"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {notice && (
              <div
                role="status"
                className="mt-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
              >
                {notice}
              </div>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-lg border border-[#e8dfd0] bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#c58a3a]"
                />
              </div>

              <div className="rounded-lg border border-[#e8dfd0] bg-white px-4 py-2.5 text-sm text-zinc-600">
                {documents.length}{" "}
                {documents.length === 1 ? "document" : "documents"}
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-[#e8dfd0] bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#eee7dc] bg-[#fcfaf6]">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500">
                        Document
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500">
                        Size
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500">
                        Uploaded
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-14 text-center text-sm text-zinc-500"
                        >
                          Loading your documents...
                        </td>
                      </tr>
                    ) : filteredDocuments.length > 0 ? (
                      filteredDocuments.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-[#f0e9de] last:border-b-0 hover:bg-[#fcfaf6]"
                        >
                          <td className="px-6 py-4">
                            <Link
                              href={`/documents/${item.id}`}
                              className="block rounded-lg transition hover:opacity-80"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                                  {getFileIcon(item.type)}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">
                                    {item.name}
                                  </p>
                                  <p className="mt-1 text-xs text-zinc-400">
                                    Document
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-600">
                            {item.type}
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-600">
                            {item.size}
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-600">
                            {item.uploadedAt}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => void handleDelete(item)}
                              disabled={deletingId === item.id}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                              title="Delete document"
                              aria-label={`Delete ${item.name}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-14 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#fbf1df] text-[#a66b16]">
                            <File size={21} />
                          </div>
                          <p className="mt-4 text-sm font-medium">
                            {searchTerm
                              ? "No documents found"
                              : "No documents yet"}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {searchTerm
                              ? "Try another search term."
                              : "Upload a document to get started."}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[#e8dfd0] bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                  <Sparkles size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">
                    Use your documents with AI
                  </h3>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">
                    Uploaded files are stored privately. Text extraction is
                    enabled for TXT, CSV, PDF, DOCX, XLS, and XLSX files.
                    Scanned PDFs may require OCR. Images and legacy DOC files
                    are stored but their text is not extracted yet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
