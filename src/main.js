import { createApp } from "vue";
import { createPinia } from "pinia";
import "./theme/index.css";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "./store/auth";
// import { router } from "./router";

// applyRandomTheme();

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const authStore = useAuthStore();
authStore.init().finally(() => {
  app.mount("#app");
});
