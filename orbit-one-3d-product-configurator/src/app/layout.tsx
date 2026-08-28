import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbit One — 3D Product Configurator",
  description: "A lightweight interactive 3D product configurator built with React Three Fiber.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
