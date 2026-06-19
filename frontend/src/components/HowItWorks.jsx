import { useRef, useEffect, useState } from "react";

const LAYERS = [
  {
    num: "01",
    color: "var(--accent-green)",
    title: "Regime Engine",
    body: "Derives market state from raw CMC data — Fear & Greed momentum, BTC dominance shift, market cap trend, and price coherence. Four regimes: Bull, Bear, Choppy, Crisis. No label lookup. Computed from first principles every cycle.",
    code: `regime = derive_regime(cmc_data)
# composite > 0.35  → TRENDING_BULL
# composite < −0.20 → TRENDING_BEAR
# between           → CHOPPY_RANGE
# FG < 15 or < −0.65 → CRISIS → ABSTAIN`,
  },
  {
    num: "02",
    color: "var(--accent-cyan)",
    title: "Kelly Criterion Sizing",
    body: "Mathematically optimal position size. f* = (p×b − q) / b. Calibrated per regime using validated historical win rates and payoff ratios. Half-Kelly for safety. Hard cap at 25%. Institutional-grade risk management inside a CMC Skill.",
    code: `f* = (p * b - q) / b   # Kelly formula
half_kelly = f* * 0.5  # safety factor
size = min(0.25, half_kelly)
# BULL:   13.6% | BEAR:  10.6%
# CHOPPY:  1.8% | CRISIS:  0%`,
  },
  {
    num: "03",
    color: "var(--accent-gold)",
    title: "Rotation Matrix",
    body: "Scores all eligible BNB Chain tokens across momentum, liquidity, sentiment, and regime alignment. An agent using APEX knows not just LONG — but LONG BNB over CAKE over AAVE, in ranked order, with full math shown.",
    code: `score = (
  momentum_norm  * 0.45 +
  liquidity_norm * 0.25 +
  sentiment_norm * 0.20 +
  regime_bonus         # +0.15 if aligned
)
# 1. BNB  +0.71 | 2. INJ +0.54`,
  },
  {
    num: "04",
    color: "var(--accent-purple)",
    title: "On-Chain Attestation",
    body: "Every signal is keccak256 hashed and written to BSC Testnet before any outcome is observable. Run recompute_verify.py yourself — read the commit, recompute the hash, watch it match. The track record is structurally unfakeable.",
    code: `hash = keccak256(signal_json)
contract.commitSignal(
  hash, direction, regime,
  confidence_bps, kelly_bps
)
# recompute_verify.py → ✓ ALL MATCH`,
  },
];

export default function HowItWorks() {
  const refs = useRef([]);
  const [visible, setVisible] = useState([false, false, false, false]);

  useEffect(() => {
    const observers = refs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          setVisible(v => { const n = [...v]; n[i] = true; return n; });
          obs.disconnect();
        }
      }, { threshold: 0.2 });
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  return (
    <section className="section-dark" id="how-it-works">
      <div className="grid-bg-cyan" />

      <div className="mono" style={{
        fontSize: 10, color: "#334455", letterSpacing: "0.13em",
        textTransform: "uppercase", marginBottom: 16, position: "relative",
      }}>
        HOW APEX WORKS
      </div>
      <h2 style={{
        fontSize: "clamp(36px,4vw,54px)", fontWeight: 900,
        lineHeight: 1.0, letterSpacing: "-0.03em", marginBottom: 64,
        position: "relative",
      }}>
        Four layers.<br />
        <span style={{ color: "#333" }}>Zero guesswork.</span>
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
        gap: 24, position: "relative",
      }}>
        {LAYERS.map((layer, i) => (
          <div
            key={layer.num}
            ref={el => refs.current[i] = el}
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-blue)",
              borderRadius: 12, padding: 28,
              opacity: visible[i] ? 1 : 0,
              transform: visible[i] ? "translateY(0)" : "translateY(28px)",
              transition: `opacity 0.55s ease ${i * 0.1}s, transform 0.55s ease ${i * 0.1}s`,
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 36px ${layer.color}18`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <span className="mono" style={{ fontSize: 10, color: "#334455" }}>
                {layer.num}
              </span>
              <span className="badge" style={{
                color: layer.color,
                background: `${layer.color}09`,
                border: `1px solid ${layer.color}33`,
              }}>
                ◈ ACTIVE
              </span>
            </div>

            <h3 style={{
              fontSize: 18, fontWeight: 700, marginBottom: 14,
              color: layer.color,
              textShadow: `0 0 20px ${layer.color}33`,
            }}>
              {layer.title}
            </h3>

            <p style={{
              fontSize: 13, color: "#8899AA", lineHeight: 1.75, marginBottom: 18,
            }}>
              {layer.body}
            </p>

            <div className="code-block">{layer.code}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
