"use client";

import { useEffect, useRef, useState } from "react";
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
  Image,
  FileSpreadsheet,
  FileType,
} from "lucide-react";

type DocumentItem = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
};

const sampleDocuments: DocumentItem[] = [
  {
    id: "sample-1",
    name: "Marketing Strategy.docx",
    type: "DOCX",
    size: "2.4 MB",
    uploadedAt: "Today",
  },
  {
    id: "sample-2",
    name: "Q2 Sales Report.pdf",
    type: "PDF",
    size: "1.8 MB",
    uploadedAt: "Yesterday",
  },
  {
    id: "sample-3",
    name: "Product Research.pdf",
    type: "PDF",
    size: "3.2 MB",
    uploadedAt: "2 days ago",
  },
  {
    id: "sample-4",
    name: "Content Calendar.xlsx",
    type: "XLSX",
    size: "856 KB",
    uploadedAt: "3 days ago",
  },
  {
    id: "sample-5",
    name: "Brand Guidelines.docx",
    type: "DOCX",
    size: "1.2 MB",
    uploadedAt: "5 days ago",
  },
  {
    id: "sample-6",
    name: "Product Images.png",
    type: "PNG",
    size: "4.7 MB",
    uploadedAt: "1 week ago",
  },
];

export default function Documents() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedDocuments = JSON.parse(
      localStorage.getItem("documents") || "null"
    );

    if (savedDocuments) {
      setDocuments(savedDocuments);
    } else {
      setDocuments(sampleDocuments);

      localStorage.setItem(
        "documents",
        JSON.stringify(sampleDocuments)
      );
    }
  }, []);

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    setIsUploading(true);

    const newDocuments: DocumentItem[] = Array.from(files).map(
      (file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        type: getFileType(file.name),
        size: formatFileSize(file.size),
        uploadedAt: "Just now",
      })
    );

    const updatedDocuments = [
      ...newDocuments,
      ...documents,
    ];

    setDocuments(updatedDocuments);

    localStorage.setItem(
      "documents",
      JSON.stringify(updatedDocuments)
    );

    setTimeout(() => {
      setIsUploading(false);
    }, 500);

    event.target.value = "";
  }

  function handleDelete(id: string) {
    const updatedDocuments = documents.filter(
      (document) => document.id !== id
    );

    setDocuments(updatedDocuments);

    localStorage.setItem(
      "documents",
      JSON.stringify(updatedDocuments)
    );
  }

  const filteredDocuments = documents.filter((document) =>
    document.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#faf7f0] text-zinc-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-[#e8dfd0] bg-white lg:flex lg:flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center gap-3 border-b border-[#eee7dc] px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#a66b16] text-white">
              <Sparkles size={19} />
            </div>

            <div>
              <h1 className="text-sm font-bold">
                AI Content
              </h1>

              <p className="text-xs text-zinc-500">
                Assistant
              </p>
            </div>
          </div>

          {/* Navigation */}
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

          {/* AI Assistant */}
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

        {/* Main */}
        <section className="flex-1">
          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-[#eee7dc] bg-white px-6 lg:px-10">
            <div>
              <h2 className="text-lg font-semibold">
                Documents
              </h2>

              <p className="text-xs text-zinc-500">
                Manage your project documents
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8a35d] text-sm font-semibold text-white">
              SB
            </div>
          </header>

          {/* Content */}
          <div className="p-6 lg:p-10">
            {/* Page heading */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  Documents
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                  Upload and manage the documents used by your AI
                  workspace.
                </p>
              </div>

              {/* Upload button */}
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isUploading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#a66b16] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#8e5a12] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Upload size={16} />

                {isUploading
                  ? "Uploading..."
                  : "Upload Document"}
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
              />
            </div>

            {/* Search and filter */}
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
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  className="w-full rounded-lg border border-[#e8dfd0] bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#c58a3a]"
                />
              </div>

              <button
                type="button"
                className="rounded-lg border border-[#e8dfd0] bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
              >
                All Documents
              </button>
            </div>

            {/* Documents table */}
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
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map((document) => (
                        <tr
                          key={document.id}
                          className="border-b border-[#f0e9de] last:border-b-0 hover:bg-[#fcfaf6]"
                        >
                          {/* Document */}
                          <td className="px-6 py-4">
                            <Link
                              href={`/documents/${document.id}`}
                              className="block rounded-lg transition hover:opacity-80"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                                  {getFileIcon(document.type)}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">
                                    {document.name}
                                  </p>

                                  <p className="mt-1 text-xs text-zinc-400">
                                    Document
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </td>

                          {/* Type */}
                          <td className="px-6 py-4 text-sm text-zinc-600">
                            {document.type}
                          </td>

                          {/* Size */}
                          <td className="px-6 py-4 text-sm text-zinc-600">
                            {document.size}
                          </td>

                          {/* Uploaded */}
                          <td className="px-6 py-4 text-sm text-zinc-600">
                            {document.uploadedAt}
                          </td>

                          {/* Delete */}
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(document.id)
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
                              title="Delete document"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-14 text-center"
                        >
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#fbf1df] text-[#a66b16]">
                            <File size={21} />
                          </div>

                          <p className="mt-4 text-sm font-medium">
                            No documents found
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            Try another search or upload a
                            document.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Information panel */}
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
                    Upload documents to keep your project
                    information organized. Later, the AI assistant
                    will be able to use these documents when
                    answering questions and generating content.
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

/* -------------------------------- */
/* Sidebar Item                     */
/* -------------------------------- */

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

/* -------------------------------- */
/* File Type                        */
/* -------------------------------- */

function getFileType(fileName: string) {
  const extension = fileName
    .split(".")
    .pop()
    ?.toUpperCase();

  return extension || "FILE";
}

/* -------------------------------- */
/* File Size                        */
/* -------------------------------- */

function formatFileSize(bytes: number) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  return `${(bytes / Math.pow(1024, index)).toFixed(
    index === 0 ? 0 : 1
  )} ${units[index]}`;
}

/* -------------------------------- */
/* File Icon                        */
/* -------------------------------- */

function getFileIcon(type: string) {
  if (
    type === "PNG" ||
    type === "JPG" ||
    type === "JPEG"
  ) {
    return <Image size={17} />;
  }

  if (
    type === "XLSX" ||
    type === "XLS" ||
    type === "CSV"
  ) {
    return <FileSpreadsheet size={17} />;
  }

  if (
    type === "DOC" ||
    type === "DOCX"
  ) {
    return <FileType size={17} />;
  }

  return <FileText size={17} />;
}