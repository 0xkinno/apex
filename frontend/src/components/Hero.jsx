import { useEffect, useRef } from "react";

/* Candlestick chart artifact shown on right side of hero */
function CandleChart() {
  const candles = [
    { h:55, body:30, up:true,  wick:10 },
    { h:40, body:22, up:false, wick:8  },
    { h:65, body:38, up:true,  wick:14 },
    { h:48, body:28, up:false, wick:10 },
    { h:72, body:42, up:true,  wick:16 },
    { h:50, body:30, up:false, wick:9  },
    { h:80, body:48, up:true,  wick:18 },
    { h:58, body:34, up:true,  wick:12 },
    { h:42, body:24, up:false, wick:8  },
    { h:76, body:44, up:true,  wick:16 },
    { h:62, body:36, up:true,  wick:13 },
    { h:88, body:52, up:true,  wick:20 },
  ];

  return (
    <div style={{
      position: "absolute", right: "3%", top: "50%",
      transform: "translateY(-50%)",
      width: 420, height: 340,
      animation: "float 6s ease-in-out infinite",
      zIndex: 2,
    }}>
      {/* Glow backdrop */}
      <div style={{
        position: "absolute", inset: -40,
        background: "radial-gradient(ellipse at center, rgba(0,255,136,0.08) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />

      {/* Chart container */}
      <div style={{
        width: "100%", height: "100%",
        background: "rgba(10,15,30,0.85)",
        border: "1px solid rgba(0,255,136,0.15)",
        borderRadius: 16,
        backdropFilter: "blur(12px)",
        padding: "20px 24px",
        boxShadow: "0 0 60px rgba(0,255,136,0.08), 0 24px 64px rgba(0,0,0,0.6)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Inner grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(rgba(0,212,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,1) 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }} />

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, position:"relative" }}>
          <div>
            <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.05em", color:"#fff" }}>BNB / USDT</div>
            <div style={{ fontSize:10, color:"var(--accent-green)", fontFamily:"JetBrains Mono", marginTop:2 }}>
              +4.73%
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:18, fontWeight:800, color:"var(--accent-green)", textShadow:"0 0 12px rgba(0,255,136,0.5)" }}>
              $618.42
            </div>
            <div className="badge badge-green" style={{ marginTop:4, fontSize:8 }}>● TRENDING_BULL</div>
          </div>
        </div>

        {/* Candles */}
        <div style={{
          display: "flex", alignItems: "flex-end",
          gap: 6, height: 200, paddingBottom: 8,
          position: "relative",
        }}>
          {/* Price line */}
          <div style={{
            position:"absolute", left:0, right:0, bottom:80,
            height:1, background:"rgba(0,212,255,0.2)",
            borderBottom: "1px dashed rgba(0,212,255,0.2)",
          }} />

          {candles.map((c, i) => (
            <div key={i} style={{
              flex:1, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"flex-end", height:"100%",
            }}>
              {/* Top wick */}
              <div style={{
                width:1.5, height: c.wick,
                background: c.up ? "rgba(0,255,136,0.5)" : "rgba(255,59,92,0.5)",
              }} />
              {/* Body */}
              <div style={{
                width:"70%", height: c.body,
                background: c.up
                  ? "linear-gradient(180deg,rgba(0,255,136,0.9),rgba(0,200,70,0.7))"
                  : "linear-gradient(180deg,rgba(255,59,92,0.9),rgba(200,30,60,0.7))",
                borderRadius: 2,
                boxShadow: c.up
                  ? "0 0 8px rgba(0,255,136,0.4)"
                  : "0 0 8px rgba(255,59,92,0.4)",
                transition: "height 0.5s ease",
              }} />
              {/* Bottom wick */}
              <div style={{
                width:1.5, height: Math.floor(c.wick * 0.6),
                background: c.up ? "rgba(0,255,136,0.5)" : "rgba(255,59,92,0.5)",
              }} />
            </div>
          ))}
        </div>

        {/* Bottom stats row */}
        <div style={{
          display:"flex", justifyContent:"space-between",
          borderTop:"1px solid rgba(255,255,255,0.05)",
          paddingTop:12, marginTop:4,
        }}>
          {[
            { label:"REGIME", value:"BULL", color:"var(--accent-green)" },
            { label:"KELLY", value:"13.6%", color:"var(--accent-cyan)" },
            { label:"SIGNAL", value:"LONG ↑", color:"var(--accent-green)" },
          ].map(s => (
            <div key={s.label} style={{ textAlign:"center" }}>
              <div style={{ fontSize:8, fontFamily:"JetBrains Mono", color:"#445", letterSpacing:"0.1em", marginBottom:3 }}>{s.label}</div>
              <div style={{ fontSize:13, fontWeight:700, color:s.color, textShadow:`0 0 10px ${s.color}66` }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Hero({ setPage }) {
  const wordsRef = useRef([]);

  useEffect(() => {
    wordsRef.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(18px)";
      setTimeout(() => {
        el.style.transition = "opacity 0.55s ease, transform 0.55s ease";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 100 + i * 90);
    });
  }, []);

  return (
    <section style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column", justifyContent: "center",
      padding: "0 80px", paddingTop: 64,
      position: "relative", overflow: "hidden",
    }}>
      <div className="grid-bg" />

      {/* Green horizon glow */}
      <div style={{
        position:"absolute", bottom:"-80px", left:"30%",
        transform:"translateX(-50%)",
        width:700, height:350,
        background:"radial-gradient(ellipse,#00FF88 0%,#00AA55 22%,#003322 60%,transparent 100%)",
        borderRadius:"50%", filter:"blur(90px)", opacity:0.14,
        animation:"pulseGreen 7s ease-in-out infinite",
        pointerEvents:"none",
      }} />
      <div style={{
        position:"absolute", bottom:"-120px", left:"30%",
        transform:"translateX(-50%)",
        width:900, height:480,
        background:"radial-gradient(ellipse,#00D4FF 0%,transparent 70%)",
        borderRadius:"50%", filter:"blur(150px)", opacity:0.05,
        animation:"pulseCyan 10s ease-in-out infinite reverse",
        pointerEvents:"none",
      }} />

      {/* Scanline */}
      <div style={{ position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none" }}>
        <div style={{
          position:"absolute",left:0,right:0,height:2,
          background:"linear-gradient(90deg,transparent,rgba(0,255,136,0.07),transparent)",
          animation:"scanline 9s linear infinite",
        }} />
      </div>

      {/* Left content */}
      <div style={{ position:"relative", zIndex:2, maxWidth:600 }}>

        {/* Eyebrow — electric glow */}
        <div style={{
          marginBottom:32,
          display:"flex", gap:0, alignItems:"center",
          fontFamily:"JetBrains Mono,monospace",
          fontSize:10, letterSpacing:"0.14em",
        }}>
          <span style={{
            color:"var(--accent-green)",
            fontSize:8,
            animation:"blink 2s infinite",
            marginRight:10,
            textShadow:"0 0 8px rgba(0,255,136,0.9)",
          }}>●</span>
          {["CMC AGENT HUB","BNB CHAIN","STRATEGY SKILL","x402"].map((t,i) => (
            <span key={t} style={{ display:"flex", alignItems:"center", gap:0 }}>
              <span style={{
                color:"var(--accent-cyan)",
                textShadow:"0 0 12px rgba(0,212,255,0.8), 0 0 24px rgba(0,212,255,0.4)",
                fontWeight:600,
                letterSpacing:"0.12em",
              }}>{t}</span>
              {i < 3 && <span style={{ color:"#1E3A5F", margin:"0 8px", fontSize:12 }}>·</span>}
            </span>
          ))}
        </div>

        {/* Headline — uppercase, sleek */}
        <h1 style={{
          fontSize:"clamp(42px,5.5vw,72px)",
          fontWeight:900, lineHeight:1.05,
          letterSpacing:"-0.02em", marginBottom:28,
          fontFamily:"'Space Grotesk','Inter',sans-serif",
          textTransform:"uppercase",
        }}>
          <span ref={el=>wordsRef.current[0]=el} style={{ color:"#fff", display:"block" }}>
            TRADE SMARTER,
          </span>
          <span ref={el=>wordsRef.current[1]=el} style={{ color:"#1A2A44", display:"block" }}>
            NOT HARDER.
          </span>
          <span ref={el=>wordsRef.current[2]=el} style={{ display:"block", marginTop:4 }}>
            <span style={{ color:"#1A2A44" }}>KNOW </span>
            <span style={{
              color:"var(--accent-green)",
              textShadow:"0 0 40px rgba(0,255,136,0.5), 0 0 80px rgba(0,255,136,0.2)",
            }}>WHEN</span>
            <span style={{ color:"#1A2A44" }}> TO ACT.</span>
          </span>
        </h1>

        {/* Subtext */}
        <p style={{
          fontSize:16, color:"var(--text-secondary)",
          maxWidth:520, lineHeight:1.8, marginBottom:44,
          fontWeight:400,
        }}>
          APEX is the only CMC Skill that outputs a{" "}
          <em style={{ color:"#ccd6f6", fontStyle:"normal", fontWeight:600 }}>complete trade specification</em>
          {" "}— direction, Kelly-optimal position size, regime context, and multi-asset rotation ranking.
          Every signal committed on-chain before the outcome is known.
        </p>

        {/* CTAs */}
        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          <button className="btn-primary" onClick={() => setPage("dashboard")}>
            Live Dashboard ↗
          </button>
          <button className="btn-secondary">
            How it works
          </button>
        </div>

        {/* Live indicator */}
        <div style={{ marginTop:44, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{
            width:8, height:8, borderRadius:"50%",
            background:"var(--accent-green)",
            boxShadow:"0 0 10px var(--accent-green)",
            animation:"glowPulse 2s infinite",
            display:"block", flexShrink:0,
          }} />
          <span className="mono" style={{ fontSize:10, color:"#334A6A" }}>
            CMC AGENT HUB · LIVE DATA · BSC TESTNET ATTESTATION ACTIVE
          </span>
        </div>
      </div>

      {/* Right — candle chart artifact */}
      <CandleChart />
    </section>
  );
}
