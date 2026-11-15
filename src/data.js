// Capa de datos: Firebase (Auth + Firestore) o, si no hay configuración, modo demo en localStorage.
// Todas las funciones tienen la misma forma en ambos modos.
import { firebaseEnabled, auth, db } from './firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';

export const isDemo = !firebaseEnabled;

const firstName = (user) => (user.displayName || user.email || 'Yo').split(' ')[0];

/* ----------------------------- Modo demo ----------------------------- */

const LS_KEY = 'cf-demo-v1';
const demoListeners = new Set();
const DEMO_USER = { uid: 'demo-sebas', displayName: 'Sebas' };

function demoSeed() {
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const all = ['demo-papa', 'demo-mama', 'demo-sebas'];
  const equal = (amount) => Object.fromEntries(all.map((u) => [u, amount / 3]));
  return {
    signedIn: false,
    group: {
      id: 'DEMO',
      memberUids: all,
      members: {
        'demo-papa': { name: 'Papá' },
        'demo-mama': { name: 'Mamá' },
        'demo-sebas': { name: 'Sebas' },
      },
    },
    movements: [
      { id: 'm1', type: 'expense', amount: 30000, description: 'Súper del mes', category: 'comida', paidBy: 'demo-papa', splits: equal(30000), date: now },
      { id: 'm2', type: 'expense', amount: 24000, description: 'Recibo de luz', category: 'casa', paidBy: 'demo-mama', splits: equal(24000), date: now - day },
      { id: 'm3', type: 'loan', amount: 10000, description: 'Préstamo', category: 'otros', paidBy: 'demo-mama', splits: { 'demo-sebas': 10000 }, date: now - 3 * day },
      { id: 'm4', type: 'expense', amount: 7500, description: 'Netflix', category: 'otros', paidBy: 'demo-sebas', splits: equal(7500), date: now - 5 * day },
    ],
  };
}

function demoLoad() {
  try {
    const s = JSON.parse(localStorage.getItem(LS_KEY));
    if (s && s.group) return s;
  } catch {
    /* datos corruptos → se vuelve a sembrar */
  }
  return demoSeed();
}

function demoSave(s) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
  demoListeners.forEach((fn) => fn(s));
}

function demoWatch(select, cb) {
  const fn = (s) => cb(select(s));
  demoListeners.add(fn);
  fn(demoLoad());
  return () => demoListeners.delete(fn);
}

export function resetDemo() {
  const s = demoSeed();
  s.signedIn = true;
  demoSave(s);
}

/* ------------------------------- Auth -------------------------------- */

export function watchAuth(cb) {
  if (isDemo) return demoWatch((s) => (s.signedIn ? DEMO_USER : null), cb);
  return onAuthStateChanged(auth, cb);
}

export async function signIn() {
  if (isDemo) {
    const s = demoLoad();
    s.signedIn = true;
    return demoSave(s);
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  await signInWithPopup(auth, provider);
}

export async function signOut() {
  if (isDemo) {
    const s = demoLoad();
    s.signedIn = false;
    return demoSave(s);
  }
  await fbSignOut(auth);
}

/* ------------------------------- Grupo ------------------------------- */

// Devuelve (por callback) el id del grupo del usuario, o null si todavía no tiene.
export function watchUserGroup(uid, cb) {
  if (isDemo) return demoWatch(() => 'DEMO', cb);
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => cb(snap.exists() ? snap.data().groupId || null : null),
    () => cb(null),
  );
}

export async function createGroup(user) {
  const ref = doc(collection(db, 'groups'));
  await setDoc(ref, {
    createdAt: serverTimestamp(),
    memberUids: [user.uid],
    members: { [user.uid]: { name: firstName(user) } },
  });
  await setDoc(doc(db, 'users', user.uid), { groupId: ref.id });
  return ref.id;
}

export async function joinGroup(user, rawCode) {
  const code = rawCode.trim();
  if (!code) throw new Error('Escribí el código de la familia.');
  const ref = doc(db, 'groups', code);
  let snap;
  try {
    snap = await getDoc(ref);
  } catch {
    throw new Error('No pudimos revisar el código. ¿Hay internet?');
  }
  if (!snap.exists()) throw new Error('No encontramos ese código. Revisalo e intentá de nuevo.');
  if (!snap.data().memberUids.includes(user.uid)) {
    await updateDoc(ref, {
      memberUids: arrayUnion(user.uid),
      [`members.${user.uid}`]: { name: firstName(user) },
    });
  }
  await setDoc(doc(db, 'users', user.uid), { groupId: code });
  return code;
}

export function watchGroup(groupId, cb) {
  if (isDemo) return demoWatch((s) => s.group, cb);
  return onSnapshot(doc(db, 'groups', groupId), (snap) =>
    cb(snap.exists() ? { id: snap.id, ...snap.data() } : null),
  );
}

export async function renameMember(groupId, uid, name) {
  if (isDemo) {
    const s = demoLoad();
    s.group.members[uid] = { ...s.group.members[uid], name };
    return demoSave(s);
  }
  await updateDoc(doc(db, 'groups', groupId), { [`members.${uid}.name`]: name });
}

/* ---------------------------- Movimientos ---------------------------- */

export function watchMovements(groupId, cb) {
  if (isDemo) return demoWatch((s) => [...s.movements].sort((a, b) => b.date - a.date), cb);
  const q = query(collection(db, 'groups', groupId, 'movements'), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function addMovement(groupId, movement, user) {
  if (isDemo) {
    const s = demoLoad();
    s.movements.push({ ...movement, id: 'm' + Date.now(), createdBy: user.uid });
    return demoSave(s);
  }
  // Sin await: con la caché offline se guarda al instante y se sincroniza después.
  addDoc(collection(db, 'groups', groupId, 'movements'), {
    ...movement,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
  });
}

export async function deleteMovement(groupId, id) {
  if (isDemo) {
    const s = demoLoad();
    s.movements = s.movements.filter((m) => m.id !== id);
    return demoSave(s);
  }
  deleteDoc(doc(db, 'groups', groupId, 'movements', id));
}
