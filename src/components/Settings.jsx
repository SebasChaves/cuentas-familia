import { useState } from 'react';
import { renameMember, signOut, resetDemo, isDemo } from '../data';
import { IconCopy, IconShare, IconHelp, IconLogout } from './Icons';

export default function Settings({ user, group, names, onTutorial, notify }) {
  const [name, setName] = useState(names[user.uid] || '');
  const link = `${location.origin}${location.pathname}#unirse=${group.id}`;

  const saveName = async (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n || n === names[user.uid]) return;
    await renameMember(group.id, user.uid, n);
    notify('Nombre actualizado');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      notify('Enlace copiado');
    } catch {
      notify('No se pudo copiar');
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: 'Cuentas en Familia', text: 'Unite a nuestras cuentas en familia:', url: link });
    } catch {
      /* el usuario canceló */
    }
  };

  return (
    <>
      <h1 style={{ fontFamily: 'var(--display)', fontSize: 28 }}>Familia</h1>

      <form className="card" onSubmit={saveName}>
        <label htmlFor="nombre" className="eyebrow">
          Tu nombre en la app
        </label>
        <div className="row">
          <input id="nombre" className="field grow" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} />
          <button className="btn btn-sm" type="submit" disabled={!name.trim() || name.trim() === names[user.uid]}>
            Guardar
          </button>
        </div>
      </form>

      <section className="card">
        <p className="eyebrow">Miembros ({group.memberUids.length})</p>
        {group.memberUids.map((u) => (
          <div className="row" key={u}>
            <span className="avatar" style={{ width: 40, height: 40, fontSize: 16 }}>
              {(names[u] || '?').slice(0, 1).toUpperCase()}
            </span>
            <span>
              {names[u]}
              {u === user.uid && <span className="muted"> (vos)</span>}
            </span>
          </div>
        ))}
      </section>

      {!isDemo && (
        <section className="card">
          <p className="eyebrow">Invitar a la familia</p>
          <p className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>
            Mandales este enlace. Al abrirlo e iniciar sesión con Google quedan en esta familia. También pueden escribir el
            código a mano:
          </p>
          <code className="num" style={{ fontSize: 15, wordBreak: 'break-all', color: 'var(--pos)' }}>
            {group.id}
          </code>
          <div className="row">
            <button className="btn btn-sm grow" onClick={copy}>
              <IconCopy size={16} /> Copiar enlace
            </button>
            {'share' in navigator && (
              <button className="btn btn-sm grow" onClick={share}>
                <IconShare size={16} /> Compartir
              </button>
            )}
          </div>
        </section>
      )}

      <section className="stack" style={{ gap: 10 }}>
        <button className="btn btn-block" onClick={onTutorial}>
          <IconHelp size={18} /> Ver el tutorial otra vez
        </button>
        {isDemo && (
          <button
            className="btn btn-block"
            onClick={() => {
              if (confirm('¿Volver a los datos de ejemplo? Se borra lo que anotaste en el demo.')) {
                resetDemo();
                notify('Demo reiniciado');
              }
            }}
          >
            Reiniciar datos de demo
          </button>
        )}
        <button className="btn btn-block btn-danger" onClick={signOut}>
          <IconLogout size={18} /> Cerrar sesión
        </button>
      </section>
    </>
  );
}
