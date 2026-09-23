# Piano di sviluppo: resilienza PWA, rete e cache-busting

## Obiettivo

Rendere FotsioMobile più affidabile su iOS/PWA quando la rete è instabile, il service worker serve asset obsoleti o una richiesta al backend fallisce.

Il lavoro deve aggiungere:

- service worker con strategia network-first e timeout breve;
- retry automatici controllati su Axios e fetch;
- fallback UI visibile quando il server non è raggiungibile;
- cache-busting affidabile per evitare asset vecchi su iOS;
- aggiornamento coordinato tra Vite, Workbox, service worker e `version.json`.

Non introdurre un secondo sistema per autenticazione, routing, tema o accesso alle API.

## Vincoli architetturali

Prima di scrivere codice leggere le implementazioni locali di:

- `vite.config.js`;
- `package.json`;
- `src/main.js`;
- `src/App.vue`;
- `src/config.js`;
- `src/api/http.js`;
- `src/api/publicHttp.js`;
- `src/services/updater.js`;
- `src/components/Snackbar.vue`;
- `src/components/Header.vue`;
- `src/components/TabBar.vue`;
- `src/views/Home.vue`;
- `src/views/Hardware/Domotica.vue`.

Preservare sempre:

- `authStore.init()` completato prima del mount dell'app;
- il percorso `VITE_BYPASS_AUTH=true` senza richieste HTTP verso il backend;
- token e preferenze tema in `localStorage` durante gli aggiornamenti;
- API chiamate dalle viste solo attraverso store o service;
- `Header` sticky, `TabBar` fixed e spazio per safe area;
- uso di Naive UI per alert, pulsanti, loading e messaggi.

## 1. Service worker e strategia cache

### File principale

Modificare la configurazione esistente in `vite.config.js`, che usa già `vite-plugin-pwa`.

### Strategia richiesta

Usare una strategia network-first per:

- navigazione dell'applicazione;
- `version.json`;
- eventuali risorse dinamiche necessarie al bootstrap.

La richiesta deve avere un timeout breve e un fallback esplicito. Quando la rete non risponde entro il timeout:

1. usare la risposta cacheata solo se è una shell già valida;
2. informare il client che la rete non è disponibile;
3. lasciare alla UI un'azione esplicita di retry o ricarica.

Stale-while-revalidate può essere usato solo per asset non sensibili e non critici, mai come sostituto silenzioso delle API autenticate.

### Regole Workbox

Configurare esplicitamente:

- `cleanupOutdatedCaches: true`;
- cache versionate e riconoscibili;
- precache limitato alla shell e agli asset statici generati da Vite;
- `globPatterns` coerenti con gli asset buildati;
- fallback di navigazione compatibile con `createWebHashHistory`;
- esclusione di token, risposte private e API autenticate dal runtime caching;
- nessuna cache per richieste `POST`;
- nessuna cache per endpoint con dati personali o dipendenti dalla sessione.

Non cacheare:

- `accessToken`;
- `refreshToken`;
- risposte di login, refresh, profilo e dashboard privata;
- comandi hardware;
- creazione o modifica di spese e famiglie.

Per le API private preferire `network-only`. Un eventuale supporto offline ai dati personali richiederebbe un progetto separato con storage, scadenza, cifratura e sincronizzazione espliciti.

## 2. Retry Axios e fetch

### File coinvolti

- `src/api/http.js`;
- `src/api/publicHttp.js`;
- `src/services/updater.js`;
- eventuale helper condiviso vicino a `src/api/`;
- `src/config.js` per le costanti configurabili.

### Regola generale

Consentire al massimo 2 o 3 retry automatici oltre al tentativo iniziale, con:

- timeout per singola richiesta;
- backoff esponenziale limitato;
- jitter casuale;
- rispetto di `AbortSignal`;
- messaggio di errore normalizzato dopo l'ultimo tentativo.

Esempio concettuale:

```text
tentativo iniziale
retry 1 dopo backoff breve
retry 2 dopo backoff maggiore
retry 3 solo se la policy lo consente
fallback UI dopo il fallimento definitivo
```

### Errori ritentabili

Ritentare solo per errori transitori:

- assenza di connessione;
- timeout;
- errori Axios senza risposta;
- HTTP `408` se la richiesta è idempotente;
- HTTP `429` rispettando eventualmente `Retry-After`;
- HTTP `500`, `502`, `503`, `504` se la richiesta è idempotente.

Non ritentare automaticamente:

- errori `400`, `403`, `404`, `409`, `422`;
- errori di validazione;
- errori di autenticazione già gestiti dal refresh;
- risposte `success: false` senza una policy specifica del service;
- richieste mutative non idempotenti.

### Metodi e operazioni

Retry automatico predefinito consentito per:

- `GET`;
- `HEAD`;
- `OPTIONS`.

Le `POST` possono essere ritentate solo con contratto esplicito di idempotenza e, se necessario, idempotency key.

Non ritentare automaticamente:

