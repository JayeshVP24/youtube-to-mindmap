"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { HistorySidebar } from "@/components/history-sidebar";
import { UrlInput, LoadingSpinner, type GenerateResult } from "@/components/url-input";
import { saveToHistory, extractTitle, type HistoryEntry } from "@/lib/history";

const MindmapViewer = dynamic(
  () =>
    import("@/components/mindmap-viewer").then((mod) => mod.MindmapViewer),
  { ssr: false }
);

export default function Page() {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleGenerate = useCallback((result: GenerateResult) => {
    setMarkdown(result.markdown);

    const entry = saveToHistory({
      url: result.url,
      videoId: result.videoId,
      title: extractTitle(result.markdown),
      markdown: result.markdown,
    });

    setActiveId(entry.id);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleSelectHistory = useCallback((entry: HistoryEntry) => {
    setMarkdown(entry.markdown);
    setActiveId(entry.id);
  }, []);

  return (
    <SidebarProvider defaultOpen={false}>
      <HistorySidebar
        onSelect={handleSelectHistory}
        activeId={activeId}
        refreshKey={refreshKey}
      />
      <SidebarInset>
        <div className="flex h-dvh flex-col">
          {/* Header + Input */}
          <div className="border-b border-border bg-background px-4 py-3">
            <div className="mx-auto max-w-3xl">
              <h1 className="mb-2 text-sm font-semibold tracking-tight">
                YouTube to Mindmap
              </h1>
              <UrlInput
                onGenerate={handleGenerate}
                onLoadingChange={setLoading}
              />
            </div>
          </div>

          {/* Mindmap Area */}
          <div className="flex-1 min-h-0">
            {markdown && !loading ? (
              <MindmapViewer markdown={markdown} />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner className="animate-spin size-4" />
                    <p className="text-sm">Generating mindmap...</p>
                  </div>
                ) : (
                  <p className="text-sm">
                    Paste a YouTube URL above to generate a mindmap
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
