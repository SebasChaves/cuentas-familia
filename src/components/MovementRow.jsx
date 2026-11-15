import { CategoryIcon } from './Icons';
import { money, shortDate } from '../lib';

export function describe(m, names) {
  const n = (u) => names[u] || 'Alguien';
  const to = Object.keys(m.splits || {})[0];
  if (m.type === 'loan') return { title: m.description || 'Préstamo', sub: `${n(m.paidBy)} le prestó a ${n(to)}` };
  if (m.type === 'payment') return { title: 'Pago', sub: `${n(m.paidBy)} le pagó a ${n(to)}` };
  const count = Object.keys(m.splits || {}).length;
  return { title: m.description || 'Gasto', sub: `Pagó ${n(m.paidBy)} · entre ${count}` };
}

export default function MovementRow({ m, names, onClick, expanded }) {
  const d = describe(m, names);
  return (
    <button className="mov" onClick={onClick} aria-expanded={onClick ? Boolean(expanded) : undefined}>
      <span className="mov-icon">
        <CategoryIcon movement={m} />
      </span>
      <span className="stack grow" style={{ gap: 2 }}>
        <span className="mov-title">{d.title}</span>
        <span className="mov-sub">
          {d.sub} · {shortDate(m.date)}
        </span>
      </span>
      <span className="num" style={{ fontSize: 15 }}>
        {money(m.amount)}
      </span>
    </button>
  );
}
