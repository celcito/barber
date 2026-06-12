import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FDFBF7",
        }}
      >
        <div
          style={{
            width: 144,
            height: 144,
            borderRadius: 32,
            background: "linear-gradient(135deg, #3C2415 0%, #2A1A0F 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 0 2px rgba(139,168,136,0.3), 0 0 0 6px rgba(139,168,136,0.1)",
          }}
        >
          <svg width="80" height="80" viewBox="0 0 32 32" fill="none">
            <rect x="6" y="8" width="20" height="16" rx="2.5" stroke="#FDFBF7" strokeWidth="0.8" opacity="0.9"/>
            <rect x="6" y="8" width="20" height="5" rx="2.5" fill="#8BA888" opacity="0.6"/>
            <path d="M10 7.5h0.8v3h-0.8z" fill="#FDFBF7" opacity="0.5"/>
            <path d="M15 7.5h0.8v3h-0.8z" fill="#FDFBF7" opacity="0.5"/>
            <path d="M21 7.5h0.8v3h-0.8z" fill="#FDFBF7" opacity="0.5"/>
            <path d="M12 17h8v1.5h-8zm-1 3h10v1.5H11zm1 3h6v1.5h-6z" fill="#FDFBF7" opacity="0.85"/>
          </svg>
        </div>
      </div>
    ),
    { ...size }
  );
}
