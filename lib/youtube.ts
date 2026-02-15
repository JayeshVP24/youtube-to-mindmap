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

// Rotate user agents to avoid detection
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Fetch the transcript for a YouTube video and return it as a single string.
 * Retries with different user agents on failure.
 * Throws a descriptive error if no transcript is available.
 */
export async function fetchTranscript(videoId: string): Promise<string> {
  const MAX_RETRIES = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const userAgent = getRandomUserAgent();

      const segments = await ytFetchTranscript(videoId, {
        lang: "en",
        userAgent,
      });

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
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on errors that won't be fixed by retrying
      const msg = lastError.message.toLowerCase();
      if (
        msg.includes("disabled") ||
        msg.includes("not available") ||
        msg.includes("unavailable") ||
        msg.includes("invalid")
      ) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff: 500ms, 1s, 2s)
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError ?? new Error("Failed to fetch transcript for this video.");
}
