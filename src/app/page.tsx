export default function Home() {
  return (
    <main className="gp-container" style={{ padding: "48px 20px" }}>
      <h1
        style={{
          margin: 0,
          fontSize: "48px",
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
        }}
      >
        Groove Copilot
      </h1>
      <p
        className="gp-muted"
        style={{
          marginTop: 16,
          marginBottom: 28,
          maxWidth: 720,
          fontSize: "18px",
          lineHeight: 1.6,
        }}
      >
        Génère un pattern cohérent selon ton style et ton BPM, écoute-le
        instantanément, puis suis le coach pour savoir quoi ajouter
        (instruments, FX, mix).
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <a
          href="/app"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--gp-accent)",
            color: "var(--gp-bg)",
            borderRadius: 12,
            padding: "12px 16px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Ouvrir l&apos;app
        </a>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 12,
            padding: "12px 16px",
            color: "rgba(242,243,245,0.78)",
            fontSize: "14px",
          }}
        >
          POC — Next.js + TypeScript + SCSS
        </span>
      </div>
    </main>
  );
}
