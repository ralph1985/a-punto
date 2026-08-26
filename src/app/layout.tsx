import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

export const metadata: Metadata = {
  title: "A Punto",
  description: "Agenda privada de mantenimiento de vehículos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col"><ServiceWorkerRegister />{children}</body>
    </html>
  );
}
