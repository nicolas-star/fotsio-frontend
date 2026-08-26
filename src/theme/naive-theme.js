// naive-theme.js
// Costruisce l'oggetto "theme-overrides" per Naive UI a partire dalla palette
// attiva, cosi' anche i componenti Naive UI (bottoni, select, switch...)
// seguono lo stesso tema scelto per il resto dell'app.

export function buildNaiveThemeOverrides(palette) {
  return {
    common: {
      primaryColor: palette.primary,
      primaryColorHover: palette.primaryDark,
      primaryColorPressed: palette.primaryDark,
      primaryColorSuppl: palette.primary,
      baseColor: palette.bg,
      textColorBase: palette.text,
      textColor1: palette.text,
      textColor2: palette.textMuted,
      textColor3: palette.textMuted,
      bodyColor: palette.bg,
      cardColor: palette.card,
      borderRadius: '16px',
    },
    Card: {
      color: palette.card,
      textColor: palette.text,
    },
    Button: {
      textColorPrimary: '#0B0B0B',
    },
  }
}
