import { useRef, useEffect, useCallback, useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import getStroke from "perfect-freehand";
import { Button } from "@/features/ui/button";
import { Trash2 } from "lucide-react";
import { saveImage, readImage } from "@/shared/api/projects";

function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return "";
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"],
  );
  d.push("Z");
  return d.join(" ");
}

export function DrawingCanvas({ node, updateAttributes }: NodeViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<number[][][]>([]);
  const currentPath = useRef<number[][]>([]);

  const width = node.attrs.width ?? 600;
  const height = node.attrs.height ?? 300;

  const redraw = useCallback(
    (allPaths: number[][][]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (const path of allPaths) {
        const stroke = getStroke(path, {
          size: 4,
          thinning: 0.5,
          smoothing: 0.5,
          streamline: 0.5,
        });
        const pathData = getSvgPathFromStroke(stroke);
        const path2d = new Path2D(pathData);
        ctx.fillStyle = "currentColor";
        ctx.fill(path2d);
      }
    },
    [width, height],
  );

  // Load existing drawing: src is "cairn-local://filename" or legacy format
  useEffect(() => {
    const src: string = node.attrs.src ?? "";
    if (!src || !canvasRef.current) return;

    let filename: string | null = null;
    if (src.startsWith("cairn-local://")) {
      filename = src.replace("cairn-local://", "");
    } else if (src.startsWith("https://cairn-img.localhost/")) {
      filename = src.replace("https://cairn-img.localhost/", "");
    } else if (src.startsWith("data:")) {
      // Legacy base64 stored directly
      const img = new window.Image();
      img.onload = () => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = src;
      return;
    }

    if (filename) {
      readImage(filename).then((dataUri) => {
        const img = new window.Image();
        img.onload = () => {
          const ctx = canvasRef.current?.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0);
          }
        };
        img.src = dataUri;
      });
    }
  }, [node.attrs.src, width, height]);

  function handlePointerDown(e: React.PointerEvent) {
    e.preventDefault();
    setIsDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    currentPath.current = [
      [e.clientX - rect.left, e.clientY - rect.top, e.pressure],
    ];
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDrawing) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    currentPath.current.push([
      e.clientX - rect.left,
      e.clientY - rect.top,
      e.pressure,
    ]);
    redraw([...paths, currentPath.current]);
  }

  async function handlePointerUp() {
    if (!isDrawing) return;
    setIsDrawing(false);
    const newPaths = [...paths, currentPath.current];
    setPaths(newPaths);
    currentPath.current = [];

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUri = canvas.toDataURL("image/png");

    // Reuse existing filename if one exists (avoids creating duplicate files)
    const currentSrc: string = node.attrs.src ?? "";
    let existingFilename: string | undefined;
    if (currentSrc.startsWith("cairn-local://")) {
      existingFilename = currentSrc.replace("cairn-local://", "");
    }

    const localRef = await saveImage(dataUri, existingFilename);
    updateAttributes({ src: localRef });
  }

  function handleClear() {
    setPaths([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, width, height);
      updateAttributes({ src: null });
    }
  }

  return (
    <NodeViewWrapper>
      <div className="drawing-container" contentEditable={false}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="drawing-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        <div className="drawing-toolbar">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            title="Effacer"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
