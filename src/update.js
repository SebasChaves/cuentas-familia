// Detecta versiones nuevas de la app (service worker en espera) y expone el estado a React.
import { useSyncExternalStore } from 'react';
import { registerSW } from 'virtual:pwa-register';

export const APP_VERSION = __APP_VERSION__;

let state = { needRefresh: false };
let updateSW = () => location.reload();
const listeners = new Set();

function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
}

export function initUpdates() {
  // Para probar el aviso en desarrollo: http://localhost:5173/?probar-actualizacion
  if (import.meta.env.DEV && location.search.includes('probar-actualizacion')) {
    setTimeout(() => setState({ needRefresh: true }), 1500);
    return;
  }

  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      setState({ needRefresh: true });
    },
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      // Las PWA instaladas casi nunca buscan actualizaciones solas: revisamos al volver a la app
      // y cada 30 minutos mientras está abierta.
      const check = () => {
        if (navigator.onLine) registration.update().catch(() => {});
      };
      setInterval(check, 30 * 60 * 1000);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
    },
  });
}

export function applyUpdate() {
  updateSW(true);
}

export function useUpdateState() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => state,
  );
}

/** Compara versiones tipo 1.2.3. Devuelve >0 si a es más nueva que b. */
export function compareVersions(a, b) {
  const pa = String(a).split('.').map(Number);
  const pb = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d;
  }
  return 0;
}

/** Trae el changelog publicado (siempre del servidor, nunca de la caché). */
export async function fetchChangelog() {
  try {
    const res = await fetch(`./changelog.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
