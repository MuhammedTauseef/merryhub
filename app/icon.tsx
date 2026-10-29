import { ImageResponse } from "next/og";

/** Browser favicon, generated in code (no binary asset to ship): the gold
 *  "M" brand initial on the site's deep-green, echoing the OG image. */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b3d2e",
          borderRadius: 7,
          color: "#e3b341",
          fontFamily: "Georgia, serif",
          fontSize: 23,
          fontWeight: 700,
        }}
      >
        M
      </div>
    ),
    { ...size },
  );
}
