import { useState } from 'react';
import { createGroup, joinGroup, signOut } from '../data';

function codeFromUrl() {
  const m = location.hash.match(/unirse=([\w-]+)/);
  return m ? m[1] : '';
}

export default function GroupSetup({ user }) {
  const [code, setCode] = useState(codeFromUrl);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    setError('');
    setBusy(true);
    try {
      await fn();
      history.replaceState(null, '', location.pathname);
    } catch (e) {
      setError(e.message || 'Algo salió mal. Intentá de nuevo.');
      setBusy(false);
    }
  };

  return (
    <main className="center-screen">
      <div className="stack" style={{ gap: 8 }}>
        <span className="brand">CUENTAS·FAM</span>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 30 }}>¡Hola, {(user.displayName || '').split(' ')[0]}!</h1>
        <p className="muted" style={{ fontSize: 16, lineHeight: 1.5 }}>
          {code
            ? 'Te invitaron a una familia. Tocá Unirme para entrar.'
            : 'Si alguien de la familia ya creó el grupo, pegá el código que te mandó. Si sos el primero, creá la familia.'}
        </p>
      </div>

      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => joinGroup(user, code));
        }}
      >
        <label htmlFor="codigo" className="eyebrow">
          Código de la familia
        </label>
        <input
          id="codigo"
          className="field"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          placeholder="Pegalo aquí"
        />
        <button className="btn btn-primary btn-block" disabled={busy || !code.trim()}>
          Unirme
        </button>
      </form>

      {!code && (
        <button className="btn btn-block" disabled={busy} onClick={() => run(() => createGroup(user))}>
          Crear una familia nueva
        </button>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <button className="btn btn-ghost" onClick={signOut}>
        Usar otra cuenta
      </button>
    </main>
  );
}
