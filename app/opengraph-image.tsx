import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #07271c 0%, #0b3d2e 55%, #7f1d1d 130%)",
          color: "#fff9f0",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 26, height: 26, borderRadius: 13, background: "#c0272d" }} />
          <div style={{ width: 34, height: 34, borderRadius: 17, background: "#e3b341" }} />
          <div style={{ width: 26, height: 26, borderRadius: 13, background: "#c0272d" }} />
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 88,
            fontWeight: 700,
            letterSpacing: -1,
            marginTop: 22,
          }}
        >
          <span>Merry</span>
          <span style={{ color: "#e3b341" }}>Hub</span>
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#f3e9d2", marginTop: 10 }}>
          {SITE_TAGLINE}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#e3b341", marginTop: 26 }}>
          Free cards - Wishes in 3 languages - Elf names - Christmas quiz
        </div>
      </div>
    ),
    { ...size },
  );
}
