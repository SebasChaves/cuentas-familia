import { useState } from 'react';
import MovementRow from './MovementRow';
import { IconTrash } from './Icons';
import { money } from '../lib';

const FILTERS = [
  { id: 'all', label: 'Todo' },
  { id: 'expense', label: 'Gastos' },
  { id: 'loan', label: 'Préstamos' },
  { id: 'payment', label: 'Pagos' },
];

export default function History({ user, names, movements, onDelete }) {
  const [filter, setFilter] = useState('all');
  const [mineOnly, setMineOnly] = useState(false);
  const [open, setOpen] = useState(null);

  const list = movements.filter(
    (m) =>
      (filter === 'all' || m.type === filter) &&
      (!mineOnly || m.paidBy === user.uid || Object.keys(m.splits || {}).includes(user.uid)),
  );

  return (
    <>
      <h1 className="title" style={{ fontFamily: 'var(--display)', fontSize: 28 }}>
        Historial
      </h1>

      <div className="chips" role="group" aria-label="Filtrar">
        {FILTERS.map((f) => (
          <button key={f.id} className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
        <button className="chip" aria-pressed={mineOnly} onClick={() => setMineOnly((v) => !v)}>
          Donde participo
        </button>
      </div>

      <section>
        {list.length === 0 && <p className="empty">No hay movimientos con ese filtro.</p>}
        {list.map((m) => (
          <div key={m.id}>
            <MovementRow m={m} names={names} expanded={open === m.id} onClick={() => setOpen(open === m.id ? null : m.id)} />
            {open === m.id && (
              <div className="mov-detail">
                {Object.entries(m.splits || {}).map(([u, part]) => (
                  <div className="between" key={u}>
                    <span className="muted">
                      {m.type === 'expense' ? `Le toca a ${names[u] || 'Alguien'}` : `Recibe ${names[u] || 'Alguien'}`}
                    </span>
                    <span className="num">{money(part)}</span>
                  </div>
                ))}
                <button
                  className="btn btn-sm btn-danger"
                  style={{ alignSelf: 'flex-start', marginTop: 6 }}
                  onClick={() => {
                    if (confirm('¿Eliminar este movimiento? Los balances se recalculan.')) {
                      onDelete(m.id);
                      setOpen(null);
                    }
                  }}
                >
                  <IconTrash size={16} /> Eliminar
                </button>
              </div>
            )}
          </div>
        ))}
      </section>
    </>
  );
}
