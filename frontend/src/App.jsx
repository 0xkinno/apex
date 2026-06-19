import { useState } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import WidgetShowcase from "./components/WidgetShowcase";
import HowItWorks from "./components/HowItWorks";
import RegimeGrid from "./components/RegimeGrid";
import Pipeline from "./components/Pipeline";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg-base)" }}>
      <Nav page={page} setPage={setPage} />
      {page === "dashboard" ? (
        <Dashboard setPage={setPage} />
      ) : (
        <>
          <Hero setPage={setPage} />
          <Stats />
          <div id="widget-section"><WidgetShowcase /></div>
          <div id="how-it-works"><HowItWorks /></div>
          <div id="regime-section"><RegimeGrid /></div>
          <Pipeline />
          <Footer setPage={setPage} />
        </>
      )}
    </div>
  );
}
