
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const pdf = require("pdf-parse/lib/pdf-parse.js") as (
  buffer: Buffer
) => Promise<{ text: string }>;

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const SUPPORTED_EXTENSIONS = new Set([
  "txt",
  "csv",
  "pdf",
  "docx",
  "xls",
  "xlsx",
]);

async function extractPdfText(buffer: Buffer): Promise<string> {
  const result = await pdf(buffer);
  return result.text;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be signed in to extract documents." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a valid file." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "The uploaded file is empty." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "The file must be 10 MB or smaller." },
        { status: 413 }
      );
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension || !SUPPORTED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        {
          error:
            "Supported formats: TXT, CSV, PDF, DOCX, XLS, and XLSX.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let content = "";

    if (extension === "txt" || extension === "csv") {
      content = buffer.toString("utf-8");
    } else if (extension === "pdf") {
      content = await extractPdfText(buffer);
    } else if (extension === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      content = result.value;
    } else if (extension === "xls" || extension === "xlsx") {
      const workbook = XLSX.read(buffer, { type: "buffer" });

      content = workbook.SheetNames.map((sheetName) => {
        const sheet = workbook.Sheets[sheetName];

        return `Sheet: ${sheetName}\n${XLSX.utils.sheet_to_csv(sheet)}`;
      }).join("\n\n");
    }

    if (!content.trim()) {
      return NextResponse.json(
        {
          error:
            "No readable text was found. Scanned PDFs may require OCR.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      fileName: file.name,
      content,
      characterCount: content.length,
    });
  } catch (error) {
    console.error("Document extraction error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to extract document text.",
      },
      { status: 500 }
    );
  }
}
