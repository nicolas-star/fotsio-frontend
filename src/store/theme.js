// store/theme.js
// Store Pinia per il tema: gestisce sia la palette colore attiva sia la
// modalita' chiaro/scuro. Le due cose restano indipendenti nell'uso
// (themeStore.mode, themeStore.palette), ma le palette disponibili sono
// separate per modalita' (vedi ../theme/palettes.js): non tutte le
// combinazioni sono possibili, solo quelle del pool corrispondente.

import { defineStore } from "pinia";
import { darkTheme, lightTheme } from "naive-ui";
import { pickRandomPalette, getPaletteByName } from "../theme/palettes";
import { buildNaiveThemeOverrides } from "../theme/naive-theme";

const CSS_VAR_MAP = {
  primary: "--color-primary",
  primaryDark: "--color-primary-dark",
  bg: "--color-bg",
  bgSoft: "--color-bg-soft",
  card: "--color-card",
  text: "--color-text",
  textMuted: "--color-text-muted",
};

const STORAGE_KEY = "theme-mode";
const PALETTE_STORAGE_KEY = "theme-palette";
const ALWAYS_RANDOM = "always-random";

// Modalita' preferita: quella salvata in precedenza, altrimenti quella
// di sistema (prefers-color-scheme), altrimenti dark come fallback.
function detectPreferredMode() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export const useThemeStore = defineStore("theme", {
  state: () => ({
    mode: "dark", // 'dark' | 'light'
    palette: null, // palette attiva, es. { name: 'green', primary: '#3DDC84', ... }
    palettePreference:
      localStorage.getItem(PALETTE_STORAGE_KEY) || ALWAYS_RANDOM,
  }),

  getters: {
    // Oggetto pronto da passare a <n-config-provider :theme-overrides="...">
    naiveThemeOverrides: (state) =>
      state.palette ? buildNaiveThemeOverrides(state.palette) : {},
    // Tema base Naive UI (chiaro/scuro) da passare a <n-config-provider :theme="...">
    naiveBaseTheme: (state) => (state.mode === "dark" ? darkTheme : lightTheme),
    isDark: (state) => state.mode === "dark",
  },

  actions: {
    // Da chiamare UNA VOLTA SOLA all'avvio (App.vue mounted).
    // Rileva la modalita' preferita (salvata o di sistema) e sceglie
    // una palette a caso dal pool corrispondente.
    applyTheme() {
      const mode = detectPreferredMode();
      const preference = this.palettePreference;
      const palette =
        preference === ALWAYS_RANDOM
          ? pickRandomPalette(mode)
          : getPaletteByName(preference, mode);
      this._applyPalette(palette, mode);
      return palette;
    },

    // Passa da chiaro a scuro (o viceversa). Se la palette attiva esiste
    // anche nell'altro pool (stesso "name"), la mantiene per continuita'
    // visiva; altrimenti ne sceglie una a caso.
    toggleMode() {
      const nextMode = this.mode === "dark" ? "light" : "dark";
      const nextPalette =
        this.palettePreference === ALWAYS_RANDOM
          ? pickRandomPalette(nextMode)
          : this.palette
            ? getPaletteByName(this.palette.name, nextMode)
            : pickRandomPalette(nextMode);
      this._applyPalette(nextPalette, nextMode);
    },

    // Forza una modalita' specifica (es. da un toggle in UI).
    setMode(mode) {
      if (mode !== "light" && mode !== "dark") return;
      const palette =
        this.palettePreference === ALWAYS_RANDOM
          ? pickRandomPalette(mode)
          : this.palette
            ? getPaletteByName(this.palette.name, mode)
            : pickRandomPalette(mode);
      this._applyPalette(palette, mode);
    },

    // Cambia solo la palette (a caso), restando nella modalita' attuale.
    randomizePalette() {
      const palette = pickRandomPalette(this.mode);
      this._applyPalette(palette, this.mode);
    },

    setPalette(name) {
      this.setPalettePreference(name);
    },

    setPalettePreference(preference) {
      if (preference === ALWAYS_RANDOM) {
        this.palettePreference = ALWAYS_RANDOM;
        localStorage.setItem(PALETTE_STORAGE_KEY, ALWAYS_RANDOM);
        this._applyPalette(pickRandomPalette(this.mode), this.mode);
        return;
      }

      const palette = getPaletteByName(preference, this.mode);
      this.palettePreference = palette.name;
      localStorage.setItem(PALETTE_STORAGE_KEY, palette.name);
      this._applyPalette(palette, this.mode);
    },

    _applyPalette(palette, mode) {
      const root = document.documentElement;
      for (const key in CSS_VAR_MAP) {
        root.style.setProperty(CSS_VAR_MAP[key], palette[key]);
      }
      root.dataset.theme = mode;
      this.palette = palette;
      this.mode = mode;
      localStorage.setItem(STORAGE_KEY, mode);
    },
  },
});
