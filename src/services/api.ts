import axios from 'axios';
import Config from '@/config';

// Create an instance of axios with the base URL
const api = axios.create({
    baseURL: Config.API_URL,
    timeout: 50000, // Set a timeout of 5 seconds
});


//Requet interceptor
api.interceptors.request.use(
    (config) => {
        const newConfig = {...config};
        newConfig.headers.Authorization = `Bearer ${process.env.NEXT_PUBLIC_MOVIE_API_KEY}`;
        newConfig.headers.accept = 'application/json';
        console.log("Making request to:", newConfig.url);
        return newConfig;
    },
    (error) => {
        console.error("Error in request:", error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log("Response received:", response);
        return response;
    },
    (error) => {
        console.error("Error in response:", error);
        return Promise.reject(error);
    }
);

export default api;