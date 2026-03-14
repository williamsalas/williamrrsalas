import { useEffect } from "react";
import "./App.less";
import { Header } from "./components/Header.tsx";
import { GitHubActivity } from "./components/GitHubActivity.tsx";
import { Footer } from "./components/Footer.tsx";
import { MenuButton } from "./components/MenuButton.tsx";
import { BtcPage } from "./components/btc/BtcPage.tsx";
import { useRoute } from "./hooks/useRoute.ts";

function HomePage({ navigate }: { navigate: (to: string) => void }) {
  return (
    <>
      <Header navigate={navigate} />
      <div className="bottom-flex-container">
        <div className="activity-panel">
          <h3 className="github-activity">recent activity</h3>
          <GitHubActivity />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function App() {
  const { path, navigate } = useRoute();

  useEffect(() => {
    document.title =
      path === "/btc" ? "BTC Visualizer" : "william salas | software dev";
  }, [path]);

  return (
    <>
      <MenuButton navigate={navigate} />
      {path === "/btc" ? <BtcPage /> : <HomePage navigate={navigate} />}
    </>
  );
}
