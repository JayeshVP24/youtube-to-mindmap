"use client";

import { Button } from "@/components/ui/button";

interface MindmapControlsProps {
  onCollapseAll: () => void;
  onExpandAll: () => void;
  onFit: () => void;
  onNavigate: (direction: "up" | "down" | "left" | "right") => void;
}

function ArrowUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 11V3M3 7l4-4 4 4" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3v8M3 7l4 4 4-4" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 7H3M7 3L3 7l4 4" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h8M7 3l4 4-4 4" />
    </svg>
  );
}

function FitIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5V2h3M9 2h3v3M12 9v3H9M5 12H2V9" />
    </svg>
  );
}

function CollapseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 2v3H2M9 2v3h3M12 9H9v3M2 9h3v3" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5V2h3M9 2h3v3M12 9v3H9M5 12H2V9" />
      <path d="M4 7h6M7 4v6" />
    </svg>
  );
}

export function MindmapControls({
  onCollapseAll,
  onExpandAll,
  onFit,
  onNavigate,
}: MindmapControlsProps) {
  return (
    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg border border-border bg-background/90 p-1 shadow-sm backdrop-blur-sm">
      {/* Collapse All */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onCollapseAll}
        aria-label="Collapse all nodes"
        title="Collapse all"
      >
        <CollapseIcon />
      </Button>

      {/* Expand All */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onExpandAll}
        aria-label="Expand all nodes"
        title="Expand all"
      >
        <ExpandIcon />
      </Button>

      {/* Separator */}
      <div className="mx-0.5 h-4 w-px bg-border" />

      {/* Navigation arrows */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onNavigate("up")}
        aria-label="Navigate up"
        title="Up"
      >
        <ArrowUpIcon />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onNavigate("down")}
        aria-label="Navigate down"
        title="Down"
      >
        <ArrowDownIcon />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onNavigate("left")}
        aria-label="Collapse / go to parent"
        title="Left (collapse / parent)"
      >
        <ArrowLeftIcon />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onNavigate("right")}
        aria-label="Expand / go to child"
        title="Right (expand / child)"
      >
        <ArrowRightIcon />
      </Button>

      {/* Separator */}
      <div className="mx-0.5 h-4 w-px bg-border" />

      {/* Fit view */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onFit}
        aria-label="Fit to view"
        title="Fit to view"
      >
        <FitIcon />
      </Button>
    </div>
  );
}
