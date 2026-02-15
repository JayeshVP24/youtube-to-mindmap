"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { UrlInput } from "@/components/url-input";

// Dynamic import with no SSR -- markmap-view uses DOM/d3 APIs
const MindmapViewer = dynamic(
  () =>
    import("@/components/mindmap-viewer").then((mod) => mod.MindmapViewer),
  { ssr: false }
);

export default function Page() {
  const [markdown, setMarkdown] = useState<string | null>(null);

  return (
    <div className="flex h-dvh flex-col">
      {/* Header + Input */}
      <div className="border-b border-border bg-background px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-2 text-sm font-semibold tracking-tight">
            YouTube to Mindmap
          </h1>
          <UrlInput onGenerate={setMarkdown} />
        </div>
      </div>

      {/* Mindmap Area */}
      <div className="flex-1 min-h-0">
        {markdown ? (
          <MindmapViewer markdown={markdown} />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p className="text-sm">
              Paste a YouTube URL above to generate a mindmap
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
