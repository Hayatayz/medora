export interface ExtractedPDF {
  text: string;
  pageCount: number;
}

export async function extractPDFText(buffer: Buffer): Promise<ExtractedPDF> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParseModule = await import("pdf-parse" as any);
    const pdfParse = pdfParseModule.default ?? pdfParseModule;
    const data = await pdfParse(buffer);
    return {
      text: data.text ?? "",
      pageCount: data.numpages ?? 0,
    };
  } catch (error) {
    console.error("PDF extraction error:", error);
    return { text: "", pageCount: 0 };
  }
}