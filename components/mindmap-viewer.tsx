"use client";

import { useRef, useEffect, useCallback } from "react";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";

const transformer = new Transformer();

interface MindmapViewerProps {
  markdown: string;
}

export function MindmapViewer({ markdown }: MindmapViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const markmapRef = useRef<Markmap | null>(null);

  const renderMarkmap = useCallback(() => {
    if (!svgRef.current || !markdown) return;

    const { root } = transformer.transform(markdown);

    if (markmapRef.current) {
      // Update existing instance with new data
      markmapRef.current.setData(root);
      markmapRef.current.fit();
    } else {
      // Create new markmap instance
      markmapRef.current = Markmap.create(svgRef.current, {
        duration: 300,
        maxWidth: 300,
        paddingX: 16,
      }, root);
    }
  }, [markdown]);

  useEffect(() => {
    renderMarkmap();
  }, [renderMarkmap]);

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
    <div className="relative h-full w-full min-h-0 flex-1">
      <svg
        ref={svgRef}
        className="h-full w-full"
      />
    </div>
  );
}
