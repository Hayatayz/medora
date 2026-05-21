export interface DetectedChapter {
  title: string;
  content: string;
  orderIndex: number;
  pageStart: number;
  pageEnd: number;
}

export function detectChapters(text: string): DetectedChapter[] {
  if (!text || text.length < 100) return [];

  const chapterPatterns = [
    /^(chapter\s+\d+[:\s].{0,80})$/im,
    /^(chapter\s+[ivxlcdm]+[:\s].{0,80})$/im,
    /^(\d+\.\s+[A-Z][^\n]{3,80})$/m,
    /^(CHAPTER\s+\d+.{0,80})$/m,
    /^(Part\s+\d+[:\s].{0,80})$/im,
    /^(Section\s+\d+[:\s].{0,80})$/im,
  ];

  const lines = text.split("\n");
  const chapterBreaks: { index: number; title: string }[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.length < 3 || trimmed.length > 100) return;
    for (const pattern of chapterPatterns) {
      if (pattern.test(trimmed)) {
        chapterBreaks.push({ index: i, title: trimmed });
        break;
      }
    }
  });

  if (chapterBreaks.length === 0) {
    return splitIntoChunks(text);
  }

  const chapters: DetectedChapter[] = [];
  const totalLines = lines.length;

  chapterBreaks.forEach((ch, idx) => {
    const nextBreak = chapterBreaks[idx + 1];
    const startLine = ch.index;
    const endLine = nextBreak ? nextBreak.index : totalLines;
    const content = lines.slice(startLine, endLine).join("\n").trim();
    const pageStart = Math.floor((startLine / totalLines) * 100);
    const pageEnd = Math.floor((endLine / totalLines) * 100);

    if (content.length > 50) {
      chapters.push({
        title:
          ch.title.replace(/^(chapter\s+\d+[:\s-]*)/i, "").trim() || ch.title,
        content,
        orderIndex: idx,
        pageStart: Math.max(1, pageStart),
        pageEnd: Math.max(2, pageEnd),
      });
    }
  });

  return chapters.length > 0 ? chapters : splitIntoChunks(text);
}

function splitIntoChunks(text: string): DetectedChapter[] {
  const words = text.split(/\s+/);
  const chunkSize = Math.ceil(words.length / 5);
  const chunks: DetectedChapter[] = [];

  for (let i = 0; i < 5; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, words.length);
    const content = words.slice(start, end).join(" ");

    if (content.trim().length > 50) {
      chunks.push({
        title: `Section ${i + 1}`,
        content,
        orderIndex: i,
        pageStart: Math.floor((start / words.length) * 100) + 1,
        pageEnd: Math.floor((end / words.length) * 100) + 1,
      });
    }
  }

  return chunks;
}