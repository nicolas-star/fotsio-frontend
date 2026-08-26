# FotsioMobile - guida tecnica allo sviluppo

Documento operativo per continuare lo sviluppo senza introdurre un secondo
sistema di autenticazione, routing, tema o accesso alle API.

## 1. Avvio

```bash
yarn
yarn dev
yarn build
yarn preview
```

Per lavorare senza backend creare localmente `.env.local` (non committarlo):

```env
VITE_BYPASS_AUTH=true
```

Per le API reali usare `VITE_BYPASS_AUTH=false`. La variabile e' incorporata
da Vite: riavviare il dev server dopo ogni modifica.

## 2. Architettura

```text
src/main.js
  -> Pinia + router + authStore.init()
  -> App.vue
     -> themeStore.applyTheme()
     -> router-view + TabBar
views
  -> services
     -> BYPASS_AUTH ? src/data/fake*.js : src/api/http*.js
```

Le viste gestiscono presentazione, loading e messaggi. I service gestiscono
payload, scelta backend/fake e normalizzazione delle risposte.

## 3. Tema e stile

`src/theme/index.css` importa reset, colori di stato, spaziature e tipografia.
Il tema runtime e' applicato da `src/store/theme.js` su `document.documentElement`
e passato a Naive UI da `App.vue`.

Token ammessi:

- Colori: `--color-primary`, `--color-primary-dark`, `--color-bg`,
  `--color-bg-soft`, `--color-card`, `--color-text`, `--color-text-muted`,
  `--color-danger*`, `--color-success*`, `--color-warning*`.
- Spazi: `--space-xs` ... `--space-xxl`.
- Raggi: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`.
- Tipografia: `.testo1`, `.testo2`, `.testo3`, `.testo4` e varianti
  `--muted`.

Non usare variabili storiche (`--color-background`, `--color-text-grey`,
`--color-primary-rgb`) ne' controlli HTML custom quando Naive UI offre
`NButton`, `NInput`, `NForm`, `NCard`, `NSwitch`, `NSelect`, `NAlert`,
`NModal`, `NSkeleton`, `NEmpty` o componenti equivalenti.

`#app` e' mobile-first e limitato a 480px. Ogni pagina deve lasciare spazio
alla `TabBar` fixed, rispettare safe area, focus visibile e target touch.
`Header.vue` e' sticky; `Snackbar.vue` appare in alto sotto l'header.

## 4. Autenticazione e routing

La sessione reale usa `accessToken`/`refreshToken` in `localStorage`.
`publicHttp` e' per login/signup/refresh; `http` aggiunge Bearer, gestisce
token scaduto e ritenta una risposta 401 una sola volta.

In bypass la sessione e' sempre:

```js
{
  id: 0,
  nome: "Utente Demo",
  email: "demo@fotsio.local",
  codice: "DEMO",
  idFamiglia: 1
}
```

Non creare copie dell'utente demo. Usare `useAuthStore()` in tutte le viste.
I guard del router usano `requiresAuth` e `requiresFamily` e reindirizzano a
`/login`, `/join-family` o `/`.

## 5. Contratti API

| Operazione | Endpoint | Dati principali |
| --- | --- | --- |
| Login | `POST /api/auth/Login` | `user`, `password`; ritorna token |
| Registrazione | `POST /api/auth/SignUp` | `user`, `password`, `email` |
| Refresh | `POST /api/auth/RefreshToken` | `refreshToken`; ritorna `newToken` |
| Utente | `POST /api/user/UserInfo` | `id` |
| Dashboard | `POST /api/user/dashboard` | `familyId`, `userId` |
| Spese ricorrenti | `POST /api/spesa/get_lista_spese_ricorrente` | `idFamiglia`, `idUtente` |
| Crea spesa | `POST /api/spesa/add_spesa_ricorrente` | dati spesa + famiglia/utente |
| Unisci famiglia | `POST /api/auth/AddUtenteFamiglia` | `codiceFamiglia`, `idUtente` |
| Crea famiglia | `POST /api/auth/AddFamiglia` | `nome`, `descrizione`, `idUtente` |
| Stato hardware | `GET /api/hardware/status` | `status` |
| Dispositivi | `GET /api/hardware/devices` | `success`, `devices` |
| Tapparella | `POST /api/hardware/cover` | `deviceId`, `coverId`, `command` |

Le viste non importano Axios. Nuovi endpoint richiedono un service e un fake
response compatibile prima di essere collegati al template.

## 6. Fake API disponibili

I moduli in `src/data/` simulano dashboard, spese ricorrenti, famiglie e
hardware. I fake hardware mantengono in memoria quattro tapparelle:
Soggiorno, Cucina, Camera e Studio. I comandi aggiornano posizione e stato
lamelle localmente e ritornano `{ success: true, message, command }`.

Le fake response non devono essere importate direttamente dalle viste e
l'assenza del backend non deve produrre errori in bypass. Per create/update/
delete aggiornare anche la collezione fake, mantenendo la forma del backend.

## 7. Pagine

- **Login**: `NForm` con username/password, `Snackbar` per errori, redirect a
  `/` dopo `login`.
- **Register**: username/email/password/conferma, `signup`, redirect a `/`.
- **JoinFamily**: unione tramite codice oppure creazione famiglia; richiede
  `result: true`.
- **Home**: dashboard, ricorrenti, totale EUR, quick actions, agenda e
  skeleton/error alert.
- **Profile**: utente, famiglia e preferenze tema. Il toggle chiama
  `themeStore.toggleMode()`, il selettore chiama `setPalettePreference()`.
- **Domotica**: stato MQTT, quattro dispositivi, slider, `Alza`, `Stop`,
  `Abbassa`, 50%, `Fessure aperte`, `Apri tutto`, `Chiudi tutto`.
- **Spesa**: attualmente legacy e da migrare; non estenderla copiando il
  pattern di import diretto di `http` o i controlli HTML.
- **DeviceList**: legacy; deve restare invariata durante l'evoluzione di
  Domotica.

## 8. Checklist di una nuova feature

1. Leggere store, router, service, tema e componenti locali.
2. Definire forma backend e fake nella stessa struttura.
3. Implementare la scelta `BYPASS_AUTH` nel service.
4. Usare Naive UI e token CSS esistenti.
5. Gestire loading, disabilitazione e prevenzione doppio submit.
6. Propagare errori reali con fallback leggibile.
7. Verificare bypass senza richieste HTTP e percorso reale con token.
8. Eseguire `yarn build` e controllare diagnostiche/import.
9. Verificare mobile, safe area, Header sticky e TabBar fixed.

## 9. Debito tecnico noto

- `ShoppingList.vue` usa ancora API dirette, HTML custom e variabili CSS
  obsolete.
- Il modello fake spese usa `importo`, mentre la vista legacy usa `prezzo`;
  la normalizzazione deve stare nel futuro service.
- Alcuni stili legacy usano dimensioni e raggi manuali: non replicarli nelle
  nuove viste.
- Il backend non garantisce ancora i payload per posizione e fessure:
  modificarli solo nell'adapter `services/hardware.js`.
