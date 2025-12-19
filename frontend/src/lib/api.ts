import axios from "axios";
import { useAuthStore } from "./authStore";

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_API,
    withCredentials: true,
});

axiosInstance.interceptors.response.use(
    response => response, // Directly return successful responses.
    async error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/users/refresh-token`,
                    {},
                    { withCredentials: true }
                );
                useAuthStore.getState().setUser(response.data.data.user)
                return axiosInstance(originalRequest); // Retry the original request with the new access token.
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                useAuthStore.getState().clearUser()
                window.location.href = '/signin';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error); // For all other errors, return the error as is.
    }
);