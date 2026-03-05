import { Project } from "../types/project";

export const mockProjects: Project[] = [
  {
    id: 1,
    name: "Project Alpha",
    cards: [
      { id: 1, title: "Card 1", description: "Description for Card 1" },
      { id: 2, title: "Card 2", description: "Description for Card 2" },
    ],
  },
  {
    id: 2,
    name: "Project Beta",
    cards: [
      { id: 3, title: "Card 3", description: "Description for Card 3" },
      { id: 4, title: "Card 4", description: "Description for Card 4" },
    ],
  },
];
