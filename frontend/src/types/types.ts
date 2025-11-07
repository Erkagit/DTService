// Backend API Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'CLIENT_ADMIN';
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

export type OrderStatus = 
  | 'PENDING'
  | 'LOADING'
  | 'TRANSFER_LOADING'
  | 'CN_EXPORT_CUSTOMS'
  | 'MN_IMPORT_CUSTOMS'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_SITE'
  | 'UNLOADED'
  | 'RETURN_TRIP'
  | 'MN_EXPORT_RETURN'
  | 'CN_IMPORT_RETURN'
  | 'TRANSFER'
  | 'COMPLETED'
  | 'CANCELLED';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Хүлээгдэж байна',
  LOADING: 'Ачилт хийгдэж байна',
  TRANSFER_LOADING: 'Шилжүүлэн ачилт',
  CN_EXPORT_CUSTOMS: 'Хятадын экспорт гааль',
  MN_IMPORT_CUSTOMS: 'Монгол импорт гааль',
  IN_TRANSIT: 'Хүргэлт замдаа',
  ARRIVED_AT_SITE: 'Буулгах хаягт ирсэн',
  UNLOADED: 'Ачаа буусан',
  RETURN_TRIP: 'Буцах хүргэлт',
  MN_EXPORT_RETURN: 'Монголын экспорт (буцах)',
  CN_IMPORT_RETURN: 'Хятадын импорт (буцах)',
  TRANSFER: 'Шилжүүлэн ачилт (дундах)',
  COMPLETED: 'Дууссан',
  CANCELLED: 'Цуцлагдсан',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  LOADING: 'bg-blue-100 text-blue-700',
  TRANSFER_LOADING: 'bg-indigo-100 text-indigo-700',
  CN_EXPORT_CUSTOMS: 'bg-purple-100 text-purple-700',
  MN_IMPORT_CUSTOMS: 'bg-cyan-100 text-cyan-700',
  IN_TRANSIT: 'bg-blue-100 text-blue-700',
  ARRIVED_AT_SITE: 'bg-orange-100 text-orange-700',
  UNLOADED: 'bg-teal-100 text-teal-700',
  RETURN_TRIP: 'bg-pink-100 text-pink-700',
  MN_EXPORT_RETURN: 'bg-fuchsia-100 text-fuchsia-700',
  CN_IMPORT_RETURN: 'bg-violet-100 text-violet-700',
  TRANSFER: 'bg-lime-100 text-lime-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export interface Order {
  id: number;
  code: string;
  companyId: number;
  origin: string;
  destination: string;
  vehicleId: number | null;
  status: OrderStatus;
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
