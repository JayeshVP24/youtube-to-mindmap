import { NextRequest, NextResponse } from "next/server";
import { extractVideoId, fetchTranscript } from "@/lib/youtube";
import { generateMindmapMarkdown } from "@/lib/ai";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Please provide a YouTube URL." },
        { status: 400 }
      );
    }

    // 1. Extract video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL. Please enter a valid YouTube video link." },
        { status: 400 }
      );
    }

    // 2. Fetch transcript
    let transcript: string;
    try {
      transcript = await fetchTranscript(videoId);
    } catch (error) {
      console.error("Transcript fetch failed for video:", videoId, error);
      const message =
        error instanceof Error
          ? error.message
          : "No transcript available for this video.";
      return NextResponse.json({ error: message }, { status: 404 });
    }

    // 3. Generate mindmap markdown via LLM
    let markdown: string;
    try {
      markdown = await generateMindmapMarkdown(transcript);
    } catch (error) {
      console.error("LLM generation failed:", error);
      return NextResponse.json(
        { error: "Failed to generate mindmap. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ markdown });
  } catch (error) {
    console.error("Unhandled error in /api/generate:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
