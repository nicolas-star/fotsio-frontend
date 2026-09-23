import axios from 'axios';
import { API_URL } from '../config';
import { useAuthStore } from '../store/auth';
import {
    clearNetworkFailure,
    getRetryDelay,
    isRetryableAxiosError,
    MAX_NETWORK_RETRIES,
    reportNetworkFailure,
    wait,
} from '../services/network';

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
        clearNetworkFailure();
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

        if (isRetryableAxiosError(error)) {
            const retryCount = error.config._networkRetryCount || 0;

            if (retryCount < MAX_NETWORK_RETRIES) {
                error.config._networkRetryCount = retryCount + 1;
                await wait(getRetryDelay(retryCount));
                return http(error.config);
            }

            reportNetworkFailure(error);
        }

        return Promise.reject(error);
    }
);

export default http;
