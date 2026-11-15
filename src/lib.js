// Lógica pura: balances, simplificación de deudas y formato.

/**
 * Cada movimiento se reduce a: `paidBy` puso `amount`, y a cada uid de `splits` le toca su parte.
 *  - Gasto:    paidBy = quien pagó,   splits = parte de cada participante.
 *  - Préstamo: paidBy = quien prestó, splits = { quienRecibe: monto }.
 *  - Pago:     paidBy = quien paga,   splits = { quienRecibe: monto }.
 * Balance positivo = le deben; negativo = debe.
 */
export function computeBalances(memberUids, movements) {
  const bal = Object.fromEntries(memberUids.map((u) => [u, 0]));
  for (const m of movements) {
    bal[m.paidBy] = (bal[m.paidBy] || 0) + m.amount;
    for (const [uid, part] of Object.entries(m.splits || {})) {
      bal[uid] = (bal[uid] || 0) - part;
    }
  }
  // Redondeo a colones enteros (las partes iguales pueden traer decimales)
  for (const u of Object.keys(bal)) bal[u] = Math.round(bal[u]);
  return bal;
}

/** Mínimos pagos para quedar a mano (algoritmo voraz: mayor deudor → mayor acreedor). */
export function settleUp(balances) {
  const debtors = [];
  const creditors = [];
  for (const [uid, v] of Object.entries(balances)) {
    if (v < -0.5) debtors.push({ uid, v: -v });
    else if (v > 0.5) creditors.push({ uid, v });
  }
  debtors.sort((a, b) => b.v - a.v);
  creditors.sort((a, b) => b.v - a.v);
  const out = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amt = Math.min(debtors[i].v, creditors[j].v);
    out.push({ from: debtors[i].uid, to: creditors[j].uid, amount: Math.round(amt) });
    debtors[i].v -= amt;
    creditors[j].v -= amt;
    if (debtors[i].v < 0.5) i++;
    if (creditors[j].v < 0.5) j++;
  }
  return out;
}

/** Divide `amount` en partes iguales enteras; el sobrante se reparte de a ₡1. */
export function splitEqual(amount, uids) {
  const base = Math.floor(amount / uids.length);
  let rest = amount - base * uids.length;
  return Object.fromEntries(uids.map((u) => [u, base + (rest-- > 0 ? 1 : 0)]));
}

export function money(n, { sign = false } = {}) {
  const abs = Math.abs(Math.round(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const s = n < 0 ? '−' : sign && n > 0 ? '+' : '';
  return `${s}₡${abs}`;
}

export function parseAmount(text) {
  const digits = String(text).replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];

export function shortDate(ms) {
  const d = new Date(ms);
  const today = new Date();
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(today) - startOf(d)) / 86400000);
  if (diff === 0) return 'hoy';
  if (diff === 1) return 'ayer';
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function toInputDate(ms) {
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function fromInputDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  const now = new Date();
  return new Date(y, m - 1, d, now.getHours(), now.getMinutes()).getTime();
}

export const CATEGORIES = [
  { id: 'comida', label: 'Comida' },
  { id: 'casa', label: 'Casa' },
  { id: 'transporte', label: 'Transporte' },
  { id: 'salud', label: 'Salud' },
  { id: 'otros', label: 'Otros' },
];
