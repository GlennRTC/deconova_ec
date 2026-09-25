import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deconova — Muebles",
  description: "Muebles de gama media y alta fabricados en Miranda, Venezuela.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
