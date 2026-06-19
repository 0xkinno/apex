import { useRef, useEffect, useState } from "react";

const CELLS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  type: i === 12 ? "CRISIS"
      : i === 7 || i === 19 ? "BEAR"
      : i >= 25 ? "EMPTY"
      : "BULL",
  label: `SIG-${String(i + 1).padStart(4, "0")}`,
}));

const COLORS = {
  BULL:   "#00FF88",
  BEAR:   "#FF3B5C",
  CRISIS: "#FF0055",
  EMPTY:  "#1A2E4A",
};

const CHECKS = [
  "CMC MCP endpoint connected",
  "x402 per-request payments active",
  "On-chain attestation verified",
  "ERC-8004 agent identity registered",
  "BNB Agent SDK integrated",
  "Kelly sizing enforced per regime",
];

export default function RegimeGrid() {
  const gridRef = useRef();
  const rightRef = useRef();
  const [visible, setVisible] = useState(false);
  const [rightVisible, setRightVisible] = useState(false);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const o1 = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); o1.disconnect(); }
    }, { threshold: 0.3 });
    const o2 = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setRightVisible(true); o2.disconnect(); }
    }, { threshold: 0.3 });

    if (gridRef.current)  o1.observe(gridRef.current);
    if (rightRef.current) o2.observe(rightRef.current);
    return () => { o1.disconnect(); o2.disconnect(); };
  }, []);

  const totalSigs  = CELLS.filter(c => c.type !== "EMPTY").length;
  const bullCount  = CELLS.filter(c => c.type === "BULL").length;

  return (
    <section className="section" style={{ background: "#0D1B2E", borderTop: "1px solid #1A2E4A" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>

        {/* Left — heatmap */}
        <div>
          <div
            ref={gridRef}
            className="card-panel"
            style={{ padding: 28 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div className="mono" style={{ fontSize: 10, color: "#334455" }}>
                SIGNAL HISTORY · APEX-SKILL
              </div>
              <span style={{ fontWeight: 700, fontSize: 26, color: "#fff" }}>
                {totalSigs}
              </span>
            </div>
            <div className="mono" style={{ fontSize: 9, color: "#334455", marginBottom: 20 }}>
              total signals · committed to BSC Testnet
            </div>

            {/* Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 5,
            }}>
              {CELLS.map((cell, i) => (
                <div
                  key={cell.id}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  title={`${cell.label} · ${cell.type}`}
                  style={{
                    width: "100%", paddingBottom: "100%",
                    borderRadius: 4,
                    background: COLORS[cell.type],
                    opacity: cell.type === "EMPTY" ? 0.25
                           : visible ? (hover === i ? 1 : 0.72) : 0,
                    transform: hover === i ? "scale(1.18)" : "scale(1)",
                    transition: `opacity 0.3s ease ${i * 22}ms, transform 0.18s ease`,
                    cursor: "pointer",
                    boxShadow: hover === i ? `0 0 14px ${COLORS[cell.type]}` : "none",
                    position: "relative",
                  }}
                />
              ))}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 20, marginTop: 18, flexWrap: "wrap" }}>
              {[["#00FF88", "bull signal"], ["#FF3B5C", "bear signal"], ["#FF0055", "crisis/abstain"]].map(([c, l]) => (
                <div key={l} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "block" }} />
                  <span className="mono" style={{ fontSize: 9, color: "#334455" }}>{l}</span>
                </div>
              ))}
            </div>

            {/* Score */}
            <div style={{
              marginTop: 20, paddingTop: 16,
              borderTop: "1px solid #1A2E4A",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span className="mono" style={{ fontSize: 9, color: "#334455" }}>track record</span>
              <span style={{
                fontWeight: 700, fontSize: 17,
                color: "var(--accent-green)",
                textShadow: "0 0 12px rgba(0,255,136,0.4)",
              }}>
                {bullCount} / {totalSigs}
              </span>
            </div>
          </div>

          <h3 style={{ fontSize: 22, fontWeight: 700, marginTop: 28, color: "#fff" }}>
            Every signal builds the record
          </h3>
          <p style={{ fontSize: 14, color: "#8899AA", marginTop: 10, lineHeight: 1.75 }}>
            Every committed signal strengthens APEX's verifiable track record.
            Every abstention is explained. The record compounds — portable to any
            CMC agent marketplace.
          </p>
        </div>

        {/* Right — eligibility */}
        <div ref={rightRef}>
          <div
            className="card-panel"
            style={{
              padding: 28,
              opacity: rightVisible ? 1 : 0,
              transform: rightVisible ? "translateX(0)" : "translateX(40px)",
              transition: "opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s",
            }}
          >
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 24,
            }}>
              <div className="mono" style={{ fontSize: 10, color: "#334455" }}>
                APEX SKILL STATUS
              </div>
              <span className="badge badge-green" style={{
                textShadow: "0 0 10px rgba(0,255,136,0.7)",
              }}>
                ELIGIBLE
              </span>
            </div>

            {CHECKS.map(item => (
              <div key={item} style={{
                display: "flex", gap: 12, alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid #1A2E4A",
              }}>
                <span style={{ color: "var(--accent-green)", fontSize: 14, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13, color: "#fff" }}>{item}</span>
              </div>
            ))}

            <div style={{
              marginTop: 24, padding: 20,
              background: "rgba(0,255,136,0.04)",
              border: "1px solid rgba(0,255,136,0.15)",
              borderRadius: 10,
            }}>
              <div className="mono" style={{ fontSize: 9, color: "var(--accent-green)", marginBottom: 8 }}>
                SPECIAL PRIZES TARGETING
              </div>
              <div style={{ fontWeight: 700, fontSize: 22, color: "#fff" }}>$4,000</div>
              <div style={{ fontSize: 12, color: "#8899AA", marginTop: 6, lineHeight: 1.6 }}>
                Best Use of Agent Hub ($2,000)<br />
                Best Use of BNB AI Agent SDK ($2,000)
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: 22, fontWeight: 700, marginTop: 28, color: "#fff" }}>
            Prove it. Don't claim it.
          </h3>
          <p style={{ fontSize: 14, color: "#8899AA", marginTop: 10, lineHeight: 1.75 }}>
            Run{" "}
            <code className="mono" style={{ color: "var(--text-code)", fontSize: 12 }}>
              python3 recompute_verify.py
            </code>
            {" "}yourself. Read the commit. Recompute the hash. Watch it match.
            The math is the audit.
          </p>
        </div>

      </div>
    </section>
  );
}
