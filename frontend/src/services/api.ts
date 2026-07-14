import axios from 'axios';
import type { ApiError } from '../types/api';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

export interface ApiRequestError {
  code: string;
  message: string;
  details: string[];
  status: number;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data as ApiError | undefined;
    const normalized: ApiRequestError = {
      code: payload?.error?.code ?? 'UNKNOWN_ERROR',
      message: payload?.error?.message ?? error.message ?? 'Unexpected error',
      details: payload?.error?.details ?? [],
      status: error.response?.status ?? 0,
    };
    return Promise.reject(normalized);
  },
);
