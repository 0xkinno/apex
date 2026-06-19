import { useEffect, useRef, useState } from "react";

const FEED = [
  { id:"SIG-0042", token:"BNB",    dir:"LONG",    regime:"TRENDING_BULL", conf:"81%", kelly:"12.4%", status:"Committed",  color:"#00FF88" },
  { id:"SIG-0041", token:"CAKE",   dir:"LONG",    regime:"TRENDING_BULL", conf:"74%", kelly:"10.1%", status:"Committed",  color:"#00FF88" },
  { id:"SIG-0040", token:"INJ",    dir:"ABSTAIN", regime:"CHOPPY_RANGE",  conf:"—",   kelly:"0%",    status:"Abstained",  color:"#888" },
  { id:"SIG-0039", token:"PENDLE", dir:"SHORT",   regime:"TRENDING_BEAR", conf:"67%", kelly:"8.3%",  status:"Committed",  color:"#FF3B5C" },
];

const NAV_ITEMS = [
  { icon:"◈", label:"Overview" },
  { icon:"◉", label:"Signals",     active:true },
  { icon:"⊞", label:"Rotation" },
  { icon:"⬡", label:"Attestation" },
  { icon:"⚙", label:"Settings" },
];

export default function WidgetShowcase() {
  const sectionRef = useRef();
  const [tilt, setTilt] = useState({ x:18, y:-8, z:-3, s:0.88 });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const wh   = window.innerHeight;
      // progress: 0 when top of section is at bottom of viewport, 1 when fully visible
      const prog = Math.max(0, Math.min(1, 1 - rect.top / wh));
      // tilt like hypotenuse of right triangle: steep tilt → straight
      const ease = prog * prog; // quadratic — fast straighten
      setTilt({
        x: 18 * (1 - ease),
        y: -8 * (1 - ease),
        z: -3 * (1 - ease),
        s: 0.88 + 0.12 * ease,
      });
    };
    window.addEventListener("scroll", onScroll, { passive:true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const s = FEED[selected];

  return (
    <section ref={sectionRef} style={{
      padding:"80px 40px", overflow:"hidden",
      background:"var(--bg-base)",
    }}>
      <div style={{ textAlign:"center", marginBottom:52 }}>
        <div className="mono" style={{ fontSize:10, color:"#334A6A", letterSpacing:"0.13em", marginBottom:14 }}>
          LIVE SIGNAL DASHBOARD
        </div>
        <h2 style={{
          fontSize:"clamp(28px,3vw,42px)", fontWeight:800,
          letterSpacing:"-0.02em", textTransform:"uppercase",
        }}>
          Watch APEX Think In{" "}
          <span style={{
            color:"var(--accent-green)",
            textShadow:"0 0 32px rgba(0,255,136,0.5), 0 0 64px rgba(0,255,136,0.2)",
          }}>
            Real Time
          </span>
        </h2>
      </div>

      <div style={{
        transform:`perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) rotateZ(${tilt.z}deg) scale(${tilt.s})`,
        transition:"transform 0.08s linear",
        maxWidth:1000, margin:"0 auto",
        background:"var(--bg-card)",
        border:"1px solid var(--border-subtle)",
        borderRadius:16, overflow:"hidden",
        boxShadow:"0 48px 120px rgba(0,0,0,0.9), 0 0 80px rgba(0,255,136,0.04)",
      }}>
        <div style={{ display:"flex", height:500 }}>

          {/* Sidebar */}
          <div style={{
            width:188, background:"var(--bg-sidebar)",
            borderRight:"1px solid var(--border-subtle)",
            display:"flex", flexDirection:"column",
          }}>
            <div style={{
              padding:"18px 16px 16px",
              borderBottom:"1px solid var(--border-subtle)",
              display:"flex", alignItems:"center", gap:8,
            }}>
              <div style={{
                width:18, height:18, background:"var(--accent-green)",
                clipPath:"polygon(50% 0%,100% 100%,0% 100%)",
                filter:"drop-shadow(0 0 5px rgba(0,255,136,0.7))",
              }} />
              <span style={{ fontWeight:700, fontSize:13, letterSpacing:"0.02em" }}>APEX</span>
              <span className="badge badge-green" style={{ fontSize:8 }}>BNB</span>
            </div>
            {NAV_ITEMS.map(item => (
              <div key={item.label} style={{
                padding:"11px 16px", fontSize:12, fontWeight:500,
                color: item.active ? "#fff" : "#3A4A6A",
                borderLeft: item.active ? "2px solid var(--accent-green)" : "2px solid transparent",
                background: item.active ? "rgba(0,255,136,0.05)" : "transparent",
                display:"flex", alignItems:"center", gap:8, cursor:"pointer",
                transition:"color 0.2s",
              }}>
                <span style={{ fontSize:10, color: item.active ? "var(--accent-green)" : "#2A3A5A" }}>
                  {item.icon}
                </span>
                {item.label}
              </div>
            ))}
          </div>

          {/* Feed */}
          <div style={{
            width:300, borderRight:"1px solid var(--border-subtle)",
            padding:16, overflowY:"auto",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <span style={{ fontSize:13, fontWeight:700, letterSpacing:"0.01em" }}>Signal Feed</span>
              <span className="mono" style={{
                fontSize:9, color:"var(--accent-green)",
                textShadow:"0 0 8px rgba(0,255,136,0.7)",
                animation:"blink 2s infinite",
              }}>● LIVE</span>
            </div>
            {FEED.map((item,i) => (
              <div key={item.id} onClick={() => setSelected(i)} style={{
                padding:"10px 12px", marginBottom:6, borderRadius:8, cursor:"pointer",
                background: i===selected ? `${item.color}09` : "transparent",
                borderLeft: i===selected ? `2px solid ${item.color}` : "2px solid transparent",
                border: i===selected ? `1px solid ${item.color}22` : "1px solid transparent",
                transition:"all 0.18s",
              }}>
                <div className="mono" style={{ fontSize:9, color:"#334A6A", marginBottom:3 }}>
                  {item.id} · {item.regime}
                </div>
                <div style={{ fontSize:12, fontWeight:600, marginBottom:4 }}>
                  {item.token} →{" "}
                  <span style={{ color:item.color }}>{item.dir}</span>
                </div>
                <div style={{ fontSize:10, color: item.dir==="ABSTAIN" ? "#334A6A" : "var(--accent-green)" }}>
                  {item.dir==="ABSTAIN" ? "◎ Abstained" : `✓ ${item.status}`}
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          <div style={{ flex:1, padding:24, overflowY:"auto" }}>
            <div className="mono" style={{ fontSize:10, color:"#334A6A", marginBottom:16 }}>
              APEX / {s.token} / {s.id}
            </div>
            <h3 style={{ fontSize:20, fontWeight:800, marginBottom:10, letterSpacing:"-0.01em" }}>
              Signal · {s.token}
            </h3>
            <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
              <span style={{ fontSize:11, color:"var(--accent-green)", textShadow:"0 0 8px rgba(0,255,136,0.5)" }}>
                ✓ On-chain committed
              </span>
              <span style={{ fontSize:11, color:"#334A6A" }}>⬡ {s.regime}</span>
              <span className="badge badge-cyan">Kelly {s.kelly}</span>
            </div>
            <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.8, marginBottom:20 }}>
              APEX derived a{" "}
              <strong style={{ color:s.color }}>{s.dir}</strong> signal for {s.token} with{" "}
              {s.conf} confidence. Kelly-optimal sizing recommends{" "}
              <strong style={{ color:"var(--accent-cyan)" }}>{s.kelly}</strong> portfolio exposure.
              Signal commit hash recorded on BSC Testnet before outcome is known.
            </p>
            <div className="code-block">
              <div className="mono" style={{ color:"#334A6A", marginBottom:8, fontSize:9 }}>apex/signal.json</div>
              <span style={{ color:"#4A7A9B" }}>{`{\n  "direction":  `}</span><span style={{ color:s.color }}>"{s.dir}"</span><span style={{ color:"#4A7A9B" }}>{`,\n  "confidence": `}</span><span style={{ color:"var(--accent-cyan)" }}>"{s.conf}"</span><span style={{ color:"#4A7A9B" }}>{`,\n  "kelly_size": `}</span><span style={{ color:"var(--accent-gold)" }}>"{s.kelly}"</span><span style={{ color:"#4A7A9B" }}>{`,\n  "regime":     `}</span><span style={{ color:"#ccd6f6" }}>"{s.regime}"</span><span style={{ color:"#4A7A9B" }}>{`,\n  "commit":     `}</span><span style={{ color:"var(--text-code)" }}>"0x3f8a…c291"</span><span style={{ color:"#4A7A9B" }}>{`\n}`}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
