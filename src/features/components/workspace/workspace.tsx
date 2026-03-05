export default function WorkSpace({ project }) {
  if (!project) return <div>Sélectionne un projet</div>;

  const listItems = project.cards.map((card) => (
    <li key={card.id}>
      {card.title}
      {card.description}
    </li>
  ));

  return (
    <div>
      <ul>{listItems}</ul>
    </div>
  );
}
