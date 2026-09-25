import type { Metadata } from "next";
import { Manrope, Work_Sans } from "next/font/google";
import Link from "next/link";
import CartCount from "@/components/CartCount";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans" });

export const metadata: Metadata = {
  title: "Deconova — Muebles fabricados en Miranda",
  description: "Muebles de gama media y alta fabricados en Miranda, Venezuela. Pago Móvil o transferencia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${manrope.variable} ${workSans.variable}`}>
      <body>
        <header className="site-header">
          <Link href="/" data-testid="brand" className="brand">Deconova</Link>
          <nav aria-label="Principal">
            <Link href="/catalogo/">Catálogo</Link>
            <a href="#contacto">Contacto</a>
            <CartCount />
          </nav>
        </header>
        {children}
        <footer id="contacto" className="site-footer">
          <p className="label">Contacto</p>
          <p>
            Escríbenos por Instagram:{" "}
            <a href="https://www.instagram.com/deconova.ve/" rel="noopener noreferrer" target="_blank">@deconova.ve</a>
          </p>
          <p className="muted">Miranda, Venezuela</p>
        </footer>
      </body>
    </html>
  );
}
