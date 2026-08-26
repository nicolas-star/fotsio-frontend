// palettes.js
// Pool di palette colore, separate per tema chiaro e scuro.
// Ad ogni avvio dell'app (o cambio di modalita') ne viene scelta una a caso
// dal pool corrispondente alla modalita' attiva.
// Per aggiungere un nuovo tema, basta aggiungere un oggetto nell'array giusto
// (dark o light): nessun altro file va toccato.
// Nota: per mantenere continuita' visiva quando si passa da chiaro a scuro
// (vedi theme.js -> toggleMode), ogni palette "light" ha una controparte
// "dark" con lo stesso "name".

export const palettes = {
  dark: [
    {
      name: "green",
      primary: "#3DDC84",
      primaryDark: "#1FA35C",
      bg: "#0E2B1B",
      bgSoft: "#163A26",
      card: "#1B4A2E",
      text: "#FFFFFF",
      textMuted: "#B8D9C6",
    },
    {
      name: "orange",
      primary: "#FFA726",
      primaryDark: "#F57C00",
      bg: "#2B1A0E",
      bgSoft: "#3A2416",
      card: "#4A3016",
      text: "#FFFFFF",
      textMuted: "#D9C0AC",
    },
    {
      name: "blue",
      primary: "#42A5F5",
      primaryDark: "#1976D2",
      bg: "#0E1E2B",
      bgSoft: "#16283A",
      card: "#1B3A4A",
      text: "#FFFFFF",
      textMuted: "#ACC7D9",
    },
    {
      name: "purple",
      primary: "#AB47BC",
      primaryDark: "#7B1FA2",
      bg: "#210E2B",
      bgSoft: "#2E163A",
      card: "#3D1B4A",
      text: "#FFFFFF",
      textMuted: "#CBACD9",
    },
  ],
  light: [
    {
      name: "green",
      primary: "#2FA36B",
      primaryDark: "#1F7A4E",
      bg: "#F4FBF6",
      bgSoft: "#E6F5EA",
      card: "#FFFFFF",
      text: "#12281B",
      textMuted: "#5B7A66",
    },
    {
      name: "orange",
      primary: "#FB8C00",
      primaryDark: "#E65100",
      bg: "#FFF8F0",
      bgSoft: "#FFEFDC",
      card: "#FFFFFF",
      text: "#2B1A0E",
      textMuted: "#8A6A4E",
    },
    {
      name: "blue",
      primary: "#1E88E5",
      primaryDark: "#1565C0",
      bg: "#F2F8FE",
      bgSoft: "#E3F1FC",
      card: "#FFFFFF",
      text: "#0E1E2B",
      textMuted: "#5A7A90",
    },
    {
      name: "purple",
      primary: "#8E24AA",
      primaryDark: "#6A1B80",
      bg: "#F9F1FB",
      bgSoft: "#F0E1F5",
      card: "#FFFFFF",
      text: "#210E2B",
      textMuted: "#7C5A8C",
    },
  ],
};

// Modalita' valide
export const THEME_MODES = ["dark", "light"];

// Estrae una palette a caso dal pool della modalita' richiesta.
export function pickRandomPalette(mode = "dark") {
  const pool = palettes[mode] ?? palettes.dark;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Utile in fase di sviluppo per forzare una palette specifica,
// es. getPaletteByName('blue', 'light')
export function getPaletteByName(name, mode = "dark") {
  const pool = palettes[mode] ?? palettes.dark;
  return pool.find((p) => p.name === name) ?? pool[0];
}
