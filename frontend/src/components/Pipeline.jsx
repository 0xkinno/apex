import { useState } from "react";

const PANELS = [
  { num: "01", label: "REGIME ENGINE",   pending: "Waiting…", result: "TRENDING_BULL ✓", color: "var(--accent-green)" },
  { num: "02", label: "KELLY SIZING",    pending: "Waiting…", result: "12.4% exposure ✓", color: "var(--accent-cyan)" },
  { num: "03", label: "ROTATION SCORE",  pending: "Waiting…", result: "BNB #1 · score=+0.71 ✓", color: "var(--accent-gold)" },
  { num: "04", label: "COMMIT HASH",     pending: "Waiting…", result: "0x3f8a…c291 ✓", color: "var(--accent-purple)" },
];

export default function Pipeline() {
  const [step, setStep]       = useState(-1);
  const [running, setRunning] = useState(false);

  const run = () => {
    if (running) return;
    setRunning(true);
    setStep(-1);
    PANELS.forEach((_, i) => {
      setTimeout(() => {
        setStep(i);
        if (i === PANELS.length - 1) setRunning(false);
      }, i * 700 + 300);
    });
  };

  return (
    <section className="section-deep">
      <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 72, alignItems: "center" }}>

        {/* Left text */}
        <div>
          <div className="mono" style={{
            fontSize: 10, color: "#334455", letterSpacing: "0.13em",
            textTransform: "uppercase", marginBottom: 18,
          }}>
            SIGNAL PIPELINE
          </div>
          <h2 style={{
            fontSize: "clamp(32px,3.5vw,50px)",
            fontWeight: 900, lineHeight: 1.0,
            letterSpacing: "-0.03em", marginBottom: 20,
          }}>
            Run the Skill.<br />
            <span style={{ color: "#333" }}>Verify the output.</span>
          </h2>
          <p style={{
            fontSize: 15, color: "#8899AA", lineHeight: 1.75,
            marginBottom: 32, maxWidth: 380,
          }}>
            Four named layers run in sequence. Each commits its result.
            Judges can recompute every step independently — no trust required.
          </p>
          <button
            className="btn-outline"
            onClick={run}
            disabled={running}
            style={{ opacity: running ? 0.5 : 1 }}
          >
            {running ? "Running pipeline…" : "▶ Run demo signal"}
          </button>
        </div>

        {/* Right — 2×2 panels */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          border: "1px solid #1A2E4A", borderRadius: 12, overflow: "hidden",
        }}>
          {PANELS.map((p, i) => (
            <div
              key={p.num}
              style={{
                background: step >= i ? `${p.color}09` : "var(--bg-panel)",
                borderRight: i % 2 === 0 ? "1px solid #1A2E4A" : "none",
                borderBottom: i < 2 ? "1px solid #1A2E4A" : "none",
                padding: 28,
                transition: "background 0.4s ease",
                position: "relative",
              }}
            >
              <div className="mono" style={{
                position: "absolute", top: 16, right: 16,
                fontSize: 10, color: "#1E3A5F",
              }}>
                {p.num}
              </div>
              <div className="mono" style={{
                fontSize: 9, color: "#334455",
                letterSpacing: "0.08em", marginBottom: 14,
                textTransform: "uppercase",
              }}>
                {p.label}
              </div>
              <div style={{
                fontSize: 15, fontWeight: 700,
                color: step >= i ? p.color : "#1E3A5F",
                opacity: step >= i ? 1 : 0.35,
                transition: "color 0.45s ease, opacity 0.45s ease",
              }}>
                {step >= i ? p.result : p.pending}
              </div>
              {step >= i && (
                <div style={{
                  marginTop: 8, width: "100%", height: 2,
                  background: `linear-gradient(90deg, ${p.color}, transparent)`,
                  borderRadius: 1,
                  animation: "fadeIn 0.5s ease",
                }} />
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
