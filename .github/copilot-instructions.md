# Regole di sviluppo FotsioMobile

Queste regole valgono per ogni modifica al progetto, soprattutto per le viste importate da un altro progetto. Prima di scrivere codice, leggere l'implementazione locale e adattare il codice alle API gia' presenti. Non copiare componenti alla cieca e non introdurre un secondo sistema per autenticazione, tema o routing.

## Stack e struttura

Il progetto e' una PWA mobile-first basata su:

- Vue 3 e Vite
- Vue Router con `createWebHashHistory`
- Pinia
- Naive UI
- Axios tramite `src/api/http.js` e `src/api/publicHttp.js`
- temi e variabili CSS in `src/theme/`

Le viste vivono in `src/views/`:

- `Home.vue`
- `Profile.vue`
- `Auth/Login.vue`
- `Auth/Register.vue`
- `Auth/JoinFamily.vue`
- `Hardware/DeviceList.vue`
- `Hardware/Domotica.vue`
- `Spesa/ShoppingList.vue`

`App.vue` deve montare il tema Naive UI, il `router-view`, le transizioni e `TabBar.vue`. Non deve montare direttamente `DemoScreen.vue`: quello e' un componente dimostrativo e non e' la schermata principale.

## BYPASS_AUTH: regola fondamentale

La configurazione e' in `src/config.js`:

```js
export const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === "true";
```

Il flag e' build-time ed e' attivo soltanto quando Vite riceve esattamente:

```env
VITE_BYPASS_AUTH=true
```

Per lavorare sulla grafica senza backend, avviare Vite con la variabile impostata, ad esempio tramite un file `.env.local` non committato:

```env
VITE_BYPASS_AUTH=true
```

Non usare direttamente `import.meta.env.VITE_BYPASS_AUTH` nei componenti o nelle viste. Il flag deve essere letto in `config.js` e la decisione demo/reale deve essere applicata dallo store o dal service responsabile.

### Demo user

Lo store `src/store/auth.js` contiene gia' `demoUser`. Non crearne copie nelle viste o nei nuovi store. La sessione demo usa:

- `id: 0`
- `nome: "Utente Demo"`
- `email: "demo@fotsio.local"`
- `codice: "DEMO"`
- `idFamiglia: 1`

Quando il bypass e' attivo:

- `login()` non deve fare richieste HTTP e deve autenticare sempre `demoUser` al click su `Accedi`;
- `init()` deve creare/mantenere la sessione demo senza leggere o validare token;
- `fetchUserInfo()` deve essere un no-op sicuro;
- `refreshAccessToken()` deve essere un no-op sicuro o mantenere la sessione demo;
- `signup()` deve simulare registrazione riuscita e autenticare localmente l'utente demo;
- le operazioni future di creazione, modifica ed eliminazione devono simulare localmente il risultato reale e non devono fallire per assenza del backend;
- le operazioni demo devono restituire dati con la stessa forma prevista dal backend quando possibile;
- nessun componente deve mostrare errori di rete causati dal fatto che il backend non e' disponibile.

Quando il bypass e' disattivo, usare il backend reale, i token in `localStorage`, il refresh token, `fetchUserInfo()` e le risposte/errori API esistenti.

`logout()` deve continuare a funzionare in entrambi i modi. Dopo il logout, il router deve poter mandare l'utente a `/login`; un nuovo click su `Accedi` deve ricreare la sessione demo quando il bypass e' attivo.

Il bootstrap deve inizializzare `authStore.init()` prima del mount dell'app, in modo che il router non valuti una sessione incompleta. Le viste devono usare `useAuthStore`, non implementare logiche duplicate per token, autenticazione o demo.

## Routing e accesso

Usare le rotte definite in `src/router/index.js` e i meta gia' presenti:

- `requiresAuth` per le pagine che richiedono autenticazione;
- `requiresFamily` per le pagine che richiedono una famiglia.

Non aggiungere controlli locali duplicati se la regola appartiene al router. I link devono usare `router-link` o il router Vue. Mantenere il comportamento di redirect a `/login`, `/join-family` e `/`.

## Tema

Il tema applicativo e' gestito dallo store `src/store/theme.js`. Il contratto corrente espone:

- `mode` (`dark` o `light`);
- `palette`;
- `isDark`;
- `applyTheme()`;
- `toggleMode()`;
- `setMode()`;
- `randomizePalette()`;
- `setPalette(name)`;
- `naiveBaseTheme`;
- `naiveThemeOverrides`.

`App.vue` deve passare al `NConfigProvider`:

```vue
<n-config-provider
  :theme="themeStore.naiveBaseTheme"
  :theme-overrides="naiveThemeOverrides"
>
```

Non forzare sempre `darkTheme` e non reintrodurre vecchi store o composable tema. `src/theme/index.css` e' l'entry point CSS globale e importa i file del tema.

Usare le variabili gia' definite:

- `--color-primary`
- `--color-primary-dark`
- `--color-bg`
- `--color-bg-soft`
- `--color-card`
- `--color-text`
- `--color-text-muted`
- `--color-danger`, `--color-danger-soft`
- `--color-success`, `--color-success-soft`
- `--color-warning`, `--color-warning-soft`
- `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`, `--space-xl`, `--space-xxl`
- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`

Non usare variabili obsolete come `--color-background`, `--color-background-gray`, `--color-text-grey` o `--color-primary-rgb`.

## Naive UI

Preferire Naive UI quando esiste un componente adatto:

- `NCard` per contenitori realmente incorniciati;
- `NForm`, `NFormItem`, `NInput` per i form;
- `NButton` per le azioni;
- `NAlert` per errori inline;
- `NModal`, `NDialog`, `NSelect`, `NSwitch`, `NCheckbox` e componenti equivalenti quando servono.

Usare `:loading`, `:disabled`, `attr-type="submit"` e le API native Naive UI invece di loader, input e button HTML personalizzati. Non aggiungere dipendenze se Naive UI copre gia' il caso.

Per `useMessage`, `useDialog`, `useNotification` e `useLoadingBar`, verificare prima che il relativo provider sia montato. Se non serve una notifica globale, preferire `NAlert` inline.

### Standardizzazione delle viste

Le viste importate da altri progetti devono usare Naive UI come sistema UI predefinito. Preferire `NCard`, `NForm`, `NFormItem`, `NInput`, `NButton`, `NAlert`, `NSelect`, `NSwitch`, `NAvatar`, `NTag`, `NPageHeader`, `NGrid`, `NSkeleton`, `NEmpty` e `NThing` quando coprono il caso.

Usare il minor CSS custom possibile. Il CSS locale deve occuparsi soltanto di composizione, layout e dettagli che Naive UI non espone. Non ricreare con HTML/CSS controlli gia' disponibili in Naive UI: niente input, button, switch, loader, card o toast custom se esiste il componente equivalente.

Non importare `http` direttamente nelle viste. Le viste devono chiamare store o service, che scelgono tra backend reale e dati demo in base a `BYPASS_AUTH`.

## Regole CSS e design

Il progetto e' un'app mobile-first: ogni vista deve essere pensata prima per telefono. Dimensioni, font, spaziature, ordine dei contenuti, touch target, tastiera, overflow e safe area devono funzionare su schermi mobili stretti prima di essere adattati a desktop. `#app` ha larghezza massima di 480px. Il CSS locale deve essere minimo e mirato a layout o dettagli che Naive UI non copre.

