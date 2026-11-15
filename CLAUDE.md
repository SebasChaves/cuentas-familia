# CLAUDE.md: cómo trabajamos en Cuentas en Familia

Guía para cualquier sesión de Claude (o persona) que trabaje en este repo. Leela completa antes de tocar algo.

## Qué es

PWA para que una familia (papás + hijo) lleve lo que se deben entre todos: gastos compartidos,
préstamos y pagos, con balances y "pagos para quedar a mano". La usan **personas no técnicas desde el
celular** (sobre todo iPhone), así que la claridad y que se vea bien en móvil importan más que todo.

- App en producción: <https://sebaschaves.github.io/cuentas-familia/>
- Repo: `SebasChaves/cuentas-familia` (público)
- Firebase: proyecto `cuentas-familia-18548` (Auth con Google + Firestore, plan gratuito Spark)

## Idioma y tono

- **Todo en español de Costa Rica**: hablale al usuario en español, y los textos de la app usan
  **voseo** ("Tocá", "Anotá", "Mirá", "Vos → Papá"). Nada de "tú" ni de inglés en la interfaz.
- Montos en **colones**, enteros, con `money()` de `src/lib.js` (`₡30 000`, signo `−` real).
- Commits también en español, con un título corto y viñetas si hace falta.

## Stack y estructura

- React 18 + Vite 6 + `vite-plugin-pwa` (Workbox). JavaScript puro, sin TypeScript ni librerías de UI.
- Node 20.11 en la compu del usuario: **no subir a Vite 7** (pide Node ≥ 20.19).
- Sin router: la navegación es estado en `App.jsx` (pestañas Inicio / Historial / Familia + hoja "Nuevo movimiento").

```
src/
  main.jsx            arranque + registro del service worker (initUpdates) + <UpdatePrompt/>
  App.jsx             flujo: tutorial → login → elegir/crear familia → app; pantalla de carga
  data.js             capa de datos: Firebase o modo demo (localStorage), misma API
  firebase.js         init de Firebase con caché offline persistente
  lib.js              lógica pura: balances, settleUp (pagos mínimos), splitEqual, formato
  update.js           detección de versión nueva, versión de la app, changelog
  styles.css          todos los estilos (tokens en :root)
  components/         Tutorial, Login, GroupSetup, Home, AddSheet, History, Settings,
                      Splash, UpdatePrompt, MovementRow, Icons
public/changelog.json novedades por versión (las muestra la app)
firestore.rules       reglas de seguridad (fuente de verdad, ver abajo)
.env                  config web de Firebase (es pública por diseño, se commitea)
.env.demo             fuerza modo demo (npm run dev:demo)
```

## Comandos

```bash
npm install
npm run dev:demo     # app con datos de ejemplo, sin login: úsalo para probar UI
npm run dev          # app contra Firebase real (pide login con Google)
npm run build        # siempre antes de commitear: tiene que compilar sin errores
```

En modo demo, `http://localhost:5173/?probar-actualizacion` simula que hay una versión nueva.

## Modelo de datos (Firestore)

- `users/{uid}`: `{ groupId }`, a qué familia pertenece cada cuenta.
- `groups/{groupId}`: `{ memberUids: [uid], members: { uid: { name } }, createdAt }`.
  El `groupId` **es el código de invitación** (link `#unirse=<id>`), así que tratalo como secreto.
- `groups/{groupId}/movements/{id}`:
  `{ type: 'expense'|'loan'|'payment', amount (int), description, category, paidBy, splits: { uid: int }, date (ms), createdBy, createdAt }`

Todo movimiento se reduce a "`paidBy` puso `amount` y a cada uid de `splits` le toca su parte":
gasto = quien pagó + partes; préstamo = quien prestó + `{ quienRecibe: monto }`;
pago = quien paga + `{ quienRecibe: monto }`. Balance = lo que puso − lo que le toca
(positivo: le deben; negativo: debe). No cambies esta convención sin migrar los datos.

## Reglas de seguridad

`firestore.rules` es la fuente de verdad. Si las cambiás, hay que publicarlas en la consola
(Firestore → Reglas → Publicar) o con `npx firebase-tools deploy --only firestore:rules`;
el deploy de GitHub **no** las publica. Montos siempre enteros (`amount is int`).

