import axios from 'axios';
import { API_URL } from '../config';
import { useAuthStore } from '../store/auth';

const http = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor per le richieste
http.interceptors.request.use(
    async (config) => {
        const authStore = useAuthStore();
        
        // Se il token è scaduto, prova a fare il refresh prima della chiamata
        if (authStore.accessToken && authStore.isTokenExpired(authStore.accessToken)) {
            await authStore.refreshAccessToken();
        }

        if (authStore.accessToken) {
            config.headers.Authorization = `Bearer ${authStore.accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor per le risposte
http.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error) => {
        const authStore = useAuthStore();
        
        if (error.response) {
            // Se riceviamo un 401, il token potrebbe essere scaduto proprio ora
            if (error.response.status === 401 && !error.config._retry) {
                error.config._retry = true;
                await authStore.refreshAccessToken();
                if (authStore.accessToken) {
                    error.config.headers.Authorization = `Bearer ${authStore.accessToken}`;
                    return http(error.config);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default http;