- Riutilizzare `spacing.css`, `typography.css`, `colors.css` e `base.css`.
- Per la tipografia usare `.testo1`, `.testo2`, `.testo3`, `.testo4` e le varianti `--muted`.
- Non scrivere `font-size` manuali nei componenti salvo necessita' eccezionale e motivata.
- Usare `--space-*` al posto di valori arbitrari per padding e margin.
- Usare `--radius-*` al posto di radius arbitrari.
- Usare variabili tema per colori e sfondi, non valori fissi.
- Evitare classi storiche non definite o non coerenti come `.ios-input`, `.btn-primary`, `.glass-effect`, `.text-grey` se non esistono nel progetto corrente.
- Garantire testo leggibile, focus visibile, label associate ai controlli e layout senza sovrapposizioni.
- Mantenere responsive il contenuto su mobile e desktop.
- Non introdurre gradienti, animazioni o decorazioni se non servono all'esperienza e non sono gia' coerenti col tema.
- Riservare spazio in fondo alle pagine per la `TabBar` fixed; non mettere questo padding nell'`Header`.

## Fake data e operazioni demo

Creare `src/data/` per le risposte simulate. Usare moduli JavaScript nominati per endpoint, con export di oggetti o array nella stessa forma del backend, ad esempio `fakeAddFamiglia.js` o `fakeDashboard.js`.

Le fake response non devono essere importate direttamente dalle viste. Lo store o il service responsabile deve:

- evitare completamente la chiamata HTTP quando `BYPASS_AUTH` e' attivo;
- restituire una risposta compatibile con quella reale;
- aggiornare lo stato locale demo per le operazioni di creazione, modifica o eliminazione;
- mantenere loading e prevenzione degli invii duplicati;
- lasciare invariato il percorso backend quando il bypass e' disattivo.

Ogni nuova vista che legge o modifica dati deve quindi avere un percorso demo esplorabile senza backend. L'assenza del backend non e' un errore in modalita' demo.

## Header condiviso

Usare `src/components/Header.vue` per l'intestazione delle viste. Il componente deve essere configurabile tramite props come `title`, `backTo`, `showBack` e `showLogout`, e tramite slot `start`/`end` per azioni specifiche.

L'Header deve usare controlli Naive UI, delegare il logout a `useAuthStore`, navigare tramite Vue Router e restare sticky durante lo scroll. Il suo CSS deve limitarsi a `position: sticky`, safe area, z-index e layout indispensabile, usando i token del tema. `TabBar.vue` resta la barra di navigazione fixed inferiore e non deve essere duplicata nelle viste.

Header e TabBar non devono coprire il contenuto su mobile; verificare sempre padding, z-index e safe area.

### Snackbar

Usare `src/components/Snackbar.vue` per i messaggi transitori. Il componente usa `NAlert` di Naive UI, viene importato localmente dalla vista che lo utilizza e non richiede `NMessageProvider`.

API prevista:

- `show`: visibilita' del messaggio;
- `message`: testo;
- `type`: `success`, `error`, `warning` o `info`;
- `title`: titolo opzionale;
- `duration`: chiusura automatica in millisecondi, `0` per non chiudere;
- `closable`: abilita la chiusura manuale;
- evento `close` quando il messaggio viene chiuso.

Lo Snackbar deve comparire in alto, sotto l'area dell'Header e sopra il contenuto, mai in fondo vicino alla TabBar. Deve gestire internamente il proprio timer e usare safe area, z-index e larghezza mobile. Per errori persistenti dentro la pagina usare invece `NAlert` inline. Non creare toast custom, `alert()` o timer nelle viste.

## Toggle tema e palette

In Profilo, il toggle deve chiamare `themeStore.toggleMode()`: cambia tra light e dark mantenendo la palette selezionata tramite lo stesso `name` nei due pool.

Un selettore separato deve offrire le palette disponibili e l'opzione `CAMBIA SEMPRE`. Una palette specifica cambia solo palette e mantiene la modalita' corrente; il toggle light/dark mantiene lo stesso nome usando la controparte nell'altro pool. Con `CAMBIA SEMPRE`, ogni cambio di modalita' sceglie una nuova palette casuale dal pool della nuova modalita'. La preferenza deve essere gestita e persistita dallo store tema, non dalla vista. Se viene aggiunta una palette, inserirla sia nel pool `light` sia nel pool `dark` con lo stesso `name` e valori adatti al contrasto della modalita'.

