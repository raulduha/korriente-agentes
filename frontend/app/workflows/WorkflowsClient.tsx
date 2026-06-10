'use client';

import { useState, useEffect, Fragment } from 'react';
import { WORKFLOWS, PATTERNS, type Workflow } from '@/lib/workflows';

// ── Node type classification ──────────────────────────────────────────────────

const NODE_TYPE_RULES: Array<[string[], string]> = [
  [['entrante', 'inicio', 'brief', 'lead', 'tarea', 'objetivo', 'solicitud', 'ticket', 'cotizacion', 'proceso', 'manual'], 'trigger'],
  [['config', 'extraer', 'preparar', 'inicializar', 'parsear', 'consolidar'], 'config'],
  [['llm', 'clasificar', 'generar', 'sintetizar', 'router', 'delegar', 'revisar', 'critico', 'propuesta', 'brief creativo', 'estrategia', 'redactar', 'prospectar', 'calificar'], 'llm'],
  [['¿', '?'], 'decision'],
  [['humano', 'hitl', 'escalar', 'abortar', 'checkpoint', 'esperar', 'notif'], 'hitl'],
];

const NODE_STYLES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  trigger:  { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', dot: '#3b82f6' },
  config:   { bg: '#f8fafc', border: '#94a3b8', text: '#475569', dot: '#94a3b8' },
  llm:      { bg: '#ecfdf5', border: '#10b981', text: '#065f46', dot: '#10b981' },
  decision: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', dot: '#f59e0b' },
  hitl:     { bg: '#fef2f2', border: '#ef4444', text: '#991b1b', dot: '#ef4444' },
  output:   { bg: '#f5f3ff', border: '#8b5cf6', text: '#5b21b6', dot: '#8b5cf6' },
};

const NODE_LABELS: Record<string, string> = {
  trigger: 'Entrada', config: 'Config', llm: 'IA / LLM',
  decision: 'Decisión', hitl: 'Humano', output: 'Salida',
};

function getNodeType(name: string): string {
  const lower = name.toLowerCase();
  for (const [keywords, type] of NODE_TYPE_RULES) {
    if (keywords.some((k) => lower.includes(k))) return type;
  }
  return 'output';
}

// ── Mini dots preview (inside card) ──────────────────────────────────────────

function FlowDots({ flujo }: { flujo: string[] }) {
  const visible = flujo.slice(0, 7);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {visible.map((n, i) => {
        const s = NODE_STYLES[getNodeType(n)];
        return (
          <Fragment key={i}>
            <div title={n} style={{
              width: 9, height: 9, borderRadius: '50%',
              background: s.dot, flexShrink: 0,
              boxShadow: `0 0 0 2px ${s.bg}`,
            }} />
            {i < visible.length - 1 && (
              <div style={{ width: 10, height: 1.5, background: '#dde3ed', flexShrink: 0 }} />
            )}
          </Fragment>
        );
      })}
      {flujo.length > 7 && (
        <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 2 }}>+{flujo.length - 7}</span>
      )}
    </div>
  );
}

// ── Animated flow (inside drawer) ─────────────────────────────────────────────

