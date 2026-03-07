import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";
import { Bold, Italic } from "lucide-react";
import Toolbar from "./toolbar";
import { ImagePasteHandler } from "./image-paste-handler";
import { DrawingNode } from "./drawing-node";
import type { Project } from "@/shared/types/project";

interface WorkSpaceProps {
  project: Project | null;
  onUpdate?: (content: string) => void;
}

export default function WorkSpace({ project, onUpdate }: WorkSpaceProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ allowBase64: true }),
      ImagePasteHandler,
      DrawingNode,
    ],
    content: project?.content ?? "<p>Commence à écrire...</p>",
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
  });

  // Quand on change de projet, charger son contenu dans l'éditeur
  useEffect(() => {
    if (editor && project) {
      editor.commands.setContent(project.content);
    }
  }, [editor, project?.id]);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Sélectionne un projet
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border bg-background px-2 py-1">
        <Toolbar editor={editor} />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <EditorContent editor={editor} />
      </div>

      {editor && (
        <BubbleMenu
          editor={editor}
          className="flex items-center gap-0.5 rounded-lg border border-border bg-background p-1 shadow-md"
        >
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(editor.isActive("bold") && "bg-accent text-accent-foreground")}
          >
            <Bold className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(editor.isActive("italic") && "bg-accent text-accent-foreground")}
          >
            <Italic className="size-4" />
          </Button>
        </BubbleMenu>
      )}
    </div>
  );
}
