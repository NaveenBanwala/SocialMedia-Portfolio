
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', 
    headers: {
    'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
    },
    (error) => Promise.reject(error)
);
//Handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
    if (error.response?.status === 401) {
        console.warn('Unauthorized. Redirecting to login...');
      // You can force logout or redirect if needed
      // localStorage.removeItem('token');
    }
    return Promise.reject(error);
    }
);

export default api;