function AnimatedFlow({ flujo }: { flujo: string[] }) {
  return (
    <div className="aflow-wrap">
      <div className="aflow">
        {flujo.map((nodeName, i) => {
          const type = getNodeType(nodeName);
          const s = NODE_STYLES[type];
          const nextType = i < flujo.length - 1 ? getNodeType(flujo[i + 1]) : null;
          const nextDot = nextType ? NODE_STYLES[nextType].dot : s.dot;
          return (
            <div
              key={i}
              className="aflow-item"
              style={{ '--nd': `${i * 0.12}s` } as React.CSSProperties}
            >
              <div className="aflow-node" style={{ background: s.bg, borderColor: s.border, color: s.text }}>
                {nodeName}
              </div>
              {i < flujo.length - 1 && (
                <div className="aflow-conn">
                  <div className="aflow-pulse" style={{ background: nextDot, animationDelay: `${i * 0.4}s` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="aflow-legend">
        {(Object.entries(NODE_STYLES) as Array<[string, typeof NODE_STYLES[string]]>).map(([type, s]) => (
          <span key={type} className="aflow-legend-item">
            <span style={{ background: s.dot, width: 7, height: 7, borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
            {NODE_LABELS[type]}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Workflow Card (compact) ───────────────────────────────────────────────────

function WorkflowCard({ w, onSelect }: { w: Workflow; onSelect: (w: Workflow) => void }) {
  return (
    <button className={`wfc${w.featured ? ' wfc-featured' : ''}`} onClick={() => onSelect(w)}>
      <div className="wfc-head">
        <span className="wfc-ico">{w.ico}</span>
        <span className="wfc-cat">{w.cat}</span>
      </div>
      <h3 className="wfc-name">{w.name}</h3>
      <p className="wfc-tag">{w.tagline}</p>
      <ul className="wfc-quien">
        {w.paraQuien.slice(0, 2).map((q, i) => <li key={i}>{q}</li>)}
      </ul>
      <div className="wfc-foot">
        <FlowDots flujo={w.flujo} />
        <span className="wfc-cost">{w.costo.replace('≈ ', '').split(' ').slice(0, 2).join(' ')}</span>
      </div>
      <div className="wfc-cta">Ver detalles →</div>
    </button>
  );
}

// ── Drawer (detail panel) ─────────────────────────────────────────────────────

function WorkflowDrawer({ w, onClose }: { w: Workflow; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="drawer-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>

        {/* Sticky header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 38, lineHeight: 1 }}>{w.ico}</span>
            <div>
              <div className="wf-cat" style={{ marginBottom: 4 }}>{w.cat}</div>
              <h2 style={{ margin: 0, fontSize: 19, lineHeight: 1.2 }}>{w.name}</h2>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="drawer-body">
          <p className="drawer-tagline">{w.tagline}</p>

          {/* Animated flow */}
          <div className="drawer-section">
            <div className="drawer-section-label">Cómo fluye</div>
            <AnimatedFlow flujo={w.flujo} />
          </div>

          {/* Qué hace */}
          <div className="drawer-section">
            <div className="drawer-section-label">Qué hace</div>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.65 }}>{w.queHace}</p>
          </div>

          {/* Para quién */}
          <div className="drawer-section">
            <div className="drawer-section-label">Para quién funciona</div>
            <ul className="wf-who" style={{ margin: 0 }}>
              {w.paraQuien.map((q, i) => <li key={i}>{q}</li>)}
            </ul>
          </div>

          {/* Escenarios */}
          <div className="drawer-section">
            <div className="drawer-section-label">Escenarios reales</div>
            <ul className="wf-list" style={{ margin: 0 }}>
              {w.escenarios.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>

          {/* Meta grid */}
          <div className="drawer-meta-grid">
            <div>
              <dt>Modelo de IA</dt>
              <dd>{w.modelo}</dd>
            </div>
            <div>
              <dt>Costo aprox.</dt>
              <dd>{w.costo}</dd>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <dt>Escala a humano si</dt>
              <dd>{w.hitl}</dd>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <dt>Qué conectar</dt>
              <dd>
                <div className="pills" style={{ marginTop: 6 }}>
                  {w.conectores.map((c) => <span className="pill" key={c}>{c}</span>)}
                </div>
              </dd>
            </div>
          </div>

          {/* Download */}
          <div className="drawer-dl">
            <a href={w.file} download className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              ⬇ Descargar workflow
            </a>
          </div>

          {/* Workers */}
          {w.extras && w.extras.length > 0 && (
            <div className="wf-extras" style={{ marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>Incluye sus workers</h4>
              {w.extras.map((ex) => (
                <div className="wf-extra-row" key={ex.file}>
                  <span>{ex.name}</span>
                  <a href={ex.file} download className="dl-link">Descargar</a>
                </div>
              ))}
            </div>
          )}

          {/* Cómo empezarlo */}
          <details className="wf-how-to" open>
            <summary>📋 Cómo empezarlo — pasos específicos</summary>
            <ol className="wf-steps-list">
              {w.comoEmpezar.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </details>
        </div>
      </aside>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function WorkflowsClient() {
  const [selected, setSelected] = useState<Workflow | null>(null);

  return (
    <>
      {/* Workflows catalog */}
      <section
        id="workflows"
        style={{ background: '#fff', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}
      >
        <div className="container">
          <div className="section-head">
            <div className="kicker">El catálogo</div>
            <h2>7 workflows listos para descargar</h2>
            <p>
              Haz clic en cualquiera para ver cómo funciona, para quién sirve y los pasos exactos
              para empezarlo después de descargarlo.
            </p>
          </div>
          <div className="wfc-grid">
            {WORKFLOWS.map((w) => (
              <WorkflowCard key={w.key} w={w} onSelect={setSelected} />
            ))}
          </div>
        </div>
      </section>

      {/* Patterns */}
      <section id="patrones">
        <div className="container">
          <div className="section-head">
            <div className="kicker">Patrones · Arquitectura multi-agente</div>
            <h2>4 moldes de cómo conectar agentes entre sí</h2>
            <p>
              No son workflows de negocio — son los patrones de orquestación reutilizables.
              Descarga el que se ajuste a tu problema y sustitúyele los prompts.
            </p>
          </div>
          <div className="wfc-grid">
            {PATTERNS.map((w) => (
              <WorkflowCard key={w.key} w={w} onSelect={setSelected} />
            ))}
          </div>
        </div>
      </section>

      {/* Detail drawer */}
      {selected && <WorkflowDrawer w={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
