import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<div style={{ alignItems: "center", background: "#121714", color: "#d2df59", display: "flex", fontFamily: "sans-serif", fontSize: 230, fontWeight: 800, height: "100%", justifyContent: "center", letterSpacing: -24, width: "100%" }}>AP</div>, { ...size });
}
