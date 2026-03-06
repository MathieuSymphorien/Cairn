import { Button } from "@/features/ui/button";
import { useEditor, EditorContent } from "@tiptap/react";
import { FloatingMenu, BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";

export default function WorkSpace({ project }) {
  const editor = useEditor({
    extensions: [StarterKit], // define your extension array
    content: "<p>Hello World!</p>", // initial content
  });

  return (
    <>
      <Button onClick={() => editor.chain().focus().toggleBold().run()}>
        Bold
      </Button>
      <EditorContent editor={editor} />
      <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
      <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>
    </>
  );

  if (!project) return <div>Sélectionne un projet</div>;

  const listItems = project.cards.map((card) => (
    <li key={card.id}>
      {card.title}
      {card.description}
    </li>
  ));

  return (
    <>
      <div>
        <ul>{listItems}</ul>
      </div>
      <div>
        <select>
          <option value="todo">To Do</option>
          <option value="inprogress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <button>Ajouter un item</button>
      </div>
    </>
  );
}
