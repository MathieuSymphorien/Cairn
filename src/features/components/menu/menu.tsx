export default function Menu({
  projects,
  newProjectName,
  onNewProjectName,
  onNewProject,
  onSelectedProject,
}) {
  const listItems = projects.map((project) => (
    <li key={project.id} onClick={() => onSelectedProject(project)}>
      {project.name}
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
      <ul>{listItems}</ul>
    </div>
  );
}
