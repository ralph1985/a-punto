import { ImageResponse } from "next/og";
import { BrandCar } from "@/components/brand-car";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#121714",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "center",
          background: "#d2df59",
          borderRadius: 112,
          color: "#121714",
          display: "flex",
          height: 400,
          justifyContent: "center",
          width: 400,
        }}
      >
        <BrandCar size={300} />
      </div>
    </div>,
    { ...size },
  );
}
