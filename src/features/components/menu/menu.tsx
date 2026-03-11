export default function Menu({
  projects,
  newProjectName,
  onNewProjectName,
  onNewProject,
  onSelectedProject,
  onDeleteProject,
  onExportProject,
  onImportProject,
}) {
  const listItems = projects.map((project) => (
    <li key={project.id} onClick={() => onSelectedProject(project)}>
      {project.name}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExportProject(project);
        }}
      >
        Export
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteProject(project);
        }}
      >
        Delete
      </button>
    </li>
  ));

  return (
    <div>
      <input
        type="text"
        value={newProjectName}
        onChange={(e) => onNewProjectName(e.target.value)}
        placeholder="Nom"
      />
      <button onClick={onNewProject}>New Project</button>
      <button onClick={onImportProject}>Import</button>
      <ul>{listItems}</ul>
    </div>
  );
}