- login;
- registrazione;
- refresh token;
- aggiunta a una famiglia;
- creazione famiglia;
- creazione o modifica spesa;
- comandi hardware `open`, `close`, `stop`, `position`, `open_slats`.

Il retry di un comando hardware potrebbe duplicare un effetto reale. Se il backend introdurrà idempotency key, la regola dovrà essere documentata nel service hardware e non nella vista.

### Refresh token

Separare nettamente:

1. retry di trasporto;
2. gestione del `401`;
3. refresh del token;
4. retry singolo della richiesta originale.

Implementare un promise lock per evitare refresh concorrenti:

- una sola richiesta esegue il refresh;
- le altre attendono la stessa Promise;
- se il refresh fallisce, mantenere il logout esistente;
- non ritentare la richiesta di refresh in un loop;
- non applicare il retry generale all'endpoint di refresh.

La proprietà `_retry` da sola non è sufficiente per deduplicare refresh concorrenti.

## 3. Error handler globale e fallback UI

### Obiettivo UI

Un fallimento definitivo non deve lasciare uno schermo bianco o un errore solo nel log.

Mostrare un fallback leggibile, ad esempio:

> Connessione al server non riuscita. Tocca per ricaricare.

Il testo può essere adattato alla lingua e al design esistente, ma deve indicare chiaramente:

- che la connessione è fallita;
- che il problema può essere temporaneo;
- quale azione può eseguire l'utente.

### Punto di integrazione

Usare `App.vue` per lo stato globale e `Snackbar.vue` oppure un componente dedicato riusabile per la UI.

Il componente deve supportare:

- stato di errore persistente;
- stato di retry in corso;
- pulsante o area touch per ricaricare;
- chiusura solo quando il problema è risolto o l'utente può continuare;
- safe area superiore;
- posizione sotto l'Header;
- nessuna sovrapposizione con il contenuto o `TabBar`;
- focus visibile e attivazione da tastiera;
- target touch adeguato su iPhone.

### Errori globali da intercettare

Gestire in modo coerente:

- errori Axios non gestiti;
- errori fetch;
- timeout e offline;
- errori di caricamento di chunk lazy dopo un deploy;
- errori di rendering Vue tramite il meccanismo globale appropriato;
- fallimento dell'aggiornamento del service worker.

Non nascondere gli errori reali in modalità backend. In modalità bypass non generare errori di rete artificiali.

### Retry manuale

Il retry manuale deve:

- impedire click duplicati mentre è in corso;
- rieseguire solo l'operazione fallita quando possibile;
- usare una ricarica completa solo per errori di shell o chunk obsoleti;
- evitare loop infiniti di reload;
- mostrare un messaggio persistente se anche il retry fallisce.

## 4. Updater e `version.json`

### File

Aggiornare `src/services/updater.js` e il suo utilizzo in `App.vue`.

### `version.json`

Definire chiaramente dove viene prodotto `version.json`:

- file generato durante la build/deploy; oppure
- file statico pubblicato in `public/`.

Deve essere servito con:

```http
Cache-Control: no-store
```

Il controllo client deve continuare a usare una richiesta non cacheata, eventualmente con query versionata:

```text
/version.json?t=<timestamp>
```

Se `version.json` non esiste o il deploy non lo pubblica, il sistema deve mostrare un errore diagnostico controllato e non entrare in loop di reload.

### Aggiornamento service worker

Il flusso deve:

1. verificare la versione senza cache;
2. chiamare `registration.update()` quando disponibile;
3. attendere che il nuovo worker sia installato e pronto;
4. coordinare l'attivazione con il client;
5. ricaricare una sola volta quando la nuova shell è pronta;
6. preservare token, tema e stato persistente necessario.

Non usare:

```js
localStorage.clear()
```

Evitare `window.location.reload(true)`, ormai non necessario e non sufficiente a coordinare il service worker.

Per chunk obsoleti usare un flag temporaneo o un contatore in session storage per consentire un solo reload controllato. Dopo il secondo fallimento mostrare il fallback UI senza continuare a ricaricare.

## 5. Cache-busting degli asset

Usare il sistema di asset hashing già fornito da Vite:

- nomi hashati per JavaScript, CSS e asset importati;
- riferimenti aggiornati automaticamente dal manifest/build;
- cache del service worker invalidata quando cambia il precache manifest;
- `version.json` escluso dalla cache permanente o servito con `no-store`.

Non aggiungere query string manuali a ogni asset nel codice Vue se Vite genera già hash affidabili.

Se un asset statico viene copiato direttamente in `public/` e non passa dal bundler, applicare una delle strategie documentate:

- query versionata generata durante il build, ad esempio `?v=<hash>`;
- nome file versionato prodotto dal deploy;
- header HTTP con policy coerente.

La strategia deve essere unica e documentata per evitare che iOS utilizzi una vecchia copia di `index.html`, manifest, icone o script di bootstrap.

Verificare in particolare:

