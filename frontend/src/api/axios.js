import axios from 'axios';

const api = axios.create({
    baseURL: 'https://pawn-shop-backend.onrender.com/api',
    // baseURL:  'http://localhost:5000/api';
});

api.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user');
        if (user && user !== 'undefined') {
            try {
                const { token } = JSON.parse(user);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error("Error parsing user from local storage in axios interceptor", error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("401 Unauthorized detected. Logging out...");
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;