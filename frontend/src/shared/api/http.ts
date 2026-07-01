import axios, { AxiosError } from 'axios'
import { getAuthToken } from './auth-token'


const baseURL = import.meta.env.VITE_API_URL

if (!baseURL) {
    throw new Error("VITE_API_URL is not set in .env")
}

export const http = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
})

http.interceptors.request.use((config) => {
    const token = getAuthToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config;
})

export type ApiValidationError = {
    detail: Array<{
        loc: (string | number)[]
        msg: string
        type: string
        input: unknown
        ctx?: Record<string, unknown>
    }>
}

export function isAxiosError<T = unknown>(e: unknown): e is AxiosError<T> {
    return axios.isAxiosError(e)
}

