import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
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
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "FotsioMobile",
        short_name: "Fotsio",
        description: "App personale per casa",
        theme_color: "#0E2B1B",
        background_color: "#0E2B1B",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "icons.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
});