- `index.html`;
- `manifest.webmanifest`;
- `public/favicon.svg`;
- `public/icons.svg`;
- `registerSW.js`;
- chunk lazy generati da Vite.

## 6. Viste e servizi

### `Home.vue`

Sostituire, se necessario, il fallimento globale di `Promise.all` con caricamenti indipendenti o `Promise.allSettled`.

La dashboard e le spese devono poter mostrare ciò che è disponibile, indicando separatamente quale parte richiede retry.

### `Domotica.vue`

Mantenere `Promise.allSettled` per `Apri tutto` e `Chiudi tutto`.

Applicare errori normalizzati per distinguere:

- offline;
- timeout;
- HTTP 5xx;
- HTTP 4xx;
- risposta backend `success: false`;
- fallimento parziale;
- fallimento totale.

Aggiornare solo i dispositivi per cui il comando è riuscito. Non ritentare automaticamente comandi hardware non idempotenti.

### Viste legacy

Non usare `ShoppingList.vue` o `DeviceList.vue` come modello per la nuova architettura. La loro migrazione è scope separato.

## 7. Bypass auth

Con:

```env
VITE_BYPASS_AUTH=true
```

devono restare vere tutte queste condizioni:

- nessuna richiesta Axios al backend;
- nessuna richiesta fetch al backend;
- nessun retry di rete artificiale;
- service worker utilizzabile per la shell, ma non necessario per autenticare;
- fake service restituisce dati locali compatibili;
- logout e nuova sessione demo continuano a funzionare.

Non leggere `import.meta.env` direttamente nelle viste o nei componenti. Usare `src/config.js` e i service/store esistenti.

## 8. Ordine consigliato di implementazione

1. Definire classificazione degli errori e configurazione retry.
2. Aggiornare `http.js` e `publicHttp.js` con policy conservative.
3. Aggiungere promise lock al refresh token.
4. Aggiornare `updater.js` e il contratto `version.json`.
5. Configurare Workbox in `vite.config.js`.
6. Integrare registrazione e aggiornamento SW senza alterare il bootstrap auth.
7. Aggiungere fallback UI globale in `App.vue`.
8. Adattare `Home.vue` e `Domotica.vue` agli errori normalizzati.
9. Verificare asset hashati e cache-busting.
10. Eseguire la checklist completa.

Dopo ogni fase eseguire almeno:

```bash
yarn build
```

## 9. Checklist di accettazione

### Build e PWA

- `yarn build` termina senza errori;
- `dist/sw.js` è generato;
- `dist/registerSW.js` è generato;
- il manifest è valido;
- la shell e gli asset hashati sono nel precache;
- le cache obsolete vengono eliminate;
- le API private non sono nel runtime caching;
- `version.json` non resta bloccato nella cache HTTP.

### Rete e retry

- offline: massimo 2-3 retry e poi fallback UI;
- timeout: retry con backoff e messaggio leggibile;
- HTTP 500/502/503/504: retry solo su richieste idempotenti;
- HTTP 4xx: nessun retry automatico;
- HTTP 401: un solo flusso di refresh condiviso;
- refresh fallito: logout coerente e messaggio leggibile;
- richieste mutative: nessuna duplicazione automatica;
- AbortController: nessun retry dopo abort volontario.

### Aggiornamenti

- versione N aggiornata a N+1;
- nuovo service worker installato e attivato correttamente;
- vecchie cache eliminate;
- chunk obsoleti gestiti con un solo reload controllato;
- nessun loop infinito;
- token e tema non vengono cancellati;
- errore di aggiornamento mostrato all'utente quando necessario.

### UI

- nessuno schermo bianco silenzioso;
- messaggio di connessione fallita visibile;
- azione di ricarica funzionante;
- retry disabilitato durante l'esecuzione;
- fallback leggibile su mobile;
- nessuna sovrapposizione con Header o TabBar;
- test da tastiera e focus visibile;
- `Home.vue` supporta errori parziali;
- `Domotica.vue` distingue successo completo, parziale e fallimento totale.

### Bypass

Con `VITE_BYPASS_AUTH=true` e backend spento:

- login demo funzionante;
- refresh pagina funzionante;
- viste demo esplorabili;
- comandi hardware fake funzionanti;
- nessuna richiesta verso il backend;
- nessun falso errore di rete mostrato.

## 10. Istruzione breve per l'agente implementatore

Leggi prima questo piano e i due documenti guida nella cartella `.github`. Implementa il lavoro per fasi, partendo dalla classificazione degli errori e dalla policy retry. Usa network-first con timeout breve per shell e risorse dinamiche, asset hashing Vite per il cache-busting, `version.json` con `no-store`, e non cacheare mai token o API private. Ritenta solo richieste idempotenti e non duplicare mutazioni. Aggiungi un fallback UI globale con retry esplicito e verifica ogni fase con `yarn build`, DevTools Network/Application e il percorso `VITE_BYPASS_AUTH=true` senza backend.
