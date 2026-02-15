"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";
import { MindmapControls } from "@/components/mindmap-controls";

const transformer = new Transformer();

// markmap INode type (not exported cleanly, so we define what we need)
interface INode {
  content: string;
  children?: INode[];
  payload?: { fold?: number; [key: string]: unknown };
  state: {
    id: number;
    depth: number;
    path: string;
    key: string;
    [key: string]: unknown;
  };
}

/**
 * Build a child -> parent lookup map by walking the tree once.
 */
function buildParentMap(root: INode): Map<INode, INode | null> {
  const map = new Map<INode, INode | null>();
  map.set(root, null);

  function walk(node: INode) {
    if (node.children) {
      for (const child of node.children) {
        map.set(child, node);
        walk(child);
      }
    }
  }
  walk(root);
  return map;
}

/**
 * Check if a node is collapsed (folded).
 */
function isFolded(node: INode): boolean {
  return !!(node.payload?.fold);
}

/**
 * Check if a node has children.
 */
function hasChildren(node: INode): boolean {
  return !!(node.children && node.children.length > 0);
}

interface MindmapViewerProps {
  markdown: string;
}

export function MindmapViewer({ markdown }: MindmapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const markmapRef = useRef<Markmap | null>(null);
  const focusedRef = useRef<INode | null>(null);
  const parentMapRef = useRef<Map<INode, INode | null>>(new Map());
  const rootRef = useRef<INode | null>(null);

  // Force re-render trigger for controls disabled state etc.
  const [, setTick] = useState(0);
  const tick = useCallback(() => setTick((t) => t + 1), []);

  /**
   * Focus a node: highlight it + ensure it's visible in the viewport.
   */
  const focusNode = useCallback((node: INode) => {
    const mm = markmapRef.current;
    if (!mm) return;

    focusedRef.current = node;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mm as any).setHighlight(node);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mm as any).centerNode(node);
    tick();
  }, [tick]);

  /**
   * Collapse all nodes to show only the root, then re-fit.
   */
  const collapseAll = useCallback(() => {
    const mm = markmapRef.current;
    const root = rootRef.current;
    if (!mm || !root) return;

    function foldAll(node: INode) {
      if (hasChildren(node)) {
        node.payload = { ...node.payload, fold: 1 };
        for (const child of node.children!) {
          foldAll(child);
        }
      }
    }

    // Fold everything except root
    if (root.children) {
      for (const child of root.children) {
        foldAll(child);
      }
    }
    // Keep root expanded so we see the first level
    root.payload = { ...root.payload, fold: 0 };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mm as any).renderData(root).then(() => {
      mm.fit();
      focusNode(root);
    });
  }, [focusNode]);

  /**
   * Expand all nodes fully, then re-fit.
   */
  const expandAll = useCallback(() => {
    const mm = markmapRef.current;
    const root = rootRef.current;
    if (!mm || !root) return;

    function unfoldAll(node: INode) {
      node.payload = { ...node.payload, fold: 0 };
      if (node.children) {
        for (const child of node.children) {
          unfoldAll(child);
        }
      }
    }
    unfoldAll(root);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mm as any).renderData(root).then(() => {
      mm.fit();
      if (focusedRef.current) focusNode(focusedRef.current);
    });
  }, [focusNode]);

  /**
   * Fit the view to show all visible content.
   */
  const fitView = useCallback(() => {
    markmapRef.current?.fit();
  }, []);

  /**
   * Navigate: move focus based on direction.
   */
  const navigate = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      const mm = markmapRef.current;
      const focused = focusedRef.current;
      const root = rootRef.current;
      if (!mm || !focused || !root) return;

      const parentMap = parentMapRef.current;
      const parent = parentMap.get(focused) ?? null;

      switch (direction) {
        case "right": {
          if (!hasChildren(focused)) return;

          if (isFolded(focused)) {
            // Expand the node, then move to first child
            focused.payload = { ...focused.payload, fold: 0 };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (mm as any).renderData(focused).then(() => {
              focusNode(focused.children![0]);
            });
          } else {
            // Already expanded -> move focus to first child
            focusNode(focused.children![0]);
          }
          break;
        }

        case "left": {
          // Move to parent (no collapsing -- use Collapse All for that)
          if (parent) {
            focusNode(parent);
          }
          break;
        }

        case "down": {
          if (!parent) return;
          const siblings = parent.children!;
          const idx = siblings.indexOf(focused);
          if (idx < siblings.length - 1) {
            focusNode(siblings[idx + 1]);
          } else {
            // Last child -- go back to parent
            focusNode(parent);
          }
          break;
        }

        case "up": {
          if (!parent) return;
          const siblings = parent.children!;
          const idx = siblings.indexOf(focused);
          if (idx > 0) {
            focusNode(siblings[idx - 1]);
          } else {
            // First child -- go back to parent
            focusNode(parent);
          }
          break;
        }
      }
    },
    [focusNode]
  );

  /**
   * Toggle expand/collapse on the focused node.
   */
  const toggleFocused = useCallback(() => {
    const mm = markmapRef.current;
    const focused = focusedRef.current;
    if (!mm || !focused || !hasChildren(focused)) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mm as any).toggleNode(focused).then(() => {
      focusNode(focused);
    });
  }, [focusNode]);

  /**
   * Render markmap from markdown.
   */
  const renderMarkmap = useCallback(() => {
    if (!svgRef.current || !markdown) return;

    const { root } = transformer.transform(markdown);

    if (markmapRef.current) {
      markmapRef.current.setData(root);
      markmapRef.current.fit();
    } else {
      markmapRef.current = Markmap.create(
        svgRef.current,
        {
          duration: 300,
          maxWidth: 300,
          paddingX: 16,
        },
        root
      );
    }

    // Store root and rebuild parent map
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mmState = (markmapRef.current as any).state;
    const dataRoot = mmState?.data as INode | undefined;
    if (dataRoot) {
      rootRef.current = dataRoot;
      parentMapRef.current = buildParentMap(dataRoot);
      // Focus root initially
      focusNode(dataRoot);
    }
  }, [markdown, focusNode]);

  useEffect(() => {
    renderMarkmap();
  }, [renderMarkmap]);

  // Keyboard handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          navigate("right");
          break;
        case "ArrowLeft":
          e.preventDefault();
          navigate("left");
          break;
        case "ArrowDown":
          e.preventDefault();
          navigate("down");
          break;
        case "ArrowUp":
          e.preventDefault();
          navigate("up");
          break;
        case "Enter":
          e.preventDefault();
          toggleFocused();
          break;
      }
    }

    container.addEventListener("keydown", handleKeyDown);
    // Focus the container so it receives key events
    container.focus();

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate, toggleFocused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (markmapRef.current) {
        markmapRef.current.destroy();
        markmapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full min-h-0 flex-1 outline-none"
      tabIndex={0}
    >
      <svg ref={svgRef} className="h-full w-full" />
      <MindmapControls
        onCollapseAll={collapseAll}
        onExpandAll={expandAll}
        onFit={fitView}
        onNavigate={navigate}
      />
    </div>
  );
}
