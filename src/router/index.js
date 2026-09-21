import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "../store/auth";

// lazy import dei componenti per ridurre il bundle iniziale
const Login = () => import("../views/Auth/Login.vue");
const Domotica = () => import("../views/Hardware/Domotica.vue");
const ShoppingList = () => import("../views/Spesa/ShoppingList.vue");
const Profile = () => import("../views/Profile.vue");
const Home = () => import("../views/Home.vue");

const routes = [
	{
		path: "/",
		name: "Home",
		component: Home,
		meta: { requiresAuth: true },
	},
	/*
  {
    path: "/join-family",
    name: "JoinFamily",
    component: JoinFamily,
    meta: { requiresAuth: true },
  },
  */
	{
		path: "/login",
		name: "Login",
		component: Login,
	},
	/*
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  */
	{
		path: "/hardware",
		name: "Hardware",
		redirect: "/domotica",
		meta: { requiresAuth: true },
	},
	{
		path: "/domotica",
		name: "Domotica",
		component: Domotica,
		meta: { requiresAuth: true },
	},
	{
		path: "/spesa",
		name: "Spesa",
		component: ShoppingList,
		meta: { requiresAuth: true },
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

// Guard di navigazione per l'autenticazione
router.beforeEach(async (to, from, next) => {
	const authStore = useAuthStore();
	const isAuthenticated = authStore.isAuthenticated;

	if (to.meta.requiresAuth && !isAuthenticated) {
		return next("/login");
	}

	/*
  // La gestione della famiglia resta conservata per un'eventuale riattivazione.
  if (isAuthenticated && to.meta.requiresFamily && !authStore.hasFamily) {
    return next("/join-family");
  }
  */

	if (to.name === "Login" && isAuthenticated) {
		return next("/");
	}

	next();
});

export default router;
