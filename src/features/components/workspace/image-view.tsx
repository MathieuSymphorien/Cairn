import { useState, useEffect } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { readImage } from "@/shared/api/projects";

export function ImageView({ node }: NodeViewProps) {
  const [displaySrc, setDisplaySrc] = useState<string | null>(null);
  const src: string = node.attrs.src ?? "";

  useEffect(() => {
    if (!src) {
      setDisplaySrc(null);
      return;
    }

    if (src.startsWith("cairn-local://")) {
      const filename = src.replace("cairn-local://", "");
      readImage(filename).then(setDisplaySrc).catch(() => setDisplaySrc(null));
    } else if (src.startsWith("https://cairn-img.localhost/")) {
      // Legacy format
      const filename = src.replace("https://cairn-img.localhost/", "");
      readImage(filename).then(setDisplaySrc).catch(() => setDisplaySrc(null));
    } else {
      // data: URI or regular URL — use directly
      setDisplaySrc(src);
    }
  }, [src]);

  if (!displaySrc) {
    return (
      <NodeViewWrapper>
        <div className="inline-block w-16 h-16 bg-muted rounded animate-pulse" />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <img
        src={displaySrc}
        alt={node.attrs.alt ?? ""}
        title={node.attrs.title ?? undefined}
        style={{ maxWidth: "100%" }}
        draggable={false}
      />
    </NodeViewWrapper>
  );
}
