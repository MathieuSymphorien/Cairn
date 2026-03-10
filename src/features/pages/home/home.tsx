import { useState, useEffect, useRef } from "react";
import type { JSONContent } from "@tiptap/core";
import type { Project } from "@/shared/types/project";
import Menu from "../../components/menu/menu";
import WorkSpace from "../../components/workspace/workspace";
import "./home.css";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/shared/api/projects";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const saveTimerRef = useRef<number | null>(null);

  // Charger les projets depuis la BDD au démarrage
  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

  async function handleNewProject() {
    if (!newProjectName.trim()) return;
    const project = await createProject(newProjectName);
    setProjects([...projects, project]);
    setNewProjectName("");
  }

  function handleNewProjectName(name: string) {
    setNewProjectName(name);
  }

  function handleSelectedProject(project: Project) {
    setSelectedProject(project);
  }

  function handleEditorUpdate(content: JSONContent) {
    if (!selectedProject) return;

    // Mettre à jour l'état local immédiatement (pas de lag)
    const updated = { ...selectedProject, content };
    setProjects(
      projects.map((p) => (p.id === updated.id ? updated : p)),
    );
    setSelectedProject(updated);

    // Debounce : sauvegarder en BDD 500ms après la dernière frappe
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      updateProject(updated);
    }, 500);
  }

  async function handleDeleteProject(project: Project) {
    await deleteProject(project.id);
    setProjects(projects.filter((p) => p.id !== project.id));
    if (selectedProject?.id === project.id) {
      setSelectedProject(null);
    }
  }

  return (
    <div className="home">
      <div>
        <Menu
          projects={projects}
          newProjectName={newProjectName}
          onSelectedProject={handleSelectedProject}
          onDeleteProject={handleDeleteProject}
          onNewProjectName={handleNewProjectName}
          onNewProject={handleNewProject}
        />
      </div>
      <div>
        <WorkSpace project={selectedProject} onUpdate={handleEditorUpdate} />
      </div>
    </div>
  );
}
