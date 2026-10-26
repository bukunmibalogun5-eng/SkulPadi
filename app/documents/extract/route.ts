
import { NextResponse } from "next/server";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { parseOffice } from "officeparser";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const SUPPORTED_EXTENSIONS = [
  "pdf",
  "pptx",
  "docx",
  "txt",
  "xlsx",
  "xls",
  "csv",
];

function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

async function extractOfficeText(
  file: File,
  fileType: "pdf" | "pptx",
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const ast = await parseOffice(buffer, { fileType });
  const result = await ast.to("text");

  if (typeof result.value !== "string") {
    throw new Error("Document text extraction failed.");
  }

  return result.value.trim();
}

async function extractDocx(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await mammoth.extractRawText({ buffer });

  return result.value.trim();
}

async function extractSpreadsheet(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sections: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) continue;

    const csv = XLSX.utils.sheet_to_csv(worksheet, {
      blankrows: false,
    });

    if (csv.trim()) {
      sections.push(`## Sheet: ${sheetName}\n\n${csv}`);
    }
  }

  return sections.join("\n\n").trim();
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate the user before processing the upload.
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in to extract document text." },
        { status: 401 },
      );
    }

    // 2. Apply the upload rate limit to this authenticated user.
    const limit = await checkRateLimit(user.id, "upload");

    if (!limit.allowed) {
      if (limit.reason === "unavailable") {
        return NextResponse.json(
          {
            error:
              "The service is temporarily unavailable. Please try again shortly.",
          },
          { status: 503 },
        );
      }

      return NextResponse.json(
        {
          error: "Too many uploads. Please wait before trying again.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfter),
          },
        },
      );
    }

    // 3. Reject obviously oversized requests before parsing multipart data.
    const contentLength = request.headers.get("content-length");

    if (contentLength !== null) {
      const requestSize = Number(contentLength);

      if (
        Number.isFinite(requestSize) &&
        requestSize > MAX_FILE_SIZE + 1024 * 1024
      ) {
        return NextResponse.json(
          { error: "Files must be 10 MB or smaller." },
          { status: 413 },
        );
      }
    }

    // 4. Read and validate the uploaded file.
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please select a file to upload." },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "The selected file is empty." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Files must be 10 MB or smaller." },
        { status: 413 },
      );
    }

    const extension = getFileExtension(file.name);

    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Upload PDF, PPTX, DOCX, TXT, XLSX, XLS, or CSV files.",
        },
        { status: 400 },
      );
    }

    // 5. Extract text using the appropriate parser.
    let content: string;

    switch (extension) {
      case "pdf":
        content = await extractOfficeText(file, "pdf");
        break;

      case "pptx":
        content = await extractOfficeText(file, "pptx");
        break;

      case "docx":
        content = await extractDocx(file);
        break;

      case "txt":
        content = (await file.text()).trim();
        break;

      case "xlsx":
      case "xls":
      case "csv":
        content = await extractSpreadsheet(file);
        break;

      default:
        content = "";
    }

    // 6. Handle files that contain no extractable text.
    if (!content) {
      return NextResponse.json(
        {
          error:
            "No readable text was found. The file may be empty, scanned, or contain only images.",
        },
        { status: 422 },
      );
    }

    // 7. Return the extracted text.
    return NextResponse.json({
      success: true,
      fileName: file.name,
      content,
      characterCount: content.length,
    });
  } catch (error) {
    // Keep detailed parser errors in server logs, not API responses.
    console.error("Document extraction failed:", error);

    return NextResponse.json(
      {
        error:
          "Document extraction failed. Check that the file is valid and try again.",
      },
      { status: 500 },
    );
  }
}

