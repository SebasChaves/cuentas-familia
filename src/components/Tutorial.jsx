import { useEffect, useRef, useState } from 'react';
import { IconPlus, IconShare, IconWifiOff, IconCheck } from './Icons';

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone =
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

/* ---------- Ilustraciones (mini maquetas de la app) ---------- */

function ArtWelcome() {
  return (
    <div className="row" style={{ gap: 0 }} aria-hidden="true">
      {[
        ['P', 'var(--pos)', 'var(--pos-ink)'],
        ['M', 'var(--surface-2)', 'var(--soft)'],
        ['S', 'var(--neg)', '#431407'],
      ].map(([l, bg, fg], i) => (
        <span
          key={l}
          className="avatar"
          style={{ width: 92, height: 92, borderRadius: 46, fontSize: 36, background: bg, color: fg, border: '4px solid var(--bg)', marginLeft: i ? -18 : 0 }}
        >
          {l}
        </span>
      ))}
    </div>
  );
}

function ArtExpense() {
  return (
    <div className="mock" aria-hidden="true">
      <div className="segmented">
        <button tabIndex={-1} aria-pressed="true">Gasto</button>
        <button tabIndex={-1}>Préstamo</button>
        <button tabIndex={-1}>Pago</button>
      </div>
      <div className="num" style={{ fontSize: 36, fontWeight: 700, borderBottom: '2px solid var(--pos)', paddingBottom: 4 }}>
        ₡30 000
      </div>
      <div className="between" style={{ fontSize: 14 }}>
        <span className="muted">Pagó</span>
        <span>Papá</span>
      </div>
      <div className="between" style={{ fontSize: 14 }}>
        <span className="muted">Entre 3, le toca a c/u</span>
        <span className="num pos">₡10 000</span>
      </div>
    </div>
  );
}

function ArtLoan() {
  return (
    <div className="mock" aria-hidden="true">
      <div className="row">
        <span className="mov-icon">→</span>
        <div className="stack grow" style={{ gap: 2 }}>
          <span style={{ fontSize: 15 }}>Préstamo</span>
          <span className="mov-sub">Mamá le prestó a Sebas</span>
        </div>
        <span className="num">₡10 000</span>
      </div>
      <div className="row">
        <span className="mov-icon" style={{ color: 'var(--pos)' }}>
          <IconCheck />
        </span>
        <div className="stack grow" style={{ gap: 2 }}>
          <span style={{ fontSize: 15 }}>Pago</span>
          <span className="mov-sub">Sebas le pagó a Mamá</span>
        </div>
        <span className="num">₡10 000</span>
      </div>
    </div>
  );
}

function ArtBalance() {
  const rows = [
    ['Mamá', '+₡13 500', 'pos', 58],
    ['Papá', '+₡9 500', 'pos', 41],
    ['Sebas', '−₡23 000', 'neg', 100],
  ];
  return (
    <div className="mock" aria-hidden="true">
      {rows.map(([n, v, c, w]) => (
        <div className="stack" key={n}>
          <div className="between" style={{ fontSize: 14 }}>
            <span>{n}</span>
            <span className={`num ${c}`}>{v}</span>
          </div>
          <div className="bar-track">
            <div className="bar-half left">{c === 'neg' && <div className="bar neg" style={{ width: `${w}%` }} />}</div>
            <div className="bar-half">{c === 'pos' && <div className="bar pos" style={{ width: `${w}%` }} />}</div>
          </div>
        </div>
      ))}
      <div className="between" style={{ borderTop: '1px solid var(--border-2)', paddingTop: 12, fontSize: 14 }}>
        <span>Sebas → Mamá</span>
        <span className="btn btn-sm" style={{ height: 32 }}>Saldar</span>
      </div>
    </div>
  );
}

function ArtInstall() {
  return (
    <div className="stack" style={{ alignItems: 'center', gap: 18 }} aria-hidden="true">
      <img src="./icon-192.png" alt="" width="96" height="96" style={{ borderRadius: 24, border: '1px solid var(--line)', boxShadow: '0 10px 40px rgba(45, 212, 191, 0.18)' }} />
      <div className="row muted" style={{ fontSize: 14 }}>
        <IconWifiOff size={18} /> Funciona aunque no haya internet
      </div>
    </div>
  );
}

