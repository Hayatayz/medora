import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? "";
    if (!query) return NextResponse.json({ books: [] });

    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(
        query
      )}&limit=12&fields=key,title,author_name,cover_i,first_publish_year,subject,number_of_pages_median`,
      { next: { revalidate: 3600 } }
    );

    const data = await res.json();

    const books = (data.docs ?? []).map(
      (doc: {
        key?: string;
        title?: string;
        author_name?: string[];
        cover_i?: number;
        first_publish_year?: number;
        subject?: string[];
        number_of_pages_median?: number;
      }) => ({
        key: doc.key,
        title: doc.title ?? "Unknown Title",
        author: doc.author_name?.[0] ?? "Unknown Author",
        coverUrl: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : null,
        year: doc.first_publish_year,
        subject: doc.subject?.[0] ?? null,
        pages: doc.number_of_pages_median ?? 0,
      })
    );

    return NextResponse.json({ books });
  } catch (error) {
    console.error("Online search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}