export default function Footer({ setPage }) {
  return (
    <section style={{
      background:"var(--bg-panel)",
      borderTop:"1px solid #1A2E4A",
      padding:"88px 80px",
      textAlign:"center",
      position:"relative", overflow:"hidden",
    }}>
      <div style={{
        position:"absolute", bottom:"-60px", left:"50%",
        transform:"translateX(-50%)",
        width:500, height:250,
        background:"radial-gradient(ellipse,rgba(0,255,136,0.14) 0%,transparent 70%)",
        borderRadius:"50%", filter:"blur(60px)", pointerEvents:"none",
      }} />

      <div style={{
        fontFamily:"JetBrains Mono,monospace",
        fontSize:11, letterSpacing:"0.16em",
        textTransform:"uppercase",
        marginBottom:28, position:"relative",
        color:"var(--accent-cyan)",
        textShadow:"0 0 16px rgba(0,212,255,0.8), 0 0 32px rgba(0,212,255,0.4)",
        fontWeight:600,
      }}>
        OPEN MISSION CONTROL ↓
      </div>

      <button
        onClick={() => setPage("dashboard")}
        style={{
          background:"var(--accent-green)", color:"#000",
          border:"none", borderRadius:999,
          padding:"18px 56px",
          fontWeight:800, fontSize:16, cursor:"pointer",
          fontFamily:"'Space Grotesk',sans-serif",
          letterSpacing:"0.02em",
          boxShadow:"0 8px 48px rgba(0,255,136,0.4), 0 0 80px rgba(0,255,136,0.15)",
          transition:"all 0.2s ease", position:"relative",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform="scale(1.04)";
          e.currentTarget.style.boxShadow="0 8px 64px rgba(0,255,136,0.6), 0 0 100px rgba(0,255,136,0.25)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform="scale(1)";
          e.currentTarget.style.boxShadow="0 8px 48px rgba(0,255,136,0.4), 0 0 80px rgba(0,255,136,0.15)";
        }}
      >
        ◆ Open Mission Control →
      </button>

      <div style={{
        fontFamily:"JetBrains Mono,monospace",
        fontSize:12, marginTop:36, lineHeight:1.9,
        position:"relative",
        color:"var(--accent-green)",
        textShadow:"0 0 12px rgba(0,255,136,0.6), 0 0 24px rgba(0,255,136,0.3)",
        fontWeight:600, letterSpacing:"0.08em",
      }}>
        Built for BNB Hack 2026 · Track 2: Strategy Skills<br />
        CoinMarketCap × Trust Wallet · MIT Licensed
      </div>
    </section>
  );
}
