import { ProjectCarousel } from "./ProjectCarousel.tsx";

interface HeaderProps {
  navigate: (to: string) => void;
}

export function Header({ navigate }: HeaderProps) {
  return (
    <>
      <h2>hi, i'm william salas 👋</h2>
      <small>software developer from southern california</small>
      <small>
        part of Redfin's search team building the site's most visited pages,
        search and home details
      </small>
      <ProjectCarousel navigate={navigate} />
    </>
  );
}