## Cómo publicamos (IMPORTANTE)

Cada `git push` a `main` compila y publica en GitHub Pages (`.github/workflows/deploy.yml`, ~1 min).
Trabajamos directo en `main`.

**Todo cambio que el usuario vaya a notar es una versión nueva.** Antes de hacer push:

1. Subí la versión en `package.json` (semver: arreglo → `1.1.1`, función nueva → `1.2.0`).
2. Agregá la entrada **arriba** en `public/changelog.json`:
   ```json
   { "version": "1.2.0", "date": "AAAA-MM-DD", "title": "Título corto",
     "items": ["Frase simple en voseo de lo que cambió para la familia."] }
   ```
   Las `items` las leen los papás en el aviso de la app: en palabras simples, sin jerga técnica
   (nada de "service worker", "Firestore", "CSS"), máximo 3–4 por versión.
3. `npm run build`, commit, push. Revisá en GitHub → Actions que el deploy terminó en verde.

La app (`registerType: 'prompt'`) detecta la versión nueva al volver a abrirla o cada 30 min, muestra
el aviso con esas novedades y un botón **Actualizar ahora**; después de actualizar enseña "Esto es lo
nuevo" una sola vez. No cambies a `autoUpdate`: rompería el aviso.

## Diseño (estilo "Nocturna")

- Modo oscuro. Tokens en `:root` de `styles.css`: fondo `--bg #0E1013`, superficies `--surface`,
  verde agua `--pos #2DD4BF` (le deben / acción principal), naranja `--neg #FB923C` (debe).
- Tipografía: Space Grotesk para números grandes y títulos, Inter para texto.
- Íconos: SVG de trazo en `components/Icons.jsx`. Nada de emojis en la interfaz.
- Reusá las clases existentes (`.card`, `.btn`, `.btn-primary`, `.chip`, `.segmented`, `.eyebrow`, `.num`…)
  antes de crear estilos nuevos.

### Trampas de iPhone que ya nos mordieron

- Campos de texto con letra **< 16 px** hacen zoom al tocarlos: todos los inputs usan ≥ 16 px.
- `input[type=date]` se desborda de ancho en iOS: ya está corregido en CSS, no lo quites.
- `env(safe-area-inset-bottom)` en la PWA instalada da un margen exagerado: usá `var(--safe-b)`
  (tiene tope), no `env()` directo.
- Hojas o columnas con alto máximo: poné `flex-shrink: 0` a los hijos o se aplastan (pasó con el botón Guardar).
- Mientras la hoja está abierta se bloquea el scroll de atrás (`body.sheet-open`).

### Accesibilidad mínima

Botones reales (`<button>`), `aria-label` en botones de solo ícono, objetivos táctiles ≥ 44 px,
contraste ≥ 4.5:1, y respetar `prefers-reduced-motion`.

## Cómo verificar un cambio

1. `npm run build` sin errores.
2. `npm run dev:demo` y revisalo en vista de celular (375×812 y 320×640): que nada se salga de los lados,
   que los botones se vean completos y que los textos estén en voseo.
3. Después del push, confirmá el deploy en Actions. Lo que dependa de Firebase real (login, unirse a la
   familia, reglas) no se puede probar en demo: decíselo al usuario en vez de darlo por probado.

## Datos reales de la familia

- **Nunca** subas al repo datos de la familia (montos, correos, UIDs, el código del grupo, el Excel):
  el repo es público. Si hace falta para un script, que quede fuera del repo.
- Cambios directos en Firestore (borrar, cargar saldos, corregir montos) se hacen desde la consola de
  Firebase y **solo con confirmación explícita del usuario**, mostrándole antes qué se va a cambiar.
- La carga inicial desde el Excel del usuario se hizo como un préstamo "Saldo inicial (Excel)" por persona.

## Ideas pendientes

- Soporte para dólares (hoy todo es en colones).
- Importar movimientos desde Excel/CSV dentro de la app.
- Notificaciones push cuando alguien anota un gasto donde participás.
- Editar un movimiento (hoy solo se puede eliminar y volver a crear).
