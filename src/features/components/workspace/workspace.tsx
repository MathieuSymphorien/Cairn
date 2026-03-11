import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { CustomImage } from "./custom-image";
import { Bold, Italic } from "lucide-react";
import Toolbar from "./toolbar";
import { ImagePasteHandler } from "./image-paste-handler";
import { DrawingNode } from "./drawing-node";
import type { JSONContent } from "@tiptap/core";
import type { Project } from "@/shared/types/project";

interface WorkSpaceProps {
  project: Project | null;
  onUpdate?: (content: JSONContent) => void;
}

export default function WorkSpace({ project, onUpdate }: WorkSpaceProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      CustomImage.configure({ allowBase64: true }),
      ImagePasteHandler,
      DrawingNode,
    ],
    content: project?.content ?? {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getJSON());
    },
  });

  // Quand on change de projet, charger son contenu dans l'éditeur
  useEffect(() => {
    if (editor && project) {
      editor.commands.setContent(project.content);
    }
  }, [editor, project?.id]);

  if (!project) {
    return <div>Sélectionne un projet</div>;
  }

  return (
    <div>
      <div>
        <Toolbar editor={editor} />
      </div>

      <div>
        <EditorContent editor={editor} />
      </div>

      {editor && (
        <BubbleMenu editor={editor}>
          <button onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold />
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic />
          </button>
        </BubbleMenu>
      )}
    </div>
  );
}
