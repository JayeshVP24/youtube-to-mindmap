"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface GenerateResult {
  url: string;
  videoId: string;
  markdown: string;
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.75 2.75l1.42 1.42M9.83 9.83l1.42 1.42M2.75 11.25l1.42-1.42M9.83 4.17l1.42-1.42" className="animate-spin origin-center" />
    </svg>
  );
}

interface UrlInputProps {
  onGenerate: (result: GenerateResult) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export function UrlInput({ onGenerate, onLoadingChange }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setLoadingState(value: boolean) {
    setLoading(value);
    onLoadingChange?.(value);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmed = url.trim();
    if (!trimmed) return;

    setLoadingState(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      onGenerate({
        url: trimmed,
        videoId: data.videoId,
        markdown: data.markdown,
      });
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoadingState(false);
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          type="url"
          placeholder="Paste a YouTube URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !url.trim()} size="lg">
          {loading ? (
            <>
              <LoadingSpinner className="animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Mindmap"
          )}
        </Button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

export { LoadingSpinner };
