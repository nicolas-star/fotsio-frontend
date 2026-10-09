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
			primary: "#2BFF88",
			primaryDark: "#00C65E",
			bg: "#000000",
			bgSoft: "#0A0A0A",
			card: "#141414",
			text: "#FFFFFF",
			textMuted: "#9A9A9A",
		},
		{
			name: "orange",
			primary: "#FF8A1F",
			primaryDark: "#E86A00",
			bg: "#000000",
			bgSoft: "#0A0A0A",
			card: "#141414",
			text: "#FFFFFF",
			textMuted: "#9A9A9A",
		},
		{
			name: "blue",
			primary: "#2E9BFF",
			primaryDark: "#0A6FE0",
			bg: "#000000",
			bgSoft: "#0A0A0A",
			card: "#141414",
			text: "#FFFFFF",
			textMuted: "#9A9A9A",
		},
		{
			name: "violet",
			primary: "#A97BFF",
			primaryDark: "#7C4DFF",
			bg: "#000000",
			bgSoft: "#0A0A0A",
			card: "#141414",
			text: "#FFFFFF",
			textMuted: "#9A9A9A",
		},
		{
			name: "pink",
			primary: "#FF4FA3",
			primaryDark: "#E0287F",
			bg: "#000000",
			bgSoft: "#0A0A0A",
			card: "#141414",
			text: "#FFFFFF",
			textMuted: "#9A9A9A",
		},
		{
			name: "red",
			primary: "#FF4D5E",
			primaryDark: "#E02438",
			bg: "#000000",
			bgSoft: "#0A0A0A",
			card: "#141414",
			text: "#FFFFFF",
			textMuted: "#9A9A9A",
		},
		{
			name: "teal",
			primary: "#1DE9C6",
			primaryDark: "#00B89C",
			bg: "#000000",
			bgSoft: "#0A0A0A",
			card: "#141414",
			text: "#FFFFFF",
			textMuted: "#9A9A9A",
		},
		{
			name: "cyan",
			primary: "#25D0FF",
			primaryDark: "#00A3D6",
			bg: "#000000",
			bgSoft: "#0A0A0A",
			card: "#141414",
			text: "#FFFFFF",
			textMuted: "#9A9A9A",
		},
		{
			name: "yellow",
			primary: "#FFD83A",
			primaryDark: "#E0B400",
			bg: "#000000",
			bgSoft: "#0A0A0A",
			card: "#141414",
			text: "#FFFFFF",
			textMuted: "#9A9A9A",
		},
		{
			name: "lime",
			primary: "#B6FF3B",
			primaryDark: "#8AD400",
			bg: "#000000",
			bgSoft: "#0A0A0A",
			card: "#141414",
			text: "#FFFFFF",
			textMuted: "#9A9A9A",
		},
	],
	light: [
		{
			name: "green",
			primary: "#6FCF97",
			primaryDark: "#3FA56B",
			bg: "#F7FCF9",
			bgSoft: "#E8F7EE",
			card: "#FFFFFF",
			text: "#17301F",
			textMuted: "#6A8574",
		},
		{
			name: "orange",
			primary: "#FFB26B",
			primaryDark: "#F28A2E",
			bg: "#FFFAF4",
			bgSoft: "#FFF0E0",
			card: "#FFFFFF",
			text: "#33200F",
			textMuted: "#8F7560",
		},
		{
			name: "blue",
			primary: "#7DB8FF",
			primaryDark: "#4A90E2",
			bg: "#F5F9FF",
			bgSoft: "#E6F0FD",
			card: "#FFFFFF",
			text: "#14263D",
			textMuted: "#667E99",
		},
		{
			name: "violet",
			primary: "#B79CFF",
			primaryDark: "#8F6BE8",
			bg: "#F9F7FF",
			bgSoft: "#EEE9FD",
			card: "#FFFFFF",
			text: "#251A3F",
			textMuted: "#7D7396",
		},
		{
			name: "pink",
			primary: "#FF9EC4",
			primaryDark: "#E96AA0",
			bg: "#FFF7FA",
			bgSoft: "#FFE8F1",
			card: "#FFFFFF",
			text: "#3A1626",
			textMuted: "#946A7C",
		},
		{
			name: "red",
			primary: "#FF8F9A",
			primaryDark: "#E8606F",
			bg: "#FFF6F7",
			bgSoft: "#FFE6E9",
			card: "#FFFFFF",
			text: "#3A1519",
			textMuted: "#94696E",
		},
		{
			name: "teal",
			primary: "#6FDCCB",
			primaryDark: "#3FB8A6",
			bg: "#F4FCFB",
			bgSoft: "#E2F6F3",
			card: "#FFFFFF",
			text: "#123330",
			textMuted: "#628884",
		},
		{
			name: "cyan",
			primary: "#7FD8F5",
			primaryDark: "#45B5DC",
			bg: "#F4FBFE",
			bgSoft: "#E1F4FB",
			card: "#FFFFFF",
			text: "#0F2C38",
			textMuted: "#5F8594",
		},
		{
			name: "yellow",
			primary: "#FFE27A",
			primaryDark: "#F0C419",
			bg: "#FFFCF0",
			bgSoft: "#FFF5CC",
			card: "#FFFFFF",
			text: "#33290A",
			textMuted: "#8F8460",
		},
		{
			name: "lime",
			primary: "#C5EC7A",
			primaryDark: "#9CCB3F",
			bg: "#FAFEF2",
			bgSoft: "#EEF8D8",
			card: "#FFFFFF",
			text: "#222F0E",
			textMuted: "#75855A",
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
