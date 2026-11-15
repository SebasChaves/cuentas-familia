import { useMemo } from 'react';
import { money, settleUp } from '../lib';
import MovementRow from './MovementRow';

export default function Home({ user, group, names, movements, balances, onSettle, onSeeAll }) {
  const mine = balances[user.uid] || 0;
  const plan = useMemo(() => settleUp(balances), [balances]);
  const max = Math.max(1, ...Object.values(balances).map(Math.abs));
  const myPlan = plan.filter((p) => p.from === user.uid || p.to === user.uid);

  let subtitle = 'Estás al día con todos';
  if (mine < 0) subtitle = `${myPlan.length} ${myPlan.length === 1 ? 'pago' : 'pagos'} para quedar en cero`;
  if (mine > 0) subtitle = 'Te deben en total';

  // Orden: más le deben → más debe
  const people = [...group.memberUids].sort((a, b) => (balances[b] || 0) - (balances[a] || 0));

  return (
    <>
      <header className="between">
        <span className="brand">CUENTAS·FAM</span>
        <span className="muted" style={{ fontSize: 14 }}>
          Hola, {names[user.uid]}
        </span>
      </header>

      <section className="stack" style={{ gap: 4 }} aria-label="Tu balance">
        <p className="eyebrow">Tu balance</p>
        <p className={`big ${mine < 0 ? 'neg' : mine > 0 ? 'pos' : ''}`}>{money(mine, { sign: true })}</p>
        <p className="muted" style={{ fontSize: 14 }}>
          {subtitle}
        </p>
      </section>

      <section className="card" aria-label="Balance de cada uno">
        <p className="eyebrow">Balance de cada uno</p>
        {people.map((u) => {
          const v = balances[u] || 0;
          const w = `${(Math.abs(v) / max) * 100}%`;
          return (
            <div className="stack" key={u}>
              <div className="between" style={{ fontSize: 14 }}>
                <span>
                  {names[u]}
                  {u === user.uid && <span className="muted"> (vos)</span>}
                </span>
                <span className={`num ${v > 0 ? 'pos' : v < 0 ? 'neg' : 'muted'}`}>
                  {v === 0 ? 'al día' : money(v, { sign: true })}
                </span>
              </div>
              <div className="bar-track" aria-hidden="true">
                <div className="bar-half left">{v < 0 && <div className="bar neg" style={{ width: w }} />}</div>
                <div className="bar-half">{v > 0 && <div className="bar pos" style={{ width: w }} />}</div>
              </div>
            </div>
          );
        })}
        {group.memberUids.length < 2 && (
          <p className="muted" style={{ fontSize: 14 }}>
            Invitá a tu familia desde la pestaña Familia.
          </p>
        )}
      </section>

      {plan.length > 0 && (
        <section className="stack" style={{ gap: 10 }} aria-label="Para quedar a mano">
          <p className="eyebrow">Para quedar a mano</p>
          {plan.map((p) => (
            <div key={p.from + p.to} className="card" style={{ padding: '12px 14px 12px 16px', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <div className="stack grow" style={{ gap: 2 }}>
                <span style={{ fontSize: 15 }}>
                  {p.from === user.uid ? 'Vos' : names[p.from]} → {p.to === user.uid ? 'vos' : names[p.to]}
                </span>
                <span className="num neg" style={{ fontSize: 14 }}>
                  {money(p.amount)}
                </span>
              </div>
              <button
                className="btn btn-sm"
                onClick={() => onSettle({ type: 'payment', paidBy: p.from, to: p.to, amount: p.amount })}
              >
                Saldar
              </button>
            </div>
          ))}
        </section>
      )}

      <section aria-label="Actividad reciente">
        <div className="between" style={{ marginBottom: 4 }}>
          <p className="eyebrow">Actividad</p>
          {movements.length > 5 && (
            <button className="btn btn-ghost btn-sm" onClick={onSeeAll}>
              Ver todo
            </button>
          )}
        </div>
        {movements.length === 0 ? (
          <p className="empty">Todavía no hay nada anotado. Tocá + para agregar el primer gasto.</p>
        ) : (
          movements.slice(0, 5).map((m) => <MovementRow key={m.id} m={m} names={names} />)
        )}
      </section>
    </>
  );
}
