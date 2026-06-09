import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata = {
  title: "Korriente — Agentes de IA para PyMEs",
  description:
    "Agentes de IA que responden tus leads y cobran tus facturas, 24/7, con costo bajo control. Para PyMEs chilenas.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-CL">
      <body>
        <nav className="nav">
          <div className="container nav-inner">
            <Link href="/" className="logo">
              KORR<b>IENTE</b>
            </Link>
            <div className="nav-links">
              <a href="/#como-funciona">Cómo funciona</a>
              <a href="/#demo">Demo</a>
              <a href="/#precios">Precios</a>
              <Link href="/workflows">Workflows</Link>
              <Link href="/docs">Documentación</Link>
              <Link href="/dashboard">Panel</Link>
            </div>
            <a href="/#precios" className="btn btn-primary" style={{ marginLeft: 8 }}>
              Agendar diagnóstico
            </a>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="footer">
          <div className="container" style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", width: "100%" }}>
            <span className="logo">KORR<b>IENTE</b></span>
            <span>Agentes de IA que generan resultados medibles · Chile 2026</span>
            <span style={{ marginLeft: "auto" }}>Datos tratados según Ley 19.628</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
