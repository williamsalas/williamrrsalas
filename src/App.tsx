import "./App.css";
import { Header } from "./components/Header.tsx";
import { GitHubActivity } from "./components/GitHubActivity.tsx";
import { Footer } from "./components/Footer.tsx";
import { MenuButton } from "./components/MenuButton.tsx";
import { BtcPage } from "./components/btc/BtcPage.tsx";
import { useRoute } from "./hooks/useRoute.ts";

function HomePage() {
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

export default function App() {
  const { path, navigate } = useRoute();

  return (
    <>
      <MenuButton navigate={navigate} />
      {path === "/btc" ? <BtcPage /> : <HomePage />}
    </>
  );
}
