"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

export interface GenerateResult {
  url: string;
  videoId: string;
  markdown: string;
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <HugeiconsIcon
      icon={Loading03Icon}
      className={className}
      size={14}
      strokeWidth={2}
    />
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
