import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import { VitePWA } from "vite-plugin-pwa";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// https://vite.dev/config/
export default defineConfig({
	base: "./",
	plugins: [
		vue(),
		// Auto-import dei componenti Naive UI: niente import manuali,
		// scrivi <n-button> e basta, il plugin aggiunge l'import da solo.
		AutoImport({
			imports: [
				{
					"naive-ui": [
						"useDialog",
						"useMessage",
						"useNotification",
						"useLoadingBar",
					],
				},
			],
		}),
		Components({
			resolvers: [NaiveUiResolver()],
		}),
		// Configurazione PWA: rende l'app installabile su iOS/Android
		// (icona in home, apertura senza barra del browser).
		VitePWA({
			registerType: "autoUpdate",
			injectRegister: "auto",
			includeAssets: ["favicon.svg"],
			workbox: {
				cleanupOutdatedCaches: true,
				navigateFallback: "/index.html",
				runtimeCaching: [
					{
						urlPattern: ({ request }) => request.mode === "navigate",
						handler: "NetworkFirst",
						options: {
							cacheName: "fotsio-pages-v1",
							networkTimeoutSeconds: 3,
							cacheableResponse: { statuses: [200] },
						},
					},
					{
						urlPattern: ({ request }) =>
							request.destination === "style" ||
							request.destination === "script" ||
							request.destination === "image" ||
							request.destination === "font",
						handler: "CacheFirst",
						options: {
							cacheName: "fotsio-assets-v1",
							cacheableResponse: { statuses: [200] },
						},
					},
				],
			},
			manifest: {
				name: "FotsioMobile",
				short_name: "Fotsio",
				description: "App personale per casa",
				theme_color: "#0E2B1B",
				background_color: "#0E2B1B",
				display: "standalone",
				start_url: "./",
				scope: "./",
				icons: [
					{
						src: "icons.svg",
						sizes: "any",
						type: "image/svg+xml",
					},
				],
			},
		}),
		{
			name: "build-version-json",
			apply: "build",
			async writeBundle({ dir }) {
				const version = new Date().toISOString();

				await writeFile(
					resolve(dir || "dist", "version.json"),
					`${JSON.stringify({ version }, null, 2)}\n`,
				);
			},
		},
	],
	build: {
		rollupOptions: {
			output: {
				entryFileNames: "assets/[name]-[hash].js",
				chunkFileNames: "assets/[name]-[hash].js",
				assetFileNames: "assets/[name]-[hash][extname]",
			},
		},
	},
});
