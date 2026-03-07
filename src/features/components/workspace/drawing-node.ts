// FICHIER GENERE PAR CLAUDE CODE
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { DrawingCanvas } from "./drawing-canvas";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    drawing: {
      insertDrawing: () => ReturnType;
    };
  }
}

export const DrawingNode = Node.create({
  name: "drawing",
  group: "block",
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: 600 },
      height: { default: 300 },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="drawing"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "drawing" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DrawingCanvas);
  },

  addCommands() {
    return {
      insertDrawing:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          });
        },
    };
  },
});
