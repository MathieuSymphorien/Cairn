import { type Editor } from "@tiptap/react";
import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Minus,
  Pencil,
} from "lucide-react";

interface ToolbarProps {
  editor: Editor | null;
}

export default function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {/* Formatage texte */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(
          editor.isActive("bold") && "bg-accent text-accent-foreground",
        )}
        title="Gras"
      >
        <Bold className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          editor.isActive("italic") && "bg-accent text-accent-foreground",
        )}
        title="Italique"
      >
        <Italic className="size-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Titres */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          editor.isActive("heading", { level: 1 }) &&
            "bg-accent text-accent-foreground",
        )}
        title="Titre 1"
      >
        <Heading1 className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          editor.isActive("heading", { level: 2 }) &&
            "bg-accent text-accent-foreground",
        )}
        title="Titre 2"
      >
        <Heading2 className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn(
          editor.isActive("heading", { level: 3 }) &&
            "bg-accent text-accent-foreground",
        )}
        title="Titre 3"
      >
        <Heading3 className="size-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Listes */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          editor.isActive("bulletList") && "bg-accent text-accent-foreground",
        )}
        title="Liste à puces"
      >
        <List className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          editor.isActive("orderedList") && "bg-accent text-accent-foreground",
        )}
        title="Liste numérotée"
      >
        <ListOrdered className="size-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Blocs */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn(
          editor.isActive("codeBlock") && "bg-accent text-accent-foreground",
        )}
        title="Bloc de code"
      >
        <Code className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Ligne horizontale"
      >
        <Minus className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().insertDrawing().run()}
        title="Dessin à main levée"
      >
        <Pencil className="size-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />
    </div>
  );
}
