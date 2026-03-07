import { useState } from "react";
import Menu from "../../components/menu/menu";
import WorkSpace from "../../components/workspace/workspace";
import "./home.css";
import { mockProjects } from "../../../shared/mockdata/mockdata";

export default function Home() {
  const [projects, setProjects] = useState(mockProjects);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);

  function handleNewProject() {
    setProjects([
      ...projects,
      {
        id: projects.length + 1,
        name: newProjectName,
        content: "<p>Commence à écrire...</p>",
      },
    ]);
    setNewProjectName("");
  }

  function handleNewProjectName(name: string) {
    setNewProjectName(name);
  }

  function handleSelectedProject(project) {
    setSelectedProject(project);
  }

  function handleEditorUpdate(content: string) {
    if (!selectedProject) return;
    // console.log(content);
    setProjects(
      projects.map((p) =>
        p.id === selectedProject.id ? { ...p, content } : p,
      ),
    );
  }

  function handleDeleteProject(project) {
    setProjects(projects.filter((p) => p.id !== project.id));
    if (selectedProject.id == project.id) {
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
