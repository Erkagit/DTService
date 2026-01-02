import axios from 'axios';
import type { User, Company, Vehicle, Order, LocationPing, Device, PreOrder } from '@/types/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

console.log('API Base URL:', API_BASE_URL); // Debug log

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message, error.config?.url);
    
    // Handle 401 Unauthorized - redirect to landing page
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    
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
  getById: (id: number) => api.get<Company & { 
    users: User[]; 
    orders: Order[];
  }>(`/api/companies/${id}`),
  create: (data: { name: string }) => api.post<Company>('/api/companies', data),
  update: (id: number, data: { name: string }) => api.put<Company>(`/api/companies/${id}`, data),
  delete: (id: number) => api.delete(`/api/companies/${id}`),
};

export const usersApi = {
  getAll: () => api.get<User[]>('/api/users'),
  create: (data: { email: string; name: string; password: string; role: string; companyId?: number }) =>
    api.post<User>('/api/users', data),
  update: (id: number, data: { email?: string; name?: string; role?: string; companyId?: number }) =>
    api.put<User>(`/api/users/${id}`, data),
  delete: (id: number) => api.delete(`/api/users/${id}`),
};

export const vehiclesApi = {
  getAll: () => api.get<Vehicle[]>('/api/vehicles'),
  getAvailable: () => api.get<Vehicle[]>('/api/vehicles/available'),
  create: (data: { plateNo: string; driverName: string; driverPhone: string; deviceId?: number }) =>
    api.post<Vehicle>('/api/vehicles', data),
  update: (id: number, data: { plateNo?: string; driverName?: string; driverPhone?: string; deviceId?: number }) =>
    api.put<Vehicle>(`/api/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/api/vehicles/${id}`),
  sendPing: (vehicleId: number, data: { lat: number; lng: number; speedKph?: number; heading?: number }) =>
    api.post<LocationPing>(`/api/vehicles/${vehicleId}/ping`, data),
};

export const devicesApi = {
  getAll: () => api.get<Device[]>('/api/devices'),
  create: (data: { deviceId: string }) => api.post<Device>('/api/devices', data),
  update: (id: number, data: { deviceId: string }) => api.put<Device>(`/api/devices/${id}`, data),
  delete: (id: number) => api.delete(`/api/devices/${id}`),
};

export const ordersApi = {
  getAll: () => api.get<Order[]>('/api/orders'),
  create: (data: { origin: string; destination: string; vehicleId?: number; companyId?: number }) =>
    api.post<Order>('/api/orders', data),
  update: (id: number, data: { code?: string; origin?: string; destination?: string; vehicleId?: number; status?: string }) =>
    api.put<Order>(`/api/orders/${id}`, data),
  delete: (id: number) => api.delete(`/api/orders/${id}`),
  updateVehicle: (id: number, vehicleId: string | null) =>
    api.patch<Order>(`/api/orders/${id}/vehicle`, { vehicleId }),
  convertToPreOrder: (id: number) =>
    api.post(`/api/orders/${id}/convert-to-preorder`),
};

export const preOrdersApi = {
  getAll: () => api.get<PreOrder[]>('/api/preorders'),
  getById: (id: number) => api.get<PreOrder>(`/api/preorders/${id}`),
  create: (data: Partial<PreOrder>) => api.post<PreOrder>('/api/preorders', data),
  update: (id: number, data: Partial<PreOrder>) => api.put<PreOrder>(`/api/preorders/${id}`, data),
  delete: (id: number) => api.delete(`/api/preorders/${id}`),
  createOrder: (preOrderId: number, data: { vehicleId: string }) =>
    api.post(`/api/preorders/${preOrderId}/create-order`, data),
};

export default api;
