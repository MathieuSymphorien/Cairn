import type { JSONContent } from "@tiptap/core";

export type Project = {
  id: number;
  name: string;
  content: JSONContent;
};
