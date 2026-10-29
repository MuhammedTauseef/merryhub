import { ImageResponse } from "next/og";

/** Apple touch icon (180×180), generated in code to match app/icon.tsx:
 *  gold "M" on deep green with the three bauble dots from the OG image. */
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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #07271c 0%, #0b3d2e 55%, #7f1d1d 130%)",
          color: "#e3b341",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#c0272d" }} />
          <div style={{ width: 19, height: 19, borderRadius: 10, background: "#e3b341" }} />
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#c0272d" }} />
        </div>
        <div style={{ display: "flex", fontSize: 104, fontWeight: 700, marginTop: 6 }}>M</div>
      </div>
    ),
    { ...size },
  );
}
