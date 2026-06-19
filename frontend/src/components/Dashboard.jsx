import { useState, useEffect } from "react";

const REGIMES  = ["TRENDING_BULL", "TRENDING_BEAR", "CHOPPY_RANGE", "CRISIS"];
const DIRS     = ["LONG", "SHORT", "ABSTAIN"];
const TOKENS   = ["BNB", "ETH", "CAKE", "AAVE", "INJ", "PENDLE", "LINK", "UNI"];

const REGIME_COLOR = {
  TRENDING_BULL: "#00FF88",
  TRENDING_BEAR: "#FF3B5C",
  CHOPPY_RANGE:  "#F5A623",
  CRISIS:        "#FF0055",
};
const REGIME_BG = {
  TRENDING_BULL: "rgba(0,255,136,0.07)",
  TRENDING_BEAR: "rgba(255,59,92,0.07)",
  CHOPPY_RANGE:  "rgba(245,166,35,0.07)",
  CRISIS:        "rgba(255,0,85,0.07)",
};

function mockSignal(id) {
  const regime = REGIMES[Math.floor(Math.random() * 4)];
  const dir    = regime === "CRISIS" ? "ABSTAIN" : DIRS[Math.floor(Math.random() * 3)];
  const conf   = dir === "ABSTAIN" ? 0 : 0.46 + Math.random() * 0.38;
  const kelly  = dir === "ABSTAIN" ? 0 : Math.min(0.25, conf * 0.22);
  const token  = TOKENS[Math.floor(Math.random() * TOKENS.length)];

  return {
    signal_id:      id,
    timestamp:      Date.now() / 1000 - id * 320,
    regime_name:    regime,
    direction_name: dir,
    confidence:     conf,
    kelly_fraction: kelly,
    top_token:      token,
    commit_hash:    "0x" + Array.from({ length: 64 }, () =>
      "0123456789abcdef"[Math.floor(Math.random() * 16)]).join(""),
    transport:      Math.random() > 0.45 ? "MCP+x402" : "REST",
    rotation: TOKENS.slice(0, 5).map(t => ({
      symbol:     t,
      score:      ((Math.random() - 0.38) * 1.4).toFixed(3),
      change_24h: ((Math.random() - 0.42) * 18).toFixed(1),
    })),
    signals: [
      { name: "Fear&Greed",  vote: Math.random() > 0.5 ? "LONG" : "SHORT",   weight: 0.20 },
      { name: "BTC_Dom",     vote: Math.random() > 0.5 ? "LONG" : "NEUTRAL", weight: 0.20 },
      { name: "MCap_Trend",  vote: Math.random() > 0.5 ? "LONG" : "SHORT",   weight: 0.20 },
      { name: "Rotation",    vote: Math.random() > 0.5 ? "LONG" : "SHORT",   weight: 0.25 },
      { name: "Trending",    vote: Math.random() > 0.5 ? "LONG" : "NEUTRAL", weight: 0.15 },
    ],
  };
}