Il tema Naive UI deve seguire sempre `themeStore.naiveBaseTheme` e `themeStore.naiveThemeOverrides`. Non forzare `darkTheme` nei componenti o nella shell.

## Componenti importati da altri progetti

Per ogni vista importata:

1. leggere store, router, API, tema e componenti locali prima di adattare il template;
2. sostituire import e API inesistenti con quelli presenti in questo progetto;
3. mantenere la logica di dominio gia' compatibile, ma spostare auth, bypass e chiamate nel relativo store/service;
4. usare Naive UI per i controlli standard;
5. usare il percorso demo locale quando `BYPASS_AUTH` e' attivo;
6. lasciare il percorso backend reale quando il bypass e' disattivo;
7. non importare direttamente un vecchio store tema o un vecchio componente di layout;
8. non modificare file non necessari e non fare refactoring generale durante una migrazione singola.

## Gestione stato, loading ed errori

Ogni operazione asincrona deve avere uno stato loading prevedibile e non deve permettere invii duplicati. Gli errori backend devono avere un fallback leggibile. In modalita' demo, l'assenza del backend non e' un errore: la UI deve ricevere dati simulati e poter essere esplorata normalmente.

Preferire errori inline con Naive UI. Non usare `alert()` del browser. Non nascondere errori reali quando il bypass e' disattivo.

## Domotica e tapparelle

`src/views/Hardware/DeviceList.vue` e' la vista legacy di riferimento e deve restare invariata quando si realizza la nuova esperienza. La pagina principale per la domotica e' `src/views/Hardware/Domotica.vue` sulla rotta `/domotica`; il vecchio percorso `/hardware` puo' reindirizzare alla nuova pagina.

La nuova vista deve gestire quattro tapparelle con Naive UI e CSS minimo:

- `Alza` usando il comando backend `open`;
- `Abbassa` usando `close`;
- `Stop` usando `stop`;
- posizione al `50%`;
- comando `Fessure aperte`;
- `Apri tutto` e `Chiudi tutto`.

Gli endpoint gia' compatibili sono:

- `GET /api/hardware/status`;
- `GET /api/hardware/devices`;
- `POST /api/hardware/cover` con `{ deviceId, coverId, command }`.

I payload per posizione e fessure non sono ancora garantiti dal backend: devono essere costruiti in un adapter del service hardware, mai nella vista, cosi' da poterli cambiare in un solo punto.

Creare fake response in `src/data/` e gestire backend/fake in `src/services/hardware.js`. Con `BYPASS_AUTH=true` non devono partire richieste HTTP: status, quattro tapparelle, comandi e aggiornamento locale devono essere simulati.

Per `Apri tutto` e `Chiudi tutto` usare `Promise.allSettled`, non `Promise.all`, e mostrare un risultato aggregato per successo completo, parziale o totale fallimento.

Tutti gli errori oggi presenti in `DeviceList.vue` devono essere riprodotti nella nuova vista tramite `Snackbar.vue` in alto sotto l'Header: errori di caricamento, errori di rete, `success: false`, messaggi backend e fallimenti dei comandi globali. In bypass l'assenza del backend non e' un errore.

## Verifiche obbligatorie

Dopo ogni modifica significativa:

