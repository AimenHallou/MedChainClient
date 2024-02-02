// axiosInstance.ts
import axios, { AxiosInstance } from 'axios';

// Create an Axios instance with a custom config
export const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:54321',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setBearerToken = (token: string) => {
    api.defaults.headers.common = { Authorization: `Bearer ${token}` };
};

export const getBearerToken = () => {
    return api.defaults.headers.common;
};
