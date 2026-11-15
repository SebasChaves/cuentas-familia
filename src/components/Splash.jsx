// Pantalla de carga: un sube y baja con los dos colores de la app (le deben / debe)
// buscando el equilibrio. Los estilos están en index.html para que también se vea
// antes de que cargue JavaScript.
export default function Splash({ leaving }) {
  return (
    <div className={`splash${leaving ? ' out' : ''}`} role="status" aria-label="Cargando">
      <svg viewBox="0 0 120 100" aria-hidden="true">
        <path d="M60 76 L50 94 H70 Z" fill="#3a4048" />
        <g className="seesaw">
          <rect x="10" y="70" width="100" height="8" rx="4" fill="#f3f4f6" />
          <circle className="ball-a" cx="30" cy="53" r="17" fill="#2dd4bf" />
          <circle className="ball-b" cx="90" cy="53" r="17" fill="#fb923c" />
        </g>
      </svg>
      <div className="splash-name">CUENTAS·FAM</div>
      <div className="splash-sub">Sacando las cuentas…</div>
    </div>
  );
}
