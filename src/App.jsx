import { useEffect, useMemo, useState } from 'react';
import {
  watchAuth,
  watchUserGroup,
  watchGroup,
  watchMovements,
  addMovement,
  deleteMovement,
  isDemo,
} from './data';
import { computeBalances } from './lib';
import Tutorial from './components/Tutorial';
import Login from './components/Login';
import GroupSetup from './components/GroupSetup';
import Home from './components/Home';
import History from './components/History';
import Settings from './components/Settings';
import AddSheet from './components/AddSheet';
import Splash from './components/Splash';
import { IconHome, IconList, IconPlus, IconUser, IconWifiOff } from './components/Icons';

const TUTORIAL_KEY = 'cf-tutorial-visto';

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

export default function App() {
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem(TUTORIAL_KEY));
  const [user, setUser] = useState(undefined); // undefined = cargando
  const [groupId, setGroupId] = useState(undefined);
  const [group, setGroup] = useState(null);
  const [movements, setMovements] = useState([]);
  const [tab, setTab] = useState('home');
  const [sheet, setSheet] = useState(null); // null | {} | prefill
  const [toast, setToast] = useState('');
  const online = useOnline();
  // La pantalla de carga se muestra al menos un momento para que la animación no parpadee
  const [minTimeDone, setMinTimeDone] = useState(false);
  const [splashGone, setSplashGone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTimeDone(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => watchAuth((u) => setUser(u || null)), []);

  useEffect(() => {
    if (!user) return setGroupId(undefined);
    return watchUserGroup(user.uid, setGroupId);
  }, [user]);

  useEffect(() => {
    if (!groupId) return setGroup(null);
    const a = watchGroup(groupId, setGroup);
    const b = watchMovements(groupId, setMovements);
    return () => {
      a();
      b();
    };
  }, [groupId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const balances = useMemo(
    () => (group ? computeBalances(group.memberUids, movements) : {}),
    [group, movements],
  );

  const loadingNow =
    !showTutorial && (user === undefined || (user && groupId === undefined) || (groupId && !group));
  useEffect(() => {
    if (!minTimeDone || loadingNow || splashGone) return;
    const t = setTimeout(() => setSplashGone(true), 350); // duración del fundido
    return () => clearTimeout(t);
  }, [minTimeDone, loadingNow, splashGone]);

  const finishTutorial = () => {
    localStorage.setItem(TUTORIAL_KEY, '1');
    setShowTutorial(false);
  };

  const loading = loadingNow;
  const hideSplash = minTimeDone && !loading;
  const splash = (!splashGone || loading) && <Splash leaving={hideSplash} />;

  if (showTutorial) return (
    <>
      <Tutorial onDone={finishTutorial} />
      {splash}
    </>
  );
  if (loading) return splash;
  if (!user) return (
    <>
      <Login />
      {splash}
    </>
  );
  if (!groupId) return (
    <>
      <GroupSetup user={user} />
      {splash}
    </>
  );

  const names = Object.fromEntries(
    group.memberUids.map((u) => [u, group.members?.[u]?.name || 'Alguien']),
  );

  const ctx = { user, group, names, movements, balances };

  const save = async (m) => {
    await addMovement(group.id, m, user);
    setSheet(null);
    setToast(m.type === 'payment' ? 'Pago registrado' : 'Guardado');
  };

  const remove = async (id) => {
    await deleteMovement(group.id, id);
    setToast('Eliminado');
  };

  return (
    <>
      <main className="app">
        {isDemo && (
          <div className="banner" role="note">
            Modo demo: los datos se guardan solo en este navegador. Configurá Firebase para
            compartirlos con la familia.
          </div>
        )}
        {!online && (
          <div className="banner" role="status">
            <IconWifiOff size={18} /> Sin internet. Lo que anotés se sincroniza al volver la conexión.
          </div>
        )}
        {tab === 'home' && (
          <Home {...ctx} onSettle={(p) => setSheet(p)} onSeeAll={() => setTab('history')} />
        )}
        {tab === 'history' && <History {...ctx} onDelete={remove} />}
        {tab === 'settings' && (
          <Settings {...ctx} onTutorial={() => setShowTutorial(true)} notify={setToast} />
        )}
      </main>

      <nav className="nav" aria-label="Principal">
        <div className="nav-inner">
          <button className="nav-item" aria-current={tab === 'home' ? 'page' : undefined} onClick={() => setTab('home')}>
            <IconHome size={22} />
            Inicio
          </button>
          <button className="nav-item" aria-current={tab === 'history' ? 'page' : undefined} onClick={() => setTab('history')}>
            <IconList size={22} />
            Historial
          </button>
          <div className="nav-add">
            <button aria-label="Nuevo movimiento" onClick={() => setSheet({})}>
              <IconPlus size={26} />
            </button>
          </div>
          <button className="nav-item" aria-current={tab === 'settings' ? 'page' : undefined} onClick={() => setTab('settings')}>
            <IconUser size={22} />
            Familia
          </button>
        </div>
      </nav>

      {sheet && <AddSheet {...ctx} prefill={sheet} onClose={() => setSheet(null)} onSave={save} />}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      {splash}
    </>
  );
}
