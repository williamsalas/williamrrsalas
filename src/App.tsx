import "./App.css";
import { Header } from "./components/Header.tsx";
import { GitHubActivity } from "./components/GitHubActivity.tsx";
import { Footer } from "./components/Footer.tsx";

export default function App() {
  return (
    <>
      <Header />
      <div className="bottom-flex-container">
        <div className="bottom-left">
          <h3 className="github-activity">recent activity</h3>
          <GitHubActivity />
        </div>
      </div>
      <Footer />
    </>
  );
}
