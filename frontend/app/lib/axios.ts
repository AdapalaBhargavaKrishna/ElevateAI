import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string | null) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token) => {
                            if (token) {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                            }
                            resolve(api(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newToken = response.data?.access_token;
                const newRefreshToken = response.data?.refresh_token;
                if (newToken) {
                    localStorage.setItem('access_token', newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }
                if (newRefreshToken) {
                    localStorage.setItem('refresh_token', newRefreshToken);
                }

                isRefreshing = false;
                processQueue(null, newToken);
                return api(originalRequest);
            } catch (refreshError) {
                const localRefreshToken = typeof window !== 'undefined'
                    ? localStorage.getItem('refresh_token')
                    : null;

                if (localRefreshToken) {
                    try {
                        const retryResponse = await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
                            { refresh_token: localRefreshToken },
                            { withCredentials: true }
                        );

                        const retryAccessToken = retryResponse.data?.access_token;
                        const retryRefreshToken = retryResponse.data?.refresh_token;
                        if (retryAccessToken) {
                            localStorage.setItem('access_token', retryAccessToken);
                            originalRequest.headers.Authorization = `Bearer ${retryAccessToken}`;
                        }
                        if (retryRefreshToken) {
                            localStorage.setItem('refresh_token', retryRefreshToken);
                        }

                        isRefreshing = false;
                        processQueue(null, retryAccessToken);
                        return api(originalRequest);
                    } catch (retryError) {
                        refreshError = retryError;
                    }
                }

                isRefreshing = false;
                processQueue(refreshError, null);
                localStorage.removeItem('access_token');
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);