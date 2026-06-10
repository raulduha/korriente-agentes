'use client';

import { useState } from 'react';

const PROCESO = [
  {
    n: 1,
    t: 'Diagnóstico gratuito (30 min)',
    d: 'Revisamos un proceso concreto — leads, cobranza, soporte — y calculamos cuánto te cuesta hoy en horas y oportunidades perdidas. Salís con un número de ROI estimado antes de firmar nada.',
  },
  {
    n: 2,
    t: 'Propuesta + contrato (2–3 días hábiles)',
    d: 'Recibes la propuesta formal con alcance exacto, integraciones necesarias, SLA de respuesta y el plan recomendado. Sin letra chica: lo que dice el papel es lo que se entrega.',
  },
  {
    n: 3,
    t: 'Setup e integración (5–10 días hábiles)',
    d: 'Conectamos WhatsApp Business API (vía Meta o proveedor autorizado), tu CRM o email, y configuramos el agente con tus plantillas y reglas de negocio. Nada de acceso a datos que no necesitamos.',
  },
  {
    n: 4,
    t: 'Pruebas en sandbox',
    d: 'El agente corre con datos reales pero sin enviar mensajes reales todavía. Tú apruebas cada comportamiento — clasificaciones, respuestas, escalamientos — antes del go-live.',
  },
  {
    n: 5,
    t: 'Go-live y monitoreo',
    d: 'El agente entra en producción: responde 24/7, escala a humano cuando corresponde y registra cada interacción en el panel. Nosotros monitoreamos las primeras 48 h.',
  },
  {
    n: 6,
    t: 'Reunión de ajuste a los 30 días',
    d: 'Revisamos métricas reales (tiempo de respuesta, conversiones, costo/conversación), afinamos prompts y decidimos si el plan actual es el correcto o conviene ajustar.',
  },
];

const PAGOS = [
  {
    ico: '📅',
    t: 'Facturación mensual',
    d: 'Boleta o factura electrónica en CLP + IVA, emitida el 1 de cada mes. El plan mensual cubre el servicio completo del período siguiente.',
  },
  {
    ico: '🔧',
    t: 'Setup único al inicio',
    d: 'Se factura por separado antes de empezar el trabajo. Cubre la integración, configuración del agente y pruebas en sandbox.',
  },
  {
    ico: '💳',
    t: 'Medios de pago',
    d: 'Transferencia bancaria o tarjeta de crédito/débito vía Webpay o Flow. Sin suscripción automática — cada cobro se notifica por correo con anticipación.',
  },
  {
    ico: '⚠️',
    t: 'Alerta al 80% del tope',
    d: 'Cuando el agente llega al 80% del budget cap del plan, te avisamos por email. Puedes subir de plan o dejar que el agente derive a humano al 100%.',
  },
  {
    ico: '🛑',
    t: 'Tope duro al 100%',
    d: 'Al llegar al límite, el agente deja de gastar en IA automáticamente y deriva todas las consultas a tu equipo. Nunca recibes una factura sorpresa.',
  },
  {
    ico: '📦',
    t: 'Sin extras ocultos',
    d: 'Los costos de IA van incluidos dentro del plan. No se cobran por separado. Si el volumen real supera el plan, te avisamos antes de cobrar diferencias.',
  },
  {
    ico: '🔄',
    t: 'Cambio de plan',
    d: 'Puedes subir de plan en cualquier momento (efectivo al día siguiente). Para bajar se requiere 30 días de aviso para no interrumpir el servicio.',
  },
];

export default function PricingTabs() {
  const [tab, setTab] = useState<'proceso' | 'pagos'>('proceso');

  return (
    <div className="ptabs-wrap">
      {/* Tab buttons */}
      <div className="ptabs-nav" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'proceso'}
          className={`ptab-btn${tab === 'proceso' ? ' active' : ''}`}
          onClick={() => setTab('proceso')}
        >
          ¿Qué pasa al contratar?
        </button>
        <button
          role="tab"
          aria-selected={tab === 'pagos'}
          className={`ptab-btn${tab === 'pagos' ? ' active' : ''}`}
          onClick={() => setTab('pagos')}
        >
          Control de pagos
        </button>
      </div>

      {/* Proceso panel */}
      {tab === 'proceso' && (
        <div className="ptab-panel" role="tabpanel">
          <p className="ptab-intro">
            Desde el primer contacto hasta el agente funcionando en tu empresa — esto es lo que ocurre en cada etapa.
          </p>
          <div className="ptab-steps">
            {PROCESO.map((s) => (
              <div className="ptab-step" key={s.n}>
                <div className="ptab-num">{s.n}</div>
                <div>
                  <h4 className="ptab-step-title">{s.t}</h4>
                  <p className="ptab-step-desc">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagos panel */}
      {tab === 'pagos' && (
        <div className="ptab-panel" role="tabpanel">
          <p className="ptab-intro">
            Cómo funciona la facturación, los topes automáticos y qué pasa si el volumen cambia.
          </p>
          <div className="ptab-pagos">
            {PAGOS.map((p) => (
              <div className="ptab-pago-item" key={p.t}>
                <span className="ptab-pago-ico">{p.ico}</span>
                <div>
                  <h4 className="ptab-step-title">{p.t}</h4>
                  <p className="ptab-step-desc">{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