1. eseguire `npm run build`;
2. controllare diagnostiche e import non risolti;
3. cercare riferimenti a store, variabili CSS o componenti rimossi;
4. verificare il percorso con `VITE_BYPASS_AUTH=true` senza backend;
5. verificare il percorso con `VITE_BYPASS_AUTH=false` quando sono disponibili API e token;
6. verificare login, logout, redirect, rotte protette e famiglia;
7. verificare loading, errori, submit da tastiera e responsive layout;
8. verificare che Naive UI usi tema base e override provenienti dallo store.
9. verificare che Login, Register, JoinFamily e ogni vista rifatta non importino direttamente `http` e non effettuino chiamate quando `VITE_BYPASS_AUTH=true`;
10. verificare Header sticky, TabBar fixed, safe area e assenza di sovrapposizioni;
11. verificare toggle light/dark e selezione palette mantenendo la coppia light/dark.
12. verificare Domotica con quattro tapparelle, comandi singoli, 50%, `Fessure aperte`, `Apri tutto`, `Chiudi tutto`, errori nello Snackbar e nessuna chiamata HTTP in bypass.

Comandi principali:

```bash
yarn
yarn dev
yarn build
yarn preview
```

Non committare file `.env.local` o segreti. Non creare commit o branch senza richiesta esplicita.

## Contratti operativi da mantenere

Questa sezione completa le regole precedenti con il comportamento attualmente
presente nel repository. In caso di divergenza, il codice locale e i contratti
API documentati qui devono essere verificati prima di introdurre nuove
astrazioni.

### Bootstrap e ciclo di vita

- `src/main.js` crea l'app Vue, installa Pinia e il router, importa
  `src/theme/index.css`, quindi esegue `useAuthStore().init()` prima di
  `app.mount("#app")`.
- Non montare l'app prima del completamento di `authStore.init()`: il router
  deve valutare i guard con una sessione gia' coerente.
- `App.vue` inizializza il tema in `onMounted`, esegue il controllo versione e
  monta sempre `router-view` e `TabBar`.
- Il controllo versione legge `/version.json` con cache disabilitata e salva
  `app_version` in `localStorage`; non cancellare lo storage durante
  l'aggiornamento, per non eliminare i token.

### Configurazione e storage

- `src/config.js` e' l'unico punto che legge `import.meta.env`.
- `API_URL` e' l'URL base del backend; non duplicarlo nei componenti.
- Le chiavi auth sono `accessToken` e `refreshToken`.
- Le chiavi tema sono `theme-mode` e `theme-palette`.
- Il flag bypass e' valutato a build-time: cambiare `.env.local` richiede il
  riavvio di Vite e una nuova build per verificare il bundle.
- Non mettere token, URL con credenziali o dati personali nei fake data,
  nei log o nella documentazione.

### Autenticazione: flusso reale

`useAuthStore` espone `user`, `accessToken`, `refreshToken`,
`isAuthenticated`, `hasFamily`, `loading` e `isBypassEnabled`.

- Login reale: `POST /api/auth/Login` su `publicHttp` con
  `{ user: username, password }`; la risposta deve contenere `accessToken` e,
  se disponibile, `refreshToken`.
- Dopo il login i token vengono salvati nello store e in `localStorage`, poi
  viene chiamato `fetchUserInfo()`.
- `fetchUserInfo()` decodifica il token per ottenere `id`/`nameid`/`sub` e
  chiama `POST /api/user/UserInfo` su `http` con `{ id }`.
- `hasFamily` e' vero solo quando `user.idFamiglia` e' valorizzato e maggiore
  di zero.
- `refreshAccessToken()` usa `POST /api/auth/RefreshToken` con
  `{ refreshToken }`; la risposta attesa contiene `newToken`.
- Un refresh mancante o scaduto esegue `logout()`.
- `http.js` aggiunge l'header Bearer, tenta il refresh prima di una richiesta
  con access token scaduto e ritenta una sola volta dopo una risposta 401.
- Gli errori reali devono essere propagati alla vista, che deve mostrare un
  messaggio leggibile senza nascondere il problema.

### Autenticazione: flusso bypass

Con `VITE_BYPASS_AUTH=true`:

