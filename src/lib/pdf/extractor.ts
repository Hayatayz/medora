export interface ExtractedPDF {
  text: string;
  pageCount: number;
}

import * as pdfParse from "pdf-parse";

export async function extractPDFText(buffer: Buffer): Promise<ExtractedPDF> {
  try {
    type PdfParseResult = {
      text?: string;
      numpages?: number;
    };

    const data = (await (pdfParse as unknown as (buf: Buffer) => Promise<PdfParseResult>)(
      buffer
    )) as PdfParseResult;

    return {
      text: data.text ?? "",
      pageCount: data.numpages ?? 0,
    };
  } catch (error) {
    console.error("PDF extraction error:", error);
    return { text: "", pageCount: 0 };
  }
}

