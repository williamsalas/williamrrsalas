import { useEffect } from "react";
import "./App.less";
import { Header } from "./components/Header.tsx";
import { GitHubActivity } from "./components/GitHubActivity.tsx";
import { Footer } from "./components/Footer.tsx";
import { MenuButton } from "./components/MenuButton.tsx";
import { BtcPage } from "./components/btc/BtcPage.tsx";
import { ClaudeFormatterPage } from "./components/claude-formatter/ClaudeFormatterPage.tsx";
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
    const titles: Record<string, string> = {
      "/btc": "BTC Visualizer",
      "/claude-formatter": "Claude Code Formatter",
    };
    document.title = titles[path] ?? "william salas | software dev";
  }, [path]);

  return (
    <>
      <MenuButton navigate={navigate} />
      {path === "/btc" ? (
        <BtcPage />
      ) : path === "/claude-formatter" ? (
        <ClaudeFormatterPage />
      ) : (
        <HomePage navigate={navigate} />
      )}
    </>
  );
}
