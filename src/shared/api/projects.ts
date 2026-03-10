import { invoke } from "@tauri-apps/api/core";
import type { Project } from "../types/project";

export async function getProjects(): Promise<Project[]> {
  return invoke<Project[]>("get_projects");
}

export async function createProject(name: string): Promise<Project> {
  return invoke<Project>("create_project", { name });
}

export async function updateProject(project: Project): Promise<void> {
  return invoke("update_project", {
    id: project.id,
    name: project.name,
    content: project.content,
  });
}

export async function deleteProject(id: number): Promise<void> {
  return invoke("delete_project", { id });
}
