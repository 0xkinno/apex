export default function Nav({ page, setPage }) {
  const scrollTo = (id) => {
    setPage("home");
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior:"smooth" });
    }, 50);
  };

  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      background:"rgba(7,11,20,0.92)",
      backdropFilter:"blur(24px)",
      borderBottom:"1px solid #0F1A2E",
      display:"flex", alignItems:"center",
      justifyContent:"space-between",
      padding:"0 52px", height:64,
    }}>
      {/* Logo */}
      <div onClick={() => setPage("home")} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
        <div style={{
          width:26, height:26,
          background:"var(--accent-green)",
          clipPath:"polygon(50% 0%,100% 100%,0% 100%)",
          filter:"drop-shadow(0 0 8px rgba(0,255,136,0.8))",
        }} />
        <span style={{ fontWeight:800, fontSize:16, letterSpacing:"-0.01em", fontFamily:"'Space Grotesk',sans-serif" }}>
          APEX
        </span>
        <span className="badge badge-green" style={{ marginLeft:4 }}>BNB</span>
      </div>

      {/* Links */}
      <div style={{ display:"flex", gap:36 }}>
        {[
          { label:"How it works", action:() => scrollTo("how-it-works") },
          { label:"Regime",       action:() => scrollTo("regime-section") },
          { label:"Signals",      action:() => scrollTo("widget-section") },
          { label:"Dashboard",    action:() => setPage("dashboard") },
        ].map(({ label, action }) => (
          <button key={label} onClick={action} style={{
            background:"none", border:"none", cursor:"pointer",
            fontSize:14, fontWeight:500,
            fontFamily:"'Space Grotesk',sans-serif",
            color:"var(--text-secondary)",
            transition:"color 0.2s",
            letterSpacing:"0.01em",
          }}
            onMouseEnter={e => e.target.style.color="#fff"}
            onMouseLeave={e => e.target.style.color="var(--text-secondary)"}
          >{label}</button>
        ))}
      </div>

      {/* Right */}
      <div style={{ display:"flex", alignItems:"center", gap:20 }}>
        <a href="https://t.me/+MhiOLT0YUnlmNWFk" target="_blank" rel="noreferrer"
          style={{ color:"var(--text-secondary)", fontSize:14, textDecoration:"none",
                   fontFamily:"'Space Grotesk',sans-serif",
                   transition:"color 0.2s" }}
          onMouseEnter={e => e.target.style.color="#fff"}
          onMouseLeave={e => e.target.style.color="var(--text-secondary)"}
        >
          Telegram ↗
        </a>
        <button className="btn-primary" style={{ padding:"9px 20px", fontSize:13 }}
          onClick={() => setPage("dashboard")}>
          Open Dashboard ↗
        </button>
      </div>
    </nav>
  );
}
