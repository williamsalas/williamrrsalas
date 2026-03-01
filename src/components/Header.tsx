import pikachuGif from "../assets/img/pikaconstruction.gif";

export function Header() {
  return (
    <>
      <h2>hi, i'm william salas 👋</h2>
      <small>software developer from southern california</small>
      <small>
        part of Redfin's search team building the site's most visited pages,
        search and home details
      </small>
      <img src={pikachuGif} className="pikachu" alt="Under Construction" />
    </>
  );
}
