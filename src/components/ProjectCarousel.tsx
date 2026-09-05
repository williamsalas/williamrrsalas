import { ProjectTile } from "./ProjectTile.tsx";
import type { ProjectTileData } from "./ProjectTile.tsx";
import btcLogo from "../assets/img/btclogo.png";
import pikachuGif from "../assets/img/pikaconstruction.gif";

const PROJECTS: ProjectTileData[] = [
  {
    id: "btc",
    name: "BTC Visualizer",
    route: "/btc",
    image: btcLogo,
    imageSize: "contain",
  },
  {
    id: "globe",
    name: "Guess the Globe",
    route: null,
    image: pikachuGif,
    imageSize: "contain",
  },
];

interface ProjectCarouselProps {
  navigate: (to: string) => void;
}

export function ProjectCarousel({ navigate }: ProjectCarouselProps) {
  return (
    <div className="projects-carousel">
      {PROJECTS.map((project) => (
        <ProjectTile key={project.id} project={project} navigate={navigate} />
      ))}
    </div>
  );
}
