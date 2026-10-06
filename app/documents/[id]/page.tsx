"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Sparkles,
  MessageCircle,
  FileSearch,
  LoaderCircle,
  X,
  Send,
  Trash2,
  Bot,
  User,
} from "lucide-react";

type DocumentItem = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
};

type QuestionMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Analysis = {
  category: string;
  purpose: string;
  topics: string[];
  insights: string[];
  recommendations: string[];
};

export default function DocumentDetails() {
  const params = useParams();
  const documentId = params.id as string;

  const [document, setDocument] =
    useState<DocumentItem | null>(null);

  const [isSummarizing, setIsSummarizing] =
    useState(false);

  const [summary, setSummary] = useState("");

  const [showQuestions, setShowQuestions] =
    useState(false);

  const [question, setQuestion] = useState("");

  const [questionMessages, setQuestionMessages] =
    useState<QuestionMessage[]>([]);

  const [isAnswering, setIsAnswering] =
    useState(false);

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [analysis, setAnalysis] =
    useState<Analysis | null>(null);

  useEffect(() => {
    const savedDocuments =
      localStorage.getItem("documents");

    if (!savedDocuments) {
      return;
    }

    try {
      const documents: DocumentItem[] =
        JSON.parse(savedDocuments);

      const foundDocument = documents.find(
        (item) => item.id === documentId
      );

      setDocument(foundDocument || null);
    } catch (error) {
      console.error(
        "Could not load documents:",
        error
      );
    }
  }, [documentId]);

  function handleSummarize() {
    if (!document || isSummarizing) {
      return;
    }

    setIsSummarizing(true);
    setSummary("");

    setTimeout(() => {
      setSummary(
        `Summary of "${document.name}":

This document is a ${document.type} file with a size of ${document.size}.

The AI summarization workflow is currently being simulated. Once the application is connected to a real AI model and the actual document contents are extracted, the assistant will analyze the document and generate a genuine summary of its contents, including its main ideas, important points, and conclusions.`
      );

      setIsSummarizing(false);
    }, 1500);
  }

  function handleCloseSummary() {
    setSummary("");
  }

  function handleAskQuestions() {
    setShowQuestions(true);
  }

  function handleCloseQuestions() {
    setShowQuestions(false);
  }

  function handleSendQuestion() {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isAnswering || !document) {
      return;
    }

    const userMessage: QuestionMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedQuestion,
    };

    setQuestionMessages((current) => [
      ...current,
      userMessage,
    ]);

    setQuestion("");
    setIsAnswering(true);

    setTimeout(() => {
      const assistantMessage: QuestionMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: generateDocumentAnswer(
          trimmedQuestion,
          document
        ),
      };

      setQuestionMessages((current) => [
        ...current,
        assistantMessage,
      ]);

      setIsAnswering(false);
    }, 1200);
  }

  function handleQuestionKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSendQuestion();
    }
  }

  function handleClearQuestions() {
    setQuestionMessages([]);
  }

  function handleAnalyzeDocument() {
    if (!document || isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    setTimeout(() => {
      const generatedAnalysis: Analysis = {
        category: getDocumentCategory(document.type),
        purpose: getDocumentPurpose(document.name),
        topics: getDocumentTopics(document.name),
        insights: [
          `The document is stored as a ${document.type} file.`,
          `The current file size is ${document.size}.`,
          `The document was uploaded ${document.uploadedAt.toLowerCase()}.`,
          "The document is available for future AI-powered processing.",
        ],
        recommendations: [
          "Connect the document to the AI assistant for deeper analysis.",
          "Extract the document's actual text before generating content-specific insights.",
          "Use the document as context when asking AI questions.",
        ],
      };

      setAnalysis(generatedAnalysis);
      setIsAnalyzing(false);
    }, 1500);
  }

  function handleCloseAnalysis() {
    setAnalysis(null);
  }

  if (!document) {
    return (
      <main className="min-h-screen bg-[#faf7f0] text-zinc-900">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft size={16} />
            Back to Documents
          </Link>

          <div className="mt-10 rounded-xl border border-[#e8dfd0] bg-white p-10 text-center">
            <FileText
              size={40}
              className="mx-auto text-zinc-300"
            />

            <h1 className="mt-4 text-lg font-semibold">
              Document not found
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              This document could not be found.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f0] text-zinc-900">
      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* Back */}
        <Link
          href="/documents"
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft size={16} />
          Back to Documents
        </Link>

        {/* Heading */}
        <div className="mt-8 flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#fbf1df] text-[#a66b16]">
            <FileText size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              {document.name}
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Document details and AI actions
            </p>
          </div>
        </div>

        {/* Information + Actions */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* Information */}
          <div className="rounded-xl border border-[#e8dfd0] bg-white p-6 lg:col-span-2">
            <h2 className="text-sm font-semibold">
              Document Information
            </h2>

            <div className="mt-5 space-y-4">
              <InfoRow
                label="Filename"
                value={document.name}
              />

              <InfoRow
                label="File Type"
                value={document.type}
              />

              <InfoRow
                label="File Size"
                value={document.size}
              />

              <InfoRow
                label="Uploaded"
                value={document.uploadedAt}
              />
            </div>
          </div>

          {/* AI Actions */}
          <div className="rounded-xl border border-[#e8dfd0] bg-white p-6">
            <h2 className="text-sm font-semibold">
              AI Actions
            </h2>

            <div className="mt-5 space-y-3">

              {/* Summarize */}
              <button
                type="button"
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="flex w-full items-center gap-3 rounded-lg border border-[#e8dfd0] px-4 py-3 text-left transition hover:bg-[#fcfaf6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                  {isSummarizing ? (
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Sparkles size={17} />
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {isSummarizing
                      ? "Summarizing..."
                      : "Summarize"}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {isSummarizing
                      ? "Generating summary..."
                      : "Generate a document summary"}
                  </p>
                </div>
              </button>

              {/* Ask Questions */}
              <button
                type="button"
                onClick={handleAskQuestions}
                className="flex w-full items-center gap-3 rounded-lg border border-[#e8dfd0] px-4 py-3 text-left transition hover:bg-[#fcfaf6]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                  <MessageCircle size={17} />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Ask Questions
                  </p>

                  <p className="text-xs text-zinc-500">
                    Ask AI about this document
                  </p>
                </div>
              </button>

              {/* Analyze */}
              <button
                type="button"
                onClick={handleAnalyzeDocument}
                disabled={isAnalyzing}
                className="flex w-full items-center gap-3 rounded-lg border border-[#e8dfd0] px-4 py-3 text-left transition hover:bg-[#fcfaf6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                  {isAnalyzing ? (
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <FileSearch size={17} />
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {isAnalyzing
                      ? "Analyzing..."
                      : "Analyze Document"}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {isAnalyzing
                      ? "Analyzing document..."
                      : "Extract useful insights"}
                  </p>
                </div>
              </button>

            </div>
          </div>
        </div>

        {/* Summary */}
        {summary !== "" && (
          <div className="mt-6 rounded-xl border border-[#e8dfd0] bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between">

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                  <Sparkles size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold">
                    Document Summary
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    Generated summary
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseSummary}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
              >
                <X size={16} />
              </button>

            </div>

            <div className="mt-5 rounded-lg bg-[#fcfaf6] p-5">
              <p className="whitespace-pre-line text-sm leading-7 text-zinc-700">
                {summary}
              </p>
            </div>

          </div>
        )}

        {/* Analysis */}
        {analysis && (
          <div className="mt-6 rounded-xl border border-[#e8dfd0] bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between">

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                  <FileSearch size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold">
                    Document Analysis
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    Structured analysis of {document.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseAnalysis}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
              >
                <X size={16} />
              </button>

            </div>

            {/* Category + Purpose */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <div className="rounded-lg bg-[#fcfaf6] p-4">
                <p className="text-xs text-zinc-500">
                  Document Category
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {analysis.category}
                </p>
              </div>

              <div className="rounded-lg bg-[#fcfaf6] p-4">
                <p className="text-xs text-zinc-500">
                  Estimated Purpose
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {analysis.purpose}
                </p>
              </div>

            </div>

            {/* Topics */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold">
                Topics
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {analysis.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-[#fbf1df] px-3 py-1.5 text-xs font-medium text-[#8a5b16]"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold">
                Key Insights
              </h3>

              <div className="mt-3 space-y-2">
                {analysis.insights.map(
                  (insight, index) => (
                    <div
                      key={index}
                      className="flex gap-3 rounded-lg bg-[#fcfaf6] p-3"
                    >
                      <span className="mt-1 text-[#a66b16]">
                        •
                      </span>

                      <p className="text-sm leading-6 text-zinc-700">
                        {insight}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold">
                Recommendations
              </h3>

              <div className="mt-3 space-y-2">
                {analysis.recommendations.map(
                  (recommendation, index) => (
                    <div
                      key={index}
                      className="flex gap-3 rounded-lg border border-[#eee7dc] p-3"
                    >
                      <Sparkles
                        size={15}
                        className="mt-1 shrink-0 text-[#a66b16]"
                      />

                      <p className="text-sm leading-6 text-zinc-700">
                        {recommendation}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-dashed border-[#e2d6c4] bg-[#fcfaf6] p-4">
              <p className="text-xs leading-5 text-zinc-500">
                This analysis is currently simulated. Once
                document extraction and the real AI model are
                connected, these insights will be generated
                from the actual contents of the document.
              </p>
            </div>

          </div>
        )}

        {/* Ask Questions */}
        {showQuestions && (
          <div className="mt-6 rounded-xl border border-[#e8dfd0] bg-white shadow-sm">

            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-[#eee7dc] px-6 py-4">

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                  <MessageCircle size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold">
                    Ask Questions
                  </h2>

                  <p className="text-xs text-zinc-500">
                    Ask questions about {document.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={handleClearQuestions}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                >
                  <Trash2 size={14} />
                  Clear
                </button>

                <button
                  type="button"
                  onClick={handleCloseQuestions}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
                >
                  <X size={16} />
                </button>

              </div>
            </div>

            {/* Messages */}
            <div className="min-h-[250px] max-h-[450px] space-y-5 overflow-y-auto px-6 py-6">

              {questionMessages.length === 0 && (
                <div className="flex min-h-[200px] items-center justify-center text-center">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#fbf1df] text-[#a66b16]">
                      <Sparkles size={21} />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold">
                      Ask about this document
                    </h3>

                    <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-zinc-500">
                      Ask a question about the document and
                      the AI assistant will respond.
                    </p>
                  </div>
                </div>
              )}

              {questionMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                      <Bot size={15} />
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "rounded-br-md bg-[#a66b16] text-white"
                        : "rounded-bl-md border border-[#e8dfd0] bg-[#fcfaf6] text-zinc-700"
                    }`}
                  >
                    {message.content}
                  </div>

                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d8a35d] text-white">
                      <User size={14} />
                    </div>
                  )}

                </div>
              ))}

              {isAnswering && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fbf1df] text-[#a66b16]">
                    <Bot size={15} />
                  </div>

                  <div className="rounded-2xl rounded-bl-md border border-[#e8dfd0] bg-[#fcfaf6] px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <LoaderCircle
                        size={14}
                        className="animate-spin"
                      />
                      AI is thinking...
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Input */}
            <div className="border-t border-[#eee7dc] p-4">

              <div className="rounded-xl border border-[#e8dfd0] bg-[#fcfaf6] p-2">

                <textarea
                  value={question}
                  onChange={(event) =>
                    setQuestion(event.target.value)
                  }
                  onKeyDown={handleQuestionKeyDown}
                  placeholder="Ask a question about this document..."
                  rows={2}
                  className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-400"
                />

                <div className="flex items-center justify-between border-t border-[#eee7dc] px-2 pt-2">

                  <p className="text-[11px] text-zinc-400">
                    Enter to send • Shift + Enter for a new line
                  </p>

                  <button
                    type="button"
                    onClick={handleSendQuestion}
                    disabled={
                      !question.trim() ||
                      isAnswering
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-[#a66b16] px-4 py-2 text-xs font-medium text-white hover:bg-[#8e5a12] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={14} />
                    Send
                  </button>

                </div>
              </div>

              <p className="mt-2 text-center text-[10px] text-zinc-400">
                Document questions are currently simulated.
              </p>

            </div>
          </div>
        )}

        {/* Preview */}
        <div className="mt-6 rounded-xl border border-dashed border-[#e2d6c4] bg-[#fcfaf6] p-8 text-center">
          <FileText
            size={32}
            className="mx-auto text-zinc-300"
          />

          <h2 className="mt-3 text-sm font-semibold">
            Document Preview
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Document preview and content extraction will
            be connected in the next stage.
          </p>
        </div>

      </div>
    </main>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#f0ebe3] pb-3">
      <span className="text-xs text-zinc-500">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-medium text-zinc-800">
        {value}
      </span>
    </div>
  );
}

function getDocumentCategory(type: string) {
  if (type === "PDF") {
    return "PDF Document";
  }

  if (type === "DOC" || type === "DOCX") {
    return "Text Document";
  }

  if (
    type === "XLS" ||
    type === "XLSX" ||
    type === "CSV"
  ) {
    return "Spreadsheet";
  }

  if (
    type === "PNG" ||
    type === "JPG" ||
    type === "JPEG"
  ) {
    return "Image";
  }

  return "General Document";
}

function getDocumentPurpose(name: string) {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("marketing")) {
    return "Marketing planning";
  }

  if (lowerName.includes("sales")) {
    return "Sales reporting";
  }

  if (lowerName.includes("research")) {
    return "Research and information gathering";
  }

  if (lowerName.includes("calendar")) {
    return "Planning and scheduling";
  }

  if (lowerName.includes("brand")) {
    return "Brand management";
  }

  return "General information management";
}

function getDocumentTopics(name: string) {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("marketing")) {
    return [
      "Marketing",
      "Strategy",
      "Planning",
      "Content",
    ];
  }

  if (lowerName.includes("sales")) {
    return [
      "Sales",
      "Performance",
      "Reporting",
      "Business",
    ];
  }

  if (lowerName.includes("research")) {
    return [
      "Research",
      "Analysis",
      "Products",
      "Insights",
    ];
  }

  if (lowerName.includes("calendar")) {
    return [
      "Planning",
      "Content",
      "Scheduling",
      "Organization",
    ];
  }

  if (lowerName.includes("brand")) {
    return [
      "Brand",
      "Guidelines",
      "Identity",
      "Content",
    ];
  }

  return [
    "Documents",
    "Information",
    "Analysis",
    "Content",
  ];
}

function generateDocumentAnswer(
  question: string,
  document: DocumentItem
) {
  const lowerQuestion = question.toLowerCase();

  if (
    lowerQuestion.includes("what is this") ||
    lowerQuestion.includes("what is the document") ||
    lowerQuestion.includes("about")
  ) {
    return `This document is "${document.name}", a ${document.type} file. It is currently being used in our simulated document-questioning workflow. Once we connect the real document contents to an LLM, I will be able to answer questions based on what is actually inside the document.`;
  }

  if (
    lowerQuestion.includes("file type") ||
    lowerQuestion.includes("type")
  ) {
    return `The document is a ${document.type} file.`;
  }

  if (
    lowerQuestion.includes("size") ||
    lowerQuestion.includes("large")
  ) {
    return `The document size is ${document.size}.`;
  }

  return `I received your question:

"${question}"

At the moment, document-based answers are simulated because the actual contents of the document have not been extracted and connected to an LLM yet. Once that integration is added, I will be able to answer this question using the document itself.`;
}