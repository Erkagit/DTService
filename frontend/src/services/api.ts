import axios from 'axios';
import type { User, Company, Vehicle, Order, LocationPing } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

console.log('API Base URL:', API_BASE_URL); // Debug log

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth interceptor
api.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url); // Debug log
  
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem('userId');
    if (userId) {
      config.headers['x-user-id'] = userId;
    }
  }
  return config;
});

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url); // Debug log
    return response;
  },
  (error) => {
    console.error('API Error:', error.message, error.config?.url); // Debug log
    return Promise.reject(error);
  }
);

// API Methods
export const authApi = {
  login: (email: string, password: string) => api.post<{
    user: User;
    token: string;
    message: string;
  }>('/api/auth/login', { email, password }),
};

export const companiesApi = {
  getAll: () => api.get<Company[]>('/api/companies'),
};

export const usersApi = {
  getAll: () => api.get<User[]>('/api/users'),
};

export const vehiclesApi = {
  getAll: () => api.get<Vehicle[]>('/api/vehicles'),
  sendPing: (vehicleId: number, data: { lat: number; lng: number; speedKph?: number; heading?: number }) =>
    api.post<LocationPing>(`/api/vehicles/${vehicleId}/ping`, data),
};

export const ordersApi = {
  getAll: () => api.get<Order[]>('/api/orders'),
  create: (data: { code: string; origin: string; destination: string; vehicleId?: number; companyId?: number }) =>
    api.post<Order>('/api/orders', data),
};

export default api;
