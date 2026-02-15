"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import type { HistoryEntry } from "@/lib/history";
import { getHistory, deleteFromHistory, clearHistory } from "@/lib/history";

interface HistorySidebarProps {
  onSelect: (entry: HistoryEntry) => void;
  activeId: string | null;
  refreshKey: number;
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 4h9M5 4V2.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V4M10 4v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4" />
    </svg>
  );
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function SidebarInner({ onSelect, activeId, refreshKey }: HistorySidebarProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const { state } = useSidebar();
  const [contentVisible, setContentVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Delay content visibility until sidebar finishes opening
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (state === "expanded") {
      // Wait for the 200ms sidebar width transition to finish
      timerRef.current = setTimeout(() => {
        setContentVisible(true);
      }, 200);
    } else {
      // Hide immediately when collapsing
      setContentVisible(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state]);

  useEffect(() => {
    setEntries(getHistory());
  }, [refreshKey]);

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    deleteFromHistory(id);
    setEntries(getHistory());
  }

  function handleClearAll() {
    clearHistory();
    setEntries([]);
  }

  return (
    <>
      <SidebarHeader className="flex flex-row items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
        <span className="text-sm font-semibold truncate group-data-[collapsible=icon]:hidden">
          History
        </span>
        <SidebarTrigger className="shrink-0" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Recent Mindmaps</SidebarGroupLabel>
          <SidebarGroupContent>
            {entries.length === 0 ? (
              <p
                className="px-3 py-4 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden transition-opacity duration-150"
                style={{ opacity: contentVisible ? 1 : 0 }}
              >
                No history yet. Generate a mindmap to get started.
              </p>
            ) : (
              <SidebarMenu>
                {entries.map((entry) => (
                  <SidebarMenuItem key={entry.id}>
                    <SidebarMenuButton
                      onClick={() => onSelect(entry)}
                      isActive={entry.id === activeId}
                      tooltip={entry.title}
                    >
                      <img
                        src={`https://i.ytimg.com/vi/${entry.videoId}/default.jpg`}
                        alt=""
                        className="size-5 shrink-0 rounded-sm object-cover"
                      />
                      <div
                        className="flex flex-col gap-0 overflow-hidden transition-opacity duration-150"
                        style={{ opacity: contentVisible ? 1 : 0 }}
                      >
                        <span className="truncate text-xs font-medium">
                          {entry.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {timeAgo(entry.createdAt)}
                        </span>
                      </div>
                    </SidebarMenuButton>
                    <SidebarMenuAction
                      onClick={(e) => handleDelete(e, entry.id)}
                      showOnHover
                    >
                      <TrashIcon />
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {entries.length > 0 && (
        <SidebarFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="w-full text-muted-foreground group-data-[collapsible=icon]:hidden transition-opacity duration-150"
            style={{ opacity: contentVisible ? 1 : 0 }}
          >
            Clear all history
          </Button>
        </SidebarFooter>
      )}
    </>
  );
}

export function HistorySidebar(props: HistorySidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarInner {...props} />
    </Sidebar>
  );
}
