import { fetchTranscript as ytFetchTranscript } from "youtube-transcript-plus";

/**
 * Extract a YouTube video ID from various URL formats.
 * Supports:
 *   - youtube.com/watch?v=ID
 *   - youtu.be/ID
 *   - youtube.com/embed/ID
 *   - youtube.com/v/ID
 *   - youtube.com/shorts/ID
 *   - youtube.com/live/ID
 *   - bare video ID (11 chars)
 */
export function extractVideoId(url: string): string | null {
  const trimmed = url.trim();

  // Bare video ID (11 alphanumeric + dash/underscore chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.replace("www.", "");

    // youtube.com/watch?v=ID
    if (
      (hostname === "youtube.com" || hostname === "m.youtube.com") &&
      parsed.pathname === "/watch"
    ) {
      return parsed.searchParams.get("v");
    }

    // youtu.be/ID
    if (hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }

    // youtube.com/embed/ID, /v/ID, /shorts/ID, /live/ID
    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const match = parsed.pathname.match(
        /^\/(embed|v|shorts|live)\/([a-zA-Z0-9_-]{11})/
      );
      if (match) return match[2];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Decode HTML entities that YouTube transcripts contain (e.g. &#39; -> ')
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

/**
 * Fetch the transcript for a YouTube video and return it as a single string.
 * Throws a descriptive error if no transcript is available.
 */
export async function fetchTranscript(videoId: string): Promise<string> {
  const segments = await ytFetchTranscript(videoId, { lang: "en" });

  if (!segments || segments.length === 0) {
    throw new Error(
      "No transcript available for this video. The video may not have captions enabled."
    );
  }

  const text = decodeHtmlEntities(
    segments
      .map((s) => s.text)
      .join(" ")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );

  if (!text) {
    throw new Error("Transcript is empty.");
  }

  return text;
}
