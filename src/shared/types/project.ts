import { Card } from "./card";

export type Project = {
  id: number;
  name: string;
  cards: Card[];
};
