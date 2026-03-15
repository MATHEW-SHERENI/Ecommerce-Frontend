import axios from 'axios';

// Create axios instance for public endpoints
export const publicApi = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Create axios instance for protected endpoints
export const protectedApi = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default publicApi;
