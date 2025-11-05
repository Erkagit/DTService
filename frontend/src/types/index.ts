// Backend API Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'OPERATOR' | 'CLIENT_ADMIN';
  companyId: number | null;
  company?: Company;
}

export interface Company {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    orders: number;
  };
}

export interface Vehicle {
  id: number;
  plateNo: string;
  driverName: string;
  driverPhone: string;
  deviceId: number | null;
  device?: {
    id: number;
    deviceId: string;
  };
  pings?: LocationPing[];
}

export interface Order {
  id: number;
  code: string;
  companyId: number;
  origin: string;
  destination: string;
  vehicleId: number | null;
  status: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  createdById: number;
  assignedToId: number | null;
  createdAt: string;
  updatedAt: string;
  company?: Company;
  vehicle?: Vehicle;
  createdBy?: User;
  assignedTo?: User;
}

export interface LocationPing {
  id: number;
  vehicleId: number;
  lat: number;
  lng: number;
  speedKph?: number;
  heading?: number;
  at: string;
}

export interface Device {
  id: number;
  deviceId: string;
  createdAt: string;
  updatedAt: string;
}
