import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");
    const chapterId = searchParams.get("chapterId");
    const query = searchParams.get("query");

    if (!bookId) return NextResponse.json({ error: "bookId required" }, { status: 400 });

    // Return cached recommendations first
    const cached = await db.videoRecommendation.findMany({
      where: { bookId, ...(chapterId ? { chapterId } : {}) },
      take: 6,
    });
    if (cached.length > 0) return NextResponse.json({ videos: cached });

    // Fetch from YouTube API
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey || apiKey === "placeholder") {
      return NextResponse.json({ videos: [], message: "YouTube API key not configured" });
    }

    let searchQuery = query ?? "";
    if (!searchQuery && chapterId) {
      const chapter = await db.chapter.findFirst({ where: { id: chapterId } });
      searchQuery = chapter?.title ?? "";
    }
    if (!searchQuery) {
      const book = await db.book.findFirst({ where: { id: bookId } });
      searchQuery = book?.title ?? "academic lecture";
    }

    const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      searchQuery + " lecture tutorial"
    )}&type=video&maxResults=6&key=${apiKey}`;

    const ytRes = await fetch(ytUrl);
    const ytData = await ytRes.json();

    if (!ytData.items?.length) return NextResponse.json({ videos: [] });

    const videos = await db.videoRecommendation.createManyAndReturn({
      data: ytData.items.map(
        (item: {
          id: { videoId: string };
          snippet: {
            title: string;
            thumbnails: { medium: { url: string } };
            channelTitle: string;
          };
        }) => ({
          bookId,
          chapterId: chapterId ?? null,
          videoId: item.id.videoId,
          title: item.snippet.title,
          thumbnailUrl: item.snippet.thumbnails.medium.url,
          channelName: item.snippet.channelTitle,
        })
      ),
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Videos error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
