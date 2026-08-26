import axios from 'axios';
import { API_URL } from '../config';

const publicHttp = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

publicHttp.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error)
);

export default publicHttp;
