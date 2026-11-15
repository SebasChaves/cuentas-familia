# Cuentas en Familia

PWA para llevar lo que nos debemos entre todos en la familia: gastos compartidos, préstamos y pagos,
con balances en tiempo real y sugerencia de pagos mínimos para quedar a mano.

- **React + Vite**, instalable como app (PWA) y funciona sin internet.
- **Firebase**: login con Google y Firestore (con caché offline).
- **GitHub Pages**: se publica sola en cada `git push` a `main`.
- Sin configuración de Firebase (`.env` vacío) corre en **modo demo** con datos de ejemplo.

App: <https://sebaschaves.github.io/cuentas-familia/>

## Correr en local

```bash
npm install
npm run dev
```

## Firebase

- Proyecto: `cuentas-familia-18548` (login con Google + Firestore en `nam5`).
- La configuración web está en [`.env`](.env). No es secreta: los datos los protegen las
  reglas de [`firestore.rules`](firestore.rules).
- Si cambiás las reglas, pegalas en la consola (Firestore → Reglas → Publicar) o corré
  `npx firebase-tools deploy --only firestore:rules`.
- Para usar otro dominio, agregalo en Authentication → Configuración → Dominios autorizados.

## Publicar

Cada `git push` a `main` compila y publica en GitHub Pages con
[`deploy.yml`](.github/workflows/deploy.yml).

## Cómo se usa

1. La primera vez sale un tutorial (se puede volver a ver en **Familia**).
2. El primero crea la familia; en **Familia → Invitar** copia el enlace y se lo manda a los demás.
3. Cada quien entra con Google desde el enlace y queda en la misma familia.

## Cómo se calculan los balances

Todo movimiento es "alguien puso un monto y a ciertas personas les toca una parte":

| Tipo     | `paidBy`      | `splits`                       |
| -------- | ------------- | ------------------------------ |
| Gasto    | quien pagó    | la parte de cada participante  |
| Préstamo | quien prestó  | `{ quienRecibe: monto }`       |
| Pago     | quien paga    | `{ quienRecibe: monto }`       |

Balance = lo que puso − lo que le toca. Positivo: le deben. Negativo: debe.
La lógica está en [`src/lib.js`](src/lib.js).
