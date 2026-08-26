import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Auth/Login.vue";
import Register from "../views/Auth/Register.vue";
import Domotica from "../views/Hardware/Domotica.vue";
import ShoppingList from "../views/Spesa/ShoppingList.vue";
import Profile from "../views/Profile.vue";
import JoinFamily from "../views/Auth/JoinFamily.vue";
import { useAuthStore } from "../store/auth";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { requiresAuth: true, requiresFamily: true },
  },
  {
    path: "/join-family",
    name: "JoinFamily",
    component: JoinFamily,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/hardware",
    name: "Hardware",
    redirect: "/domotica",
    meta: { requiresAuth: true, requiresFamily: true },
  },
  {
    path: "/domotica",
    name: "Domotica",
    component: Domotica,
    meta: { requiresAuth: true, requiresFamily: true },
  },
  {
    path: "/spesa",
    name: "Spesa",
    component: ShoppingList,
    meta: { requiresAuth: true, requiresFamily: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Guard di navigazione per l'autenticazione e la famiglia
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next("/login");
  }

  if (isAuthenticated && to.meta.requiresFamily && !authStore.hasFamily) {
    return next("/join-family");
  }

  if ((to.name === "Login" || to.name === "Register") && isAuthenticated) {
    return next("/");
  }

  next();
});

export default router;