/* ---------- Pasos ---------- */

const STEPS = [
  {
    art: <ArtWelcome />,
    title: 'Bienvenidos a Cuentas·Fam',
    body: 'Aquí anotamos lo que nos debemos entre todos en la familia. Cada uno lo ve desde su celular y la app saca las cuentas sola.',
  },
  {
    art: <ArtExpense />,
    title: 'Anotá cada gasto',
    body: (
      <>
        Tocá el botón{' '}
        <span className="kbd" aria-label="más">
          <IconPlus size={14} />
        </span>{' '}
        de abajo. Poné el monto, quién pagó y entre quiénes se divide. La app calcula cuánto le toca a cada uno.
      </>
    ),
  },
  {
    art: <ArtLoan />,
    title: 'Préstamos y pagos',
    body: (
      <>
        ¿Alguien le prestó plata a otro? Elegí <strong>Préstamo</strong>. ¿Ya devolviste lo que debías? Elegí{' '}
        <strong>Pago</strong>, o tocá <strong>Saldar</strong> en el inicio y se llena solo.
      </>
    ),
  },
  {
    art: <ArtBalance />,
    title: 'Mirá quién le debe a quién',
    body: (
      <>
        En <span className="pos">verde</span>, a quien le deben. En <span className="neg">naranja</span>, quien debe. Abajo te
        decimos los pagos mínimos para quedar a mano.
      </>
    ),
  },
  {
    art: <ArtInstall />,
    title: isStandalone ? '¡Listo para usar!' : 'Instalala en el celular',
    body: isStandalone ? (
      'Ya tenés la app instalada. Podés volver a ver este tutorial cuando querás desde la pestaña Familia.'
    ) : isIOS ? (
      <>
        En Safari, tocá{' '}
        <span className="kbd" aria-label="Compartir">
          <IconShare size={14} />
        </span>{' '}
        y luego <strong>Agregar a inicio</strong>. Así queda como una app más.
      </>
    ) : (
      <>
        En Chrome, tocá el menú <span className="kbd">⋮</span> y luego <strong>Instalar app</strong> (o “Agregar a pantalla
        principal”). Así queda como una app más.
      </>
    ),
  },
];

export default function Tutorial({ onDone }) {
  const [i, setI] = useState(0);
  const touchX = useRef(null);
  const headingRef = useRef(null);
  const last = i === STEPS.length - 1;
  const step = STEPS[i];

  const next = () => (last ? onDone() : setI(i + 1));
  const prev = () => i > 0 && setI(i - 1);

  useEffect(() => {
    headingRef.current?.focus();
  }, [i]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setI((x) => Math.min(x + 1, STEPS.length - 1));
      if (e.key === 'ArrowLeft') setI((x) => Math.max(x - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <main
      className="tut"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (dx < -50 && !last) setI(i + 1);
        if (dx > 50) prev();
        touchX.current = null;
      }}
    >
      <div className="between">
        <span className="eyebrow">
          Paso {i + 1} de {STEPS.length}
        </span>
        {!last && (
          <button className="btn btn-ghost btn-sm" onClick={onDone}>
            Saltar
          </button>
        )}
      </div>

      <div className="tut-art" key={`art-${i}`}>
        {step.art}
      </div>

      <section className="tut-slide" key={`txt-${i}`} aria-live="polite">
        <h1 ref={headingRef} tabIndex={-1} style={{ outline: 'none' }}>
          {step.title}
        </h1>
        <p>{step.body}</p>
      </section>

      <div className="dots" role="group" aria-label="Pasos del tutorial">
        {STEPS.map((s, k) => (
          <button
            key={k}
            className="dot"
            aria-label={`Ir al paso ${k + 1}`}
            aria-current={k === i ? 'step' : undefined}
            onClick={() => setI(k)}
            style={{ padding: 0 }}
          />
        ))}
      </div>

      <div className="row">
        {i > 0 && (
          <button className="btn" onClick={prev} style={{ flex: '0 0 auto' }}>
            Atrás
          </button>
        )}
        <button className="btn btn-primary grow" onClick={next}>
          {last ? 'Empezar' : 'Siguiente'}
        </button>
      </div>
    </main>
  );
}
