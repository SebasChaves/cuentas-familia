import { useEffect, useRef, useState } from 'react';
import { IconClose } from './Icons';
import { CATEGORIES, money, parseAmount, splitEqual, toInputDate, fromInputDate } from '../lib';

const TYPES = [
  { id: 'expense', label: 'Gasto' },
  { id: 'loan', label: 'Préstamo' },
  { id: 'payment', label: 'Pago' },
];

const LABELS = {
  expense: { payer: '¿Quién pagó?' },
  loan: { payer: '¿Quién prestó?', to: '¿A quién le prestó?' },
  payment: { payer: '¿Quién pagó?', to: '¿A quién le pagó?' },
};

function PeoplePicker({ uids, names, value, onChange, exclude, label }) {
  return (
    <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
      <legend className="eyebrow" style={{ marginBottom: 10 }}>
        {label}
      </legend>
      <div className="people">
        {uids
          .filter((u) => u !== exclude)
          .map((u) => (
            <button type="button" key={u} className="person" aria-pressed={value === u} onClick={() => onChange(u)}>
              <span className="avatar">{(names[u] || '?').slice(0, 1).toUpperCase()}</span>
              {names[u]}
            </button>
          ))}
      </div>
    </fieldset>
  );
}

export default function AddSheet({ user, group, names, prefill, onClose, onSave }) {
  const uids = group.memberUids;
  const [type, setType] = useState(prefill.type || 'expense');
  const [amountText, setAmountText] = useState(prefill.amount ? money(prefill.amount) : '');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('comida');
  const [paidBy, setPaidBy] = useState(prefill.paidBy || user.uid);
  const [to, setTo] = useState(prefill.to || uids.find((u) => u !== user.uid) || '');
  const [participants, setParticipants] = useState(uids);
  const [mode, setMode] = useState('equal');
  const [exact, setExact] = useState({});
  const [date, setDate] = useState(toInputDate(Date.now()));
  const [error, setError] = useState('');
  const amountRef = useRef(null);

  const amount = parseAmount(amountText);

  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Bloquea el scroll de la página de atrás mientras la hoja está abierta
  useEffect(() => {
    document.body.classList.add('sheet-open');
    return () => document.body.classList.remove('sheet-open');
  }, []);

  useEffect(() => {
    // En compu enfoca el monto; en celular no, para que el teclado no salte y mueva la hoja
    const finePointer = window.matchMedia?.('(pointer: fine)').matches;
    if (!prefill.amount && finePointer) amountRef.current?.focus({ preventScroll: true });
    const onKey = (e) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prefill.amount]);

  // Si "a quién" quedó igual que quien pagó, mover al siguiente
  useEffect(() => {
    if (type !== 'expense' && to === paidBy) setTo(uids.find((u) => u !== paidBy) || '');
  }, [type, paidBy, to, uids]);

  const toggle = (u) =>
    setParticipants((p) => (p.includes(u) ? p.filter((x) => x !== u) : uids.filter((x) => x === u || p.includes(x))));

  const equalParts = participants.length ? splitEqual(amount, participants) : {};
  const exactSum = participants.reduce((s, u) => s + (exact[u] || 0), 0);

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!amount) return setError('Poné un monto mayor a cero.');
    let splits;
    if (type === 'expense') {
      if (!participants.length) return setError('Elegí al menos una persona para dividir.');
      if (mode === 'equal') splits = equalParts;
      else {
        if (exactSum !== amount)
          return setError(`Los montos suman ${money(exactSum)} y el total es ${money(amount)}.`);
        splits = Object.fromEntries(participants.map((u) => [u, exact[u] || 0]).filter(([, v]) => v > 0));
      }
    } else {
      if (!to || to === paidBy) return setError('Elegí a otra persona.');
      splits = { [to]: amount };
    }
    onSave({
      type,
      amount,
      description: type === 'payment' ? '' : description.trim(),
      category: type === 'expense' ? category : 'otros',
      paidBy,
      splits,
      date: fromInputDate(date),
    });
  };

  return (
    <div className="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" onSubmit={submit}>
        <div className="grabber" />
        <div className="between">
          <h2 id="sheet-title" className="title">
            Nuevo movimiento
          </h2>
          <button type="button" className="icon-btn" aria-label="Cerrar" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <div className="segmented" role="group" aria-label="Tipo de movimiento">
          {TYPES.map((t) => (
            <button type="button" key={t.id} aria-pressed={type === t.id} onClick={() => setType(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="stack" style={{ gap: 4 }}>
          <label htmlFor="monto" className="eyebrow">
            Monto
          </label>
          <input
            id="monto"
            ref={amountRef}
            className="amount-input"
            inputMode="numeric"
            autoComplete="off"
            placeholder="₡0"
            value={amountText}
            onChange={(e) => {
              const n = parseAmount(e.target.value);
              setAmountText(n ? money(n) : '');
            }}
          />
        </div>

        {type !== 'payment' && (
          <div className="stack" style={{ gap: 4 }}>
            <label htmlFor="concepto" className="eyebrow">
              Concepto
            </label>
            <input
              id="concepto"
              className="field"
              placeholder={type === 'loan' ? 'Para qué fue (opcional)' : 'Súper, luz, gasolina…'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={60}
            />
          </div>
        )}

        <PeoplePicker uids={uids} names={names} value={paidBy} onChange={setPaidBy} label={LABELS[type].payer} />

        {type !== 'expense' && (
          <PeoplePicker uids={uids} names={names} value={to} onChange={setTo} exclude={paidBy} label={LABELS[type].to} />
        )}

        {type === 'expense' && (
          <>
            <div className="stack" style={{ gap: 10 }}>
              <div className="between">
                <span className="eyebrow">Dividir entre</span>
                <div className="segmented" role="group" aria-label="Forma de dividir" style={{ width: 200 }}>
                  <button type="button" aria-pressed={mode === 'equal'} onClick={() => setMode('equal')}>
                    Iguales
                  </button>
                  <button type="button" aria-pressed={mode === 'exact'} onClick={() => setMode('exact')}>
                    Montos
                  </button>
                </div>
              </div>
              <div className="card" style={{ padding: '4px 16px', gap: 0, background: 'var(--bg)' }}>
                {uids.map((u) => {
                  const on = participants.includes(u);
                  return (
                    <div className="check-row" key={u}>
                      <label>
                        <input type="checkbox" checked={on} onChange={() => toggle(u)} />
                        {names[u]}
                      </label>
                      {on && mode === 'equal' && <span className="num muted">{money(equalParts[u] || 0)}</span>}
                      {on && mode === 'exact' && (
                        <input
                          className="field field-sm"
                          inputMode="numeric"
                          aria-label={`Monto de ${names[u]}`}
                          placeholder="₡0"
                          value={exact[u] ? money(exact[u]) : ''}
                          onChange={(e) => setExact((x) => ({ ...x, [u]: parseAmount(e.target.value) }))}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              {mode === 'exact' && amount > 0 && (
                <span className={exactSum === amount ? 'muted' : 'neg'} style={{ fontSize: 13 }}>
                  {exactSum === amount
                    ? 'Los montos cuadran con el total.'
                    : `Faltan ${money(amount - exactSum)} por repartir.`}
                </span>
              )}
            </div>

            <div className="stack" style={{ gap: 10 }}>
              <span className="eyebrow">Categoría</span>
              <div className="chips" role="group" aria-label="Categoría">
                {CATEGORIES.map((c) => (
                  <button type="button" key={c.id} className="chip" aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="stack" style={{ gap: 4 }}>
          <label htmlFor="fecha" className="eyebrow">
            Fecha
          </label>
          <input id="fecha" type="date" className="field" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={!amount}>
          Guardar
        </button>
      </form>
    </div>
  );
}
