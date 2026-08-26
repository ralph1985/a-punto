import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "A Punto", short_name: "A Punto", description: "Agenda privada de mantenimiento de vehículos.", start_url: "/", display: "standalone", background_color: "#121714", theme_color: "#121714", icons: [{ src: "/icon?size=192", sizes: "192x192", type: "image/png" }, { src: "/icon?size=512", sizes: "512x512", type: "image/png" }] };
}
