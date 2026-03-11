import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { saveImage } from "@/shared/api/projects";

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function saveAndInsertImage(file: File, editor: any) {
  const dataUri = await readFileAsBase64(file);
  // saveImage returns "cairn-local://filename" — stored directly in content
  const localRef = await saveImage(dataUri);
  editor.chain().focus().setImage({ src: localRef }).run();
}

function handleImageFiles(files: FileList, editor: any): boolean {
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    saveAndInsertImage(file, editor);
    return true;
  }
  return false;
}

export const ImagePasteHandler = Extension.create({
  name: "imagePasteHandler",

  addProseMirrorPlugins() {
    const { editor } = this;

    return [
      new Plugin({
        key: new PluginKey("imagePasteHandler"),

        props: {
          handlePaste(_view, event) {
            const files = event.clipboardData?.files;
            if (!files?.length) return false;
            event.preventDefault();
            return handleImageFiles(files, editor);
          },

          handleDrop(_view, event, _slice, moved) {
            if (moved) return false;
            const dragEvent = event as unknown as DragEvent;
            const files = dragEvent.dataTransfer?.files;
            if (!files?.length) return false;
            event.preventDefault();
            return handleImageFiles(files, editor);
          },
        },
      }),
    ];
  },

  onCreate() {
    const { editor } = this;
    const element = editor.view.dom;

    element.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    element.addEventListener("drop", (e) => {
      const files = e.dataTransfer?.files;
      if (!files?.length) return;
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        e.preventDefault();
        e.stopPropagation();
        saveAndInsertImage(file, editor);
        return;
      }
    });
  },
});
