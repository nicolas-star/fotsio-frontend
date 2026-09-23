import axios from 'axios';
import { API_URL } from '../config';
import {
    clearNetworkFailure,
    getRetryDelay,
    isRetryableAxiosError,
    MAX_NETWORK_RETRIES,
    reportNetworkFailure,
    wait,
} from '../services/network';

const publicHttp = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

publicHttp.interceptors.response.use(
    (response) => {
        clearNetworkFailure();
        return response.data;
    },
    async (error) => {
        if (isRetryableAxiosError(error)) {
            const retryCount = error.config._networkRetryCount || 0;

            if (retryCount < MAX_NETWORK_RETRIES) {
                error.config._networkRetryCount = retryCount + 1;
                await wait(getRetryDelay(retryCount));
                return publicHttp(error.config);
            }

            reportNetworkFailure(error);
        }

        return Promise.reject(error);
    }
);

export default publicHttp;
