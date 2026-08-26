# La Mia App

Vue 3 + Vite + Naive UI, mobile-first, installabile come PWA.

## Comandi

```bash
yarn            # installa le dipendenze
yarn dev        # avvia il server di sviluppo
yarn build      # build di produzione (cartella dist/)
yarn preview    # serve la build di produzione in locale, per testare la PWA
```

## Struttura dello stile (`src/theme/`)

Questa è la parte pensata per **non essere più toccata** dopo il setup iniziale.

| File             | A cosa serve                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `palettes.js`    | Pool di palette chiaro/scuro. Ad ogni avvio viene scelta una palette dal pool della modalita' attiva.                        |
| `spacing.css`    | Variabili `--space-*` e `--radius-*`, da usare al posto di padding/margin/border-radius scritti a mano.                      |
| `typography.css` | Classi `.testo1` / `.testo2` / `.testo3` / `.testo4`. Usa solo queste nei componenti, mai `font-size` a mano.                |
| `base.css`       | Reset minimo + layout base mobile-first (`#app` centrato, max-width 480px).                                                  |
| `store/theme.js` | Applica la palette scelta come variabili CSS su `:root` e fornisce tema base e override reattivi a Naive UI.                 |
| `naive-theme.js` | Traduce la palette attiva in un oggetto `theme-overrides` per Naive UI, così anche i suoi componenti seguono lo stesso tema. |
| `index.css`      | Punto di ingresso unico: importa tutto il CSS del tema in ordine.                                                            |

### Come lavorare da qui in poi

Nei componenti, per i testi usa solo le classi già pronte:

```html
<p class="testo1">Titolo grande</p>
<p class="testo3 testo3--muted">Testo secondario</p>
```

Per i colori, usa le variabili CSS invece di valori fissi:

```css
.mia-card {
  background: var(--color-card);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
}
```

Per aggiungere un nuovo tema colore, apri **solo** `palettes.js` e aggiungi la palette sia al pool `dark` sia al pool `light` — nessun altro file va modificato.

## Modalita' demo senza backend

Per lavorare sulla grafica senza avere il backend disponibile, imposta la variabile Vite in `.env.local`:

```env
VITE_BYPASS_AUTH=true
```

Con il bypass attivo lo store auth usa l'utente demo, il click su Accedi autentica senza validare le credenziali e login, registrazione e operazioni demo non effettuano richieste HTTP. I componenti devono usare lo store e non leggere direttamente `import.meta.env`.

Per il comportamento reale usa:

```env
VITE_BYPASS_AUTH=false
```

## PWA

Il progetto è già configurato con `vite-plugin-pwa` (vedi `vite.config.js`). Dopo `yarn build`, la cartella `dist/` contiene un manifest e un service worker pronti. Per installarla su iOS: apri il sito da Safari → condividi → "Aggiungi alla schermata Home".
