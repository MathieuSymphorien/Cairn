import { invoke } from "@tauri-apps/api/core";
import { save, open } from "@tauri-apps/plugin-dialog";
import type { Project } from "../types/project";

/** Save a base64 data URI to disk. Returns cairn-local://filename */
export async function saveImage(
  dataUri: string,
  existingFilename?: string,
): Promise<string> {
  const filename = await invoke<string>("save_image", {
    dataUri,
    filename: existingFilename ?? null,
  });
  return `cairn-local://${filename}`;
}

/** Read an image from disk by filename, returns a data: URI */
export async function readImage(filename: string): Promise<string> {
  return invoke<string>("read_image", { filename });
}

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

export async function exportProject(project: Project): Promise<void> {
  const path = await save({
    defaultPath: `${project.name}.cairn.json`,
    filters: [{ name: "Cairn Project", extensions: ["cairn.json"] }],
  });
  if (!path) return;
  return invoke("export_project", { id: project.id, path });
}

export async function importProject(): Promise<Project | null> {
  const path = await open({
    filters: [{ name: "Cairn Project", extensions: ["cairn.json"] }],
  });
  if (!path) return null;
  return invoke<Project>("import_project", { path });
}
