import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 5,   suffix: "+", label: "SIGNAL FACTORS",      color: "var(--accent-green)" },
  { value: 4,   suffix: "",  label: "REGIME STATES",       color: "var(--accent-cyan)" },
  { value: 25,  suffix: "%", label: "MAX KELLY EXPOSURE",  color: "var(--accent-gold)" },
  { value: 100, suffix: "%", label: "ON-CHAIN VERIFIABLE", color: "var(--accent-green)" },
];

function CountUp({ target, suffix, color }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef();
  const triggered = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !triggered.current) {
        triggered.current = true;
        let current = 0;
        const step = Math.ceil(target / 40);
        const t = setInterval(() => {
          current = Math.min(current + step, target);
          setDisplay(current);
          if (current >= target) clearInterval(t);
        }, 28);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={ref} style={{ color }}>
      {display}{suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section style={{
      padding: "64px 80px",
      borderTop: "1px solid var(--border-subtle)",
      borderBottom: "1px solid var(--border-subtle)",
    }}>
      <div style={{ display: "flex", gap: 72, flexWrap: "wrap" }}>
        {STATS.map(s => (
          <div key={s.label}>
            <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, marginBottom: 8 }}>
              <CountUp target={s.value} suffix={s.suffix} color={s.color} />
            </div>
            <div className="mono" style={{
              fontSize: 10, color: "#555",
              letterSpacing: "0.13em", textTransform: "uppercase",
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
