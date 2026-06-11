import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata = {
  title: "Korriente Agentes — Agentes de IA para PyMEs chilenas",
  description:
    "Agentes de IA que responden tus leads y cobran tus facturas, 24/7, con costo bajo control. Para PyMEs chilenas.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-CL">
      <body>
        <nav className="nav">
          <div className="container nav-inner">

            {/* Logo */}
            <Link href="/" className="nav-logo">
              <span className="nav-logo-mark">K</span>
              <span className="nav-logo-text">
                KORRIENTE <b>AGENTES</b>
              </span>
            </Link>

            {/* Links principales */}
            <div className="nav-links">
              <Link href="/como-funciona" className="nav-link">Cómo funciona</Link>
              <Link href="/por-que-nosotros" className="nav-link">Por qué Korriente</Link>
              <Link href="/workflows" className="nav-link">Workflows</Link>
              <a href="/#precios" className="nav-link">Precios</a>
            </div>

            {/* Acciones secundarias + CTA */}
            <div className="nav-actions">
              <Link href="/modelo-negocio" className="nav-link nav-link-muted">Modelo</Link>
              <Link href="/dashboard" className="nav-icon-link" title="Panel de cliente">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </Link>
              <a href="/#precios" className="btn btn-primary nav-cta">
                Agendar diagnóstico
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6 }}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>

          </div>
        </nav>
        <main>{children}</main>
        <footer className="footer">
          <div className="container footer-inner">
            <Link href="/" className="nav-logo" style={{ gap: 8 }}>
              <span className="nav-logo-mark" style={{ width: 28, height: 28, fontSize: 14 }}>K</span>
              <span className="nav-logo-text">KORRIENTE <b>AGENTES</b></span>
            </Link>
            <span className="footer-tagline">Agentes de IA con resultados medibles · Chile 2026</span>
            <span className="footer-legal">Ley 19.628 · Datos tratados con responsabilidad</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
