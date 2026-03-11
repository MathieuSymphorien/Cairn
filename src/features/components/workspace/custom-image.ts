import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageView } from "./image-view";

export const CustomImage = Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
});