- non leggere, validare, rinnovare o inviare token;
- `init()` chiama `ensureDemoSession()`;
- `login()` autentica `demoUser` indipendentemente dai valori inseriti;
- `signup()` simula il successo e autentica `demoUser`;
- `fetchUserInfo()` e `refreshAccessToken()` sono no-op sicuri;
- `logout()` azzera comunque lo stato, cosi' un nuovo click su Accedi
  ricrea la sessione;
- nessun service o vista deve chiamare Axios prima di scegliere il percorso
  fake.

La forma di `demoUser` non va duplicata:
`{ id: 0, nome: "Utente Demo", email: "demo@fotsio.local", codice: "DEMO",
idFamiglia: 1 }`.

### Routing e destinazioni

| Rotta | Nome | Accesso | Comportamento |
| --- | --- | --- | --- |
| `/` | `Home` | auth + famiglia | riepilogo e agenda |
| `/join-family` | `JoinFamily` | auth | scelta unione/creazione famiglia |
| `/login` | `Login` | pubblico | accesso; autenticato -> `/` |
| `/register` | `Register` | pubblico | registrazione; autenticato -> `/` |
| `/hardware` | `Hardware` | auth + famiglia | redirect a `/domotica` |
| `/domotica` | `Domotica` | auth + famiglia | controllo tapparelle |
| `/spesa` | `Spesa` | auth + famiglia | finanze/spese ricorrenti |
| `/profile` | `Profile` | auth | profilo, famiglia, tema |

I guard in `src/router/index.js` sono l'unica fonte per redirect di
autenticazione e famiglia. Le viste non devono replicare questi controlli.

### Client HTTP e servizi

- `src/api/publicHttp.js` usa Axios senza header di autorizzazione e restituisce
  `response.data`; va usato per login, signup e refresh.
- `src/api/http.js` aggiunge l'autorizzazione Bearer e restituisce
  `response.data`; va usato per endpoint protetti.
- Le viste devono chiamare `src/services/`, mai `http` o `publicHttp`.
- Un service deve costruire il payload una sola volta, scegliere il ramo
  bypass/backend e mantenere la stessa forma di risposta.
- Non usare `Promise.all` per operazioni globali dove un singolo fallimento non
  deve annullare gli altri risultati: usare `Promise.allSettled`.

Endpoint e payload attualmente previsti:

| Service | Metodo e endpoint | Payload/risposta |
| --- | --- | --- |
| auth | `POST /api/auth/Login` | `{ user, password }` -> token |
| auth | `POST /api/auth/SignUp` | `{ user, password, email }` |
| auth | `POST /api/auth/RefreshToken` | `{ refreshToken }` -> `newToken` |
| auth | `POST /api/user/UserInfo` | `{ id }` -> utente |
| dashboard | `POST /api/user/dashboard` | `{ familyId, userId }` -> totali |
| dashboard | `POST /api/spesa/get_lista_spese_ricorrente` | `{ idFamiglia, idUtente }` -> array |
| family | `POST /api/auth/AddUtenteFamiglia` | `{ codiceFamiglia, idUtente }` -> `{ result }` |
| family | `POST /api/auth/AddFamiglia` | `{ nome, descrizione, idUtente }` -> `{ result }` |
| hardware | `GET /api/hardware/status` | `{ status }` |
| hardware | `GET /api/hardware/devices` | `{ success, devices, message? }` |
| hardware | `POST /api/hardware/cover` | `{ deviceId, coverId, command, ...options }` |
| spesa | `POST /api/spesa/add_spesa_ricorrente` | payload spesa completo |

### Fake API e stato demo

I fake module sono in `src/data/` e non devono essere importati dalle viste.

- `fakeDashboard.js`: totali `totalRecurring`, `totalOther`,
  `totalExpenses`.
