import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "#FDFBF7",
          position: "relative",
          padding: "80px 100px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 420,
            height: 420,
            background: "radial-gradient(circle at 100% 0%, rgba(139,168,136,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 300,
            height: 300,
            background: "radial-gradient(circle at 0% 100%, rgba(60,36,21,0.04) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
            <rect x="6" y="8" width="20" height="16" rx="3" stroke="#3C2415" strokeWidth="0.8" opacity="0.6"/>
            <rect x="6" y="8" width="20" height="5" rx="3" fill="#8BA888" opacity="0.5"/>
            <path d="M12 16h8v2h-8zm-1 4h10v2H11zm1 4h6v2h-6z" fill="#3C2415" opacity="0.7"/>
          </svg>
          <span
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 20,
              color: "#6B6B6B",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            AgendaFácil
          </span>
        </div>
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 80,
            fontWeight: 400,
            letterSpacing: "-0.03em",
            color: "#3C2415",
            margin: 0,
            lineHeight: 1.05,
            maxWidth: 700,
          }}
        >
          Agendamento premium
        </h1>
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 80,
            fontWeight: 400,
            letterSpacing: "-0.03em",
            color: "#3C2415",
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          para seu salão
        </h1>
        <div
          style={{
            width: 80,
            height: 2,
            background: "#8BA888",
            margin: "28px 0 24px",
          }}
        />
        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 22,
            color: "#6B6B6B",
            margin: 0,
            letterSpacing: "0.02em",
            lineHeight: 1.5,
          }}
        >
          Agende online · Notificações WhatsApp · Gestão simplificada
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
