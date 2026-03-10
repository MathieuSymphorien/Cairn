import { Project } from "../types/project";

export const mockProjects: Project[] = [
  {
    id: 1,
    name: "Project Alpha",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Contenu du projet Alpha" }],
        },
      ],
    },
  },
  {
    id: 2,
    name: "Project Beta",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Contenu du projet Beta" }],
        },
      ],
    },
  },
];