- `fakeRecurringExpenses.js`: array con `id`, `descrizione`, `importo`.
- `fakeAddFamiglia.js` e `fakeAddUtenteFamiglia.js`: `{ result: true }`.
- `fakeHardwareStatus.js`: `{ status: "connected" }`.
- `fakeHardwareDevices.js`: quattro dispositivi persistenti in memoria con
  `deviceId`, `coverId`, `nome`, `attivo`, `position`, `slatsOpen`;
  `updateFakeHardwareDevice()` aggiorna i comandi tra una navigazione e l'altra
  durante la sessione.
- `fakeHardwareCover.js`: `{ success: true, command, ...options,
  message: "Comando eseguito" }`.

Per ogni nuova fake API:

1. clonare i dati restituiti per evitare mutazioni impreviste;
2. aggiornare lo stato demo per create/update/delete;
3. restituire i campi che la vista riceverebbe dal backend;
4. non simulare errori di rete come comportamento normale;
5. mantenere loading e blocco del doppio submit.

### Pagine e responsabilita'

- `Login.vue`: usa `NForm`, valida campi solo nel percorso reale, chiama
  `authStore.login` e naviga a `/`; gli errori sono in `Snackbar`.
- `Register.vue`: valida campi obbligatori nel percorso reale e conferma
  password sempre, chiama `signup` e naviga a `/`.
- `JoinFamily.vue`: mostra scelta iniziale, poi unione con codice o creazione
  con nome/descrizione; controlla `{ result: true }` prima di `/`.
- `Home.vue`: carica dashboard e ricorrenti tramite service, mostra skeleton,
  totali in EUR, quick actions e agenda; errori persistenti in `NAlert`.
- `Profile.vue`: mostra dati utente/famiglia e usa esclusivamente il theme
  store per switch e selettore palette.
- `Domotica.vue`: carica status e dispositivi, comandi singoli (`open`,
  `stop`, `close`, `position`, `open_slats`), comandi globali e Snackbar.
- `ShoppingList.vue`: e' ancora una vista legacy: usa direttamente `http`,
  controlli HTML e variabili CSS obsolete. Prima di estenderla va migrata a
  service/fake API e Naive UI; non usare questo codice come modello.
- `DeviceList.vue`: e' legacy di riferimento e non va modificata durante la
  migrazione di Domotica.

Nota di compatibilita': il fake delle spese restituisce `importo`, mentre la
vista legacy visualizza `prezzo`. Un eventuale service spese deve normalizzare
esplicitamente il modello, senza correggere il problema in modo implicito
nella vista.

### Domotica: contratto dettagliato

I comandi posizione e fessure devono passare sempre da
`services/hardware.js`: la vista non decide il payload backend. Oggi:

- `setCoverPosition(device, percentage)` invia `command: "position"` e
  `{ position: percentage }`;
- `openCoverSlats(device)` invia `command: "open_slats"`;
- `open` porta la posizione a 100, `close` a 0; `stop` non modifica la
  posizione simulata.

La vista deve disabilitare dispositivi non attivi e comandi concorrenti.
`Apri tutto` e `Chiudi tutto` devono distinguere successo completo, parziale e
fallimento totale, aggiornando solo i dispositivi riusciti e mostrando il
risultato in `Snackbar`.

### Regole di verifica prima della consegna

Eseguire almeno:

1. `yarn build` (oppure `npm run build` se il progetto viene eseguito con npm);
2. controllo diagnostiche/import e ricerca di variabili o componenti rimossi;
3. avvio senza backend con `.env.local` contenente esattamente
   `VITE_BYPASS_AUTH=true`;
4. verifica login, logout, refresh pagina, redirect auth/famiglia e ritorno
   dopo registrazione;
5. verifica tema, persistenza di mode/palette e responsive mobile;
6. verifica loading, submit da tastiera, errori inline/Snackbar e TabBar;
7. verifica Domotica: quattro tapparelle, comandi singoli, 50%, fessure,
   comandi globali e nessuna richiesta HTTP in bypass;
8. con backend disponibile, ripetere il percorso con
   `VITE_BYPASS_AUTH=false` e verificare token/401/refresh.
