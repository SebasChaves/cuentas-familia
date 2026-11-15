import { useState } from 'react';
import { signIn, isDemo } from '../data';

export default function Login() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const go = async () => {
    setError('');
    setBusy(true);
    try {
      await signIn();
    } catch (e) {
      if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
        setError('No se pudo iniciar sesión. Intentá de nuevo.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="center-screen">
      <div className="stack" style={{ gap: 12 }}>
        <span className="brand">CUENTAS·FAM</span>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 36, lineHeight: 1.1 }}>
          Lo que nos debemos,
          <br />
          <span className="pos">claro y sin enredos.</span>
        </h1>
        <p className="muted" style={{ fontSize: 16, lineHeight: 1.5 }}>
          Entrá con tu cuenta de Google para ver y anotar las cuentas de la familia.
        </p>
      </div>
      <div className="stack" style={{ gap: 12 }}>
        <button className="btn btn-primary btn-block" onClick={go} disabled={busy}>
          {isDemo ? 'Entrar al demo' : busy ? 'Abriendo Google…' : 'Entrar con Google'}
        </button>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
