"use client";

import axios from "axios";
import { useAuthStore } from "./authStore";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API ? `${process.env.NEXT_PUBLIC_BACKEND_API}/api/v1` : "/api/v1",
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = axiosInstance
            .post("/users/refresh-token")
            .then((res) => {
              console.log(res);
              useAuthStore.getState().setUser(res.data.data.user);
              return res;
            })
            .finally(() => {
              isRefreshing = false;
              refreshPromise = null;
            });
        }

        await refreshPromise;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearUser();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
