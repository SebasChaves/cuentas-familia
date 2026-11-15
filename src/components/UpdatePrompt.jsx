import { useEffect, useState } from 'react';
import { APP_VERSION, applyUpdate, compareVersions, fetchChangelog, useUpdateState } from '../update';

const VERSION_KEY = 'cf-version'; // última versión que el usuario abrió
const NOTES_SEEN_KEY = 'cf-notas-vistas'; // versión cuyas novedades ya vio (antes de actualizar)
const TUTORIAL_KEY = 'cf-tutorial-visto';

/** Junta las novedades de las versiones en (desde, hasta]. */
function entriesBetween(changelog, from, to) {
  return changelog
    .filter((e) => compareVersions(e.version, from) > 0 && (!to || compareVersions(e.version, to) <= 0))
    .sort((a, b) => compareVersions(b.version, a.version));
}

function Notes({ entries }) {
  if (!entries.length) {
    return <p className="muted" style={{ fontSize: 15 }}>Mejoras y arreglos para que todo funcione mejor.</p>;
  }
  return (
    <div className="update-notes">
      {entries.map((e) => (
        <section key={e.version} className="stack" style={{ gap: 6 }}>
          {entries.length > 1 && (
            <p className="eyebrow">
              v{e.version}
              {e.title ? ` · ${e.title}` : ''}
            </p>
          )}
          <ul>
            {e.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function SparkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
    </svg>
  );
}

export default function UpdatePrompt() {
  const { needRefresh } = useUpdateState();
  const [changelog, setChangelog] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [afterUpdate, setAfterUpdate] = useState(null); // novedades a mostrar justo después de actualizar
  const [updating, setUpdating] = useState(false);

  // 1) Hay una versión nueva esperando: traer qué trae
  useEffect(() => {
    if (needRefresh && !changelog) fetchChangelog().then(setChangelog);
  }, [needRefresh, changelog]);

  // 2) Recién actualizada: mostrar novedades una vez (si no las vio ya en el aviso)
  useEffect(() => {
    const tutorialSeen = Boolean(localStorage.getItem(TUTORIAL_KEY));
    let last = localStorage.getItem(VERSION_KEY);
    // Usuarios de antes de que existiera este aviso
    if (!last && tutorialSeen) last = '1.0.0';
    if (!last || !tutorialSeen) {
      localStorage.setItem(VERSION_KEY, APP_VERSION);
      return;
    }
    if (compareVersions(APP_VERSION, last) <= 0) return;
    if (localStorage.getItem(NOTES_SEEN_KEY) === APP_VERSION) {
      localStorage.setItem(VERSION_KEY, APP_VERSION);
      return;
    }
    const t = setTimeout(async () => {
      const log = await fetchChangelog();
      setAfterUpdate(entriesBetween(log, last, APP_VERSION));
    }, 1800); // después de la pantalla de carga
    return () => clearTimeout(t);
  }, []);

  if (needRefresh && !dismissed) {
    const entries = changelog ? entriesBetween(changelog, APP_VERSION) : [];
    const newest = entries[0]?.version;
    return (
      <div className="update-card" role="dialog" aria-labelledby="update-title" aria-live="polite">
        <div className="row">
          <span className="update-icon">
            <SparkIcon />
          </span>
          <div className="stack grow" style={{ gap: 2 }}>
            <p className="eyebrow">Versión nueva{newest ? ` · v${newest}` : ''}</p>
            <h2 id="update-title" className="update-title">
              {entries.length === 1 && entries[0].title ? entries[0].title : '¡Hay novedades!'}
            </h2>
          </div>
        </div>
        {changelog ? <Notes entries={entries} /> : <p className="muted" style={{ fontSize: 15 }}>Cargando las novedades…</p>}
        <div className="row">
          <button className="btn" onClick={() => setDismissed(true)} disabled={updating}>
            Después
          </button>
          <button
            className="btn btn-primary grow"
            disabled={updating}
            onClick={() => {
              setUpdating(true);
              if (newest) localStorage.setItem(NOTES_SEEN_KEY, newest);
              localStorage.setItem(VERSION_KEY, newest || APP_VERSION);
              applyUpdate();
            }}
          >
            {updating ? 'Actualizando…' : 'Actualizar ahora'}
          </button>
        </div>
      </div>
    );
  }

  if (afterUpdate) {
    const close = () => {
      localStorage.setItem(VERSION_KEY, APP_VERSION);
      setAfterUpdate(null);
    };
    return (
      <div className="update-card" role="dialog" aria-labelledby="update-title">
        <div className="row">
          <span className="update-icon">
            <SparkIcon />
          </span>
          <div className="stack grow" style={{ gap: 2 }}>
            <p className="eyebrow">Actualizada a v{APP_VERSION}</p>
            <h2 id="update-title" className="update-title">
              Esto es lo nuevo
            </h2>
          </div>
        </div>
        <Notes entries={afterUpdate} />
        <button className="btn btn-primary btn-block" onClick={close}>
          Entendido
        </button>
      </div>
    );
  }

  return null;
}
