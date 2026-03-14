interface ProjectTileData {
  id: string;
  name: string;
  route: string | null;
  image?: string;
  imageSize?: "cover" | "contain";
}

interface ProjectTileProps {
  project: ProjectTileData;
  navigate: (to: string) => void;
}

export type { ProjectTileData };

export function ProjectTile({ project, navigate }: ProjectTileProps) {
  const bgStyle = project.image
    ? {
        backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.2)), url(${project.image})`,
        backgroundSize: project.imageSize ?? "cover",
      }
    : undefined;

  const { route } = project;

  if (!route) {
    return (
      <div
        className="project-tile project-tile--disabled"
        aria-disabled="true"
        style={bgStyle}
      >
        <span className="project-tile-badge">coming soon</span>
        <span className="project-tile-label">{project.name}</span>
      </div>
    );
  }

  return (
    <a
      href={route}
      className="project-tile"
      style={bgStyle}
      onClick={(e) => {
        e.preventDefault();
        navigate(route);
      }}
    >
      <span className="project-tile-label">{project.name}</span>
    </a>
  );
}