function VoteChip({ vote }) {
  const cfg = {
    LONG:    { bg: "rgba(0,255,136,0.08)",  color: "#00FF88", border: "rgba(0,255,136,0.2)" },
    SHORT:   { bg: "rgba(255,59,92,0.08)",  color: "#FF3B5C", border: "rgba(255,59,92,0.2)" },
    NEUTRAL: { bg: "rgba(136,136,136,0.06)",color: "#888",    border: "rgba(136,136,136,0.15)" },
  };
  const c = cfg[vote] || cfg.NEUTRAL;
  return (
    <span className="mono" style={{
      fontSize: 9, padding: "2px 8px", borderRadius: 4,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      {vote}
    </span>
  );
}

export default function Dashboard({ setPage }) {
  const [signals, setSignals]   = useState(() => Array.from({ length: 14 }, (_, i) => mockSignal(50 - i)));
  const [selected, setSelected] = useState(0);
  const [running, setRunning]   = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSignals(prev => [mockSignal(prev[0].signal_id + 1), ...prev.slice(0, 24)]);
    }, 4500);
    return () => clearInterval(t);
  }, [running]);

  const s      = signals[selected];
  const latest = signals[0];

  const kpis = [
    { label: "CURRENT REGIME",  value: latest.regime_name.replace("_", " "), color: REGIME_COLOR[latest.regime_name] },
    { label: "LAST DIRECTION",  value: latest.direction_name, color: latest.direction_name === "LONG" ? "#00FF88" : latest.direction_name === "SHORT" ? "#FF3B5C" : "#888" },
    { label: "CONFIDENCE",      value: latest.direction_name === "ABSTAIN" ? "—" : (latest.confidence * 100).toFixed(0) + "%", color: "var(--accent-cyan)" },
    { label: "KELLY SIZE",      value: latest.direction_name === "ABSTAIN" ? "0%" : (latest.kelly_fraction * 100).toFixed(1) + "%", color: "var(--accent-gold)" },
  ];

  return (
    <div style={{ minHeight: "100vh", paddingTop: 64, background: "var(--bg-base)" }}>

      {/* Header */}
      <div style={{
        padding: "20px 40px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>
            APEX STRATEGY SKILL · LIVE DASHBOARD
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Mission Control
          </h2>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span className="badge badge-green">● CMC AGENT HUB</span>
          <span className="badge badge-cyan">BSC TESTNET</span>
          <button
            onClick={() => setRunning(r => !r)}
            style={{
              padding: "9px 22px", borderRadius: 999,
              fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
              background: running ? "var(--accent-red)" : "var(--accent-green)",
              color: "#000",
              boxShadow: running
                ? "0 0 20px rgba(255,59,92,0.35)"
                : "0 0 20px rgba(0,255,136,0.35)",
              transition: "all 0.2s",
            }}
          >
            {running ? "■ Stop Live" : "▶ Run Live"}
          </button>
          <button
            onClick={() => setPage("home")}
            style={{
              background: "transparent", border: "1px solid #2a2a2a",
              color: "#888", borderRadius: 999, padding: "9px 18px",
              fontSize: 13, cursor: "pointer",
            }}
          >
            ← Back
          </button>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 128px)" }}>

        {/* Signal feed */}
        <div style={{
          width: 295, borderRight: "1px solid var(--border-subtle)",
          overflowY: "auto", padding: "16px 12px",
          background: "var(--bg-sidebar)",
        }}>
          <div className="mono" style={{ fontSize: 9, color: "#555", marginBottom: 12, padding: "0 4px" }}>
            SIGNAL HISTORY
          </div>
          {signals.map((sig, i) => (
            <div
              key={sig.signal_id}
              onClick={() => setSelected(i)}
              style={{
                padding: "10px 12px", marginBottom: 5, borderRadius: 8, cursor: "pointer",
                background: i === selected ? REGIME_BG[sig.regime_name] : "transparent",
                borderLeft: i === selected
                  ? `2px solid ${REGIME_COLOR[sig.regime_name]}`
                  : "2px solid transparent",
                border: i === selected
                  ? `1px solid ${REGIME_COLOR[sig.regime_name]}22`
                  : "1px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <div className="mono" style={{ fontSize: 9, color: "#555", marginBottom: 3 }}>
                SIG-{String(sig.signal_id).padStart(4, "0")} ·{" "}
                {new Date(sig.timestamp * 1000).toLocaleTimeString()}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>
                {sig.top_token} →{" "}
                <span style={{ color: REGIME_COLOR[sig.regime_name] }}>
                  {sig.direction_name}
                </span>
              </div>
              <div className="mono" style={{ fontSize: 9, color: "#555" }}>
                {sig.regime_name.replace(/_/g, " ")}
              </div>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>

          {/* KPI row */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16, marginBottom: 28,
          }}>
            {kpis.map(k => (
              <div key={k.label} className="card" style={{ padding: 20 }}>
                <div className="mono" style={{ fontSize: 9, color: "#555", marginBottom: 10 }}>
                  {k.label}
                </div>
                <div style={{
                  fontSize: 19, fontWeight: 700, color: k.color,
                  textShadow: `0 0 16px ${k.color}44`,
                }}>
                  {k.value}
                </div>
              </div>
            ))}
          </div>

          {/* Detail grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>

            {/* Signal breakdown */}
            <div className="card" style={{ padding: 24 }}>
              <div className="mono" style={{ fontSize: 9, color: "#555", marginBottom: 18 }}>
                SIGNAL BREAKDOWN · SIG-{String(s.signal_id).padStart(4, "0")}
              </div>
              {s.signals.map(sig => (
                <div key={sig.name} style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", padding: "10px 0",
                  borderBottom: "1px solid #1a1a1a",
                }}>
                  <span className="mono" style={{ fontSize: 11, color: "#ccc" }}>{sig.name}</span>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <VoteChip vote={sig.vote} />
                    <span className="mono" style={{ fontSize: 9, color: "#555" }}>
                      {(sig.weight * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
              <div style={{
                marginTop: 16, paddingTop: 12,
                borderTop: "1px solid #1a1a1a",
                display: "flex", justifyContent: "space-between",
              }}>
                <span className="mono" style={{ fontSize: 9, color: "#555" }}>TRANSPORT</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--accent-cyan)" }}>
                  {s.transport}
                </span>
              </div>
            </div>

            {/* Rotation matrix */}
            <div className="card" style={{ padding: 24 }}>
              <div className="mono" style={{ fontSize: 9, color: "#555", marginBottom: 18 }}>
                ROTATION MATRIX
              </div>
              {s.rotation.map((r, i) => (
                <div key={r.symbol} style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", padding: "10px 0",
                  borderBottom: "1px solid #1a1a1a",
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className="mono" style={{
                      fontSize: 9, color: "#555",
                      background: "#161616", width: 20, height: 20,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: 4,
                    }}>{i + 1}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{r.symbol}</span>
                  </div>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <span style={{
                      fontSize: 11,
                      color: parseFloat(r.score) > 0 ? "#00FF88" : "#FF3B5C",
                    }}>
                      {parseFloat(r.score) > 0 ? "+" : ""}{r.score}
                    </span>
                    <span className="mono" style={{
                      fontSize: 10,
                      color: parseFloat(r.change_24h) > 0 ? "#00FF88" : "#FF3B5C",
                    }}>
                      {parseFloat(r.change_24h) > 0 ? "+" : ""}{r.change_24h}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commit hash */}
          <div style={{
            background: "#0D0D0D", border: "1px solid #1a1a1a",
            borderRadius: 12, padding: 22,
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 12,
            }}>
              <div className="mono" style={{ fontSize: 9, color: "#555" }}>
                ON-CHAIN COMMIT HASH
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span className="badge badge-green" style={{
                  textShadow: "0 0 8px rgba(0,255,136,0.5)",
                }}>
                  ● BSC TESTNET
                </span>
                <span className="badge badge-cyan">VERIFIED</span>
              </div>
            </div>
            <div className="mono" style={{
              fontSize: 11, color: "var(--text-code)",
              wordBreak: "break-all", lineHeight: 1.9,
              letterSpacing: "0.02em",
            }}>
              {s.commit_hash}
            </div>
            <div style={{ marginTop: 14, fontSize: 12, color: "#555" }}>
              Signal #{s.signal_id}
              {" · "}
              <span style={{ color: "var(--accent-cyan)" }}>{s.transport}</span>
              {" · "}
              <span>{new Date(s.timestamp * 1000).toUTCString()}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
