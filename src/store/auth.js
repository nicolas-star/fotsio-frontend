import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";
import publicHttp from "../api/publicHttp";
import http from "../api/http";
import { BYPASS_AUTH } from "../config";

const demoUser = {
	id: 0,
	nome: "Utente Demo",
	email: "demo@fotsio.local",
	codice: "DEMO",
	idFamiglia: 1,
};

export const useAuthStore = defineStore("auth", {
	state: () => ({
		user: BYPASS_AUTH ? demoUser : null,
		accessToken: localStorage.getItem("accessToken") || null,
		refreshToken: localStorage.getItem("refreshToken") || null,
		isAuthenticated: BYPASS_AUTH || !!localStorage.getItem("accessToken"),
		// hasFamily: BYPASS_AUTH,
		loading: false,
	}),

	getters: {
		isBypassEnabled: () => BYPASS_AUTH,
	},

	actions: {
		ensureDemoSession() {
			if (!BYPASS_AUTH) return false;

			this.user = demoUser;
			this.isAuthenticated = true;
			// this.hasFamily = true;
			return true;
		},

		async login(username, password) {
			if (BYPASS_AUTH) {
				this.ensureDemoSession();
				return;
			}
			this.loading = true;
			try {
				const result = await publicHttp.post("/api/auth/Login", {
					user: username,
					password: password,
				});

				if (result?.accessToken) {
					this.accessToken = result.accessToken;
					this.refreshToken = result.refreshToken;
					localStorage.setItem("accessToken", result.accessToken);
					if (result.refreshToken) {
						localStorage.setItem("refreshToken", result.refreshToken);
					}
					this.isAuthenticated = true;
					await this.fetchUserInfo();
				}
			} catch (error) {
				this.logout();
				throw error;
			} finally {
				this.loading = false;
			}
		},

		/*
		async signup(username, password, email) {
			if (BYPASS_AUTH) {
				this.ensureDemoSession();
				return;
			}

			this.loading = true;
			try {
				const result = await publicHttp.post("/api/auth/SignUp", {
					user: username,
					password: password,
					email: email,
				});

				if (result) {
					await this.login(username, password);
				} else {
					throw new Error("Impossibile creare l'utente");
				}
			} catch (error) {
				throw error;
			} finally {
				this.loading = false;
			}
		},
		*/

		logout() {
			this.user = null;
			this.accessToken = null;
			this.refreshToken = null;
			this.isAuthenticated = false;
			// this.hasFamily = false;
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
		},

		isTokenExpired(token) {
			if (!token) return true;
			try {
				const decoded = jwtDecode(token);
				return decoded.exp ? decoded.exp * 1000 < Date.now() : true;
			} catch (e) {
				return true;
			}
		},

		async refreshAccessToken() {
			if (BYPASS_AUTH) {
				this.ensureDemoSession();
				return;
			}

			if (!this.refreshToken || this.isTokenExpired(this.refreshToken)) {
				this.logout();
				return;
			}

			try {
				const result = await publicHttp.post("/api/auth/RefreshToken", {
					refreshToken: this.refreshToken,
				});

				if (result?.newToken) {
					this.accessToken = result.newToken;
					localStorage.setItem("accessToken", result.newToken);
					this.isAuthenticated = true;
				} else {
					this.logout();
				}
			} catch (error) {
				this.logout();
			}
		},

		async fetchUserInfo() {
			if (BYPASS_AUTH || !this.accessToken) return;

			try {
				const decoded = jwtDecode(this.refreshToken || this.accessToken);
				const userId = decoded.id || decoded.nameid || decoded.sub;

				const userData = await http.post("/api/user/UserInfo", { id: userId });

				if (userData) {
					this.user = userData;
					// idFamiglia resta disponibile per i payload delle API preesistenti.
					// this.hasFamily = !!(userData.idFamiglia && userData.idFamiglia > 0);
				}
			} catch (error) {
				console.error("Error fetching user info:", error);
			}
		},

		async init() {
			if (BYPASS_AUTH) {
				this.ensureDemoSession();
				return;
			}

			const storedRefreshToken = localStorage.getItem("refreshToken");
			const storedAccessToken = localStorage.getItem("accessToken");

			if (storedRefreshToken && !this.isTokenExpired(storedRefreshToken)) {
				if (!storedAccessToken || this.isTokenExpired(storedAccessToken)) {
					await this.refreshAccessToken();
				}

				if (this.isAuthenticated) {
					await this.fetchUserInfo();
				}
			} else {
				this.logout();
			}
		},
	},
});
