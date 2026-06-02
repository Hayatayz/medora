export interface DetectedChapter {
  title: string;
  content: string;
  pageStart: number;
  pageEnd: number;
}

export function detectChapters(text: string, totalPages: number): DetectedChapter[] {
  const lines = text.split("\n");
  const chapters: DetectedChapter[] = [];

  // Patterns that look like chapter headings
  const chapterPatterns = [
    /^(chapter\s+\d+[\s:.\-–]*.+)/i,
    /^(\d+[\s.]\s*[A-Z][^\n]{3,60})$/,
    /^(part\s+[IVXivx\d]+[\s:.\-–]*.+)/i,
    /^(section\s+\d+[\s:.\-–]*.+)/i,
    /^([A-Z][A-Z\s]{4,50})$/, // ALL CAPS headings
  ];

  let currentChapter: DetectedChapter | null = null;
  let contentBuffer: string[] = [];
  let estimatedPage = 1;
  const linesPerPage = Math.ceil(lines.length / totalPages);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    estimatedPage = Math.ceil((i + 1) / linesPerPage);

    const isHeading = line.length > 3 && line.length < 120 &&
      chapterPatterns.some((p) => p.test(line));

    if (isHeading) {
      // Save previous chapter
      if (currentChapter) {
        currentChapter.content = contentBuffer.join("\n").trim();
        currentChapter.pageEnd = Math.max(estimatedPage - 1, currentChapter.pageStart);
        if (currentChapter.content.length > 50) {
          chapters.push(currentChapter);
        }
      }

      currentChapter = {
        title: line.replace(/^(chapter|part|section)\s+/i, (m) => m).trim(),
        content: "",
        pageStart: estimatedPage,
        pageEnd: totalPages,
      };
      contentBuffer = [];
    } else if (currentChapter) {
      contentBuffer.push(line);
    }
  }

  // Add last chapter
  if (currentChapter) {
    currentChapter.content = contentBuffer.join("\n").trim();
    currentChapter.pageEnd = totalPages;
    if (currentChapter.content.length > 50) {
      chapters.push(currentChapter);
    }
  }

  // If nothing detected, create one chapter per ~30 pages
  if (chapters.length === 0 && totalPages > 0) {
    const chunkSize = Math.max(30, Math.ceil(totalPages / 10));
    for (let start = 1; start <= totalPages; start += chunkSize) {
      const end = Math.min(start + chunkSize - 1, totalPages);
      chapters.push({
        title: `Pages ${start}–${end}`,
        content: "",
        pageStart: start,
        pageEnd: end,
      });
    }
  }

  return chapters;
}