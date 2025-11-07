// ============================================
// DOMAIN MODELS (Backend API Types)
// ============================================

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'CLIENT_ADMIN';
  companyId: number | null;
  company?: Company;
  createdAt: string;
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
  device?: Device;
  pings?: LocationPing[];
}

export interface Device {
  id: number;
  deviceId: string;
  createdAt: string;
  updatedAt: string;
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

// ============================================
// ORDER TYPES & ENUMS
// ============================================

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

// ============================================
// COMPONENT PROPS INTERFACES
// ============================================

// User Components
export interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    email: string;
    name: string;
    password: string;
    role: string;
    companyId: string;
  };
  onChange: (data: any) => void;
  companies: Array<{ id: number; name: string }>;
  isLoading: boolean;
}

// Company Components
export interface CompanyCardProps {
  company: Company;
  onAddUser: (company: Company) => void;
  onViewDetails: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: { name: string };
  onChange: (data: { name: string }) => void;
  isLoading: boolean;
}

export interface CreateUserForCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  company: { id: number; name: string } | null;
  formData: {
    email: string;
    name: string;
    password: string;
  };
  onChange: (data: { email: string; name: string; password: string }) => void;
  isLoading: boolean;
}

// Vehicle Components
export interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

export interface CreateVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    plateNo: string;
    driverName: string;
    driverPhone: string;
    deviceId: string;
  };
  onChange: (data: any) => void;
  devices: any[];
  isLoading: boolean;
}

export interface CreateDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    deviceId: string;
  };
  onChange: (data: any) => void;
  isLoading: boolean;
}

// Order Components
export interface OrderCardProps {
  order: Order;
  canUpdate: boolean;
  previousStatus: OrderStatus | null;
  nextStatus: OrderStatus | null;
  onQuickUpdate: (order: Order, status: OrderStatus) => void;
  onDelete?: (order: Order) => void;
}

export interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    code: string;
    origin: string;
    destination: string;
    vehicleId: string;
    companyId: string;
  };
  onChange: (data: any) => void;
  vehicles: any[];
  companies?: any[];
  isAdmin: boolean;
  isLoading: boolean;
}

export interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  order: any;
  selectedStatus: OrderStatus | '';
  onStatusChange: (status: OrderStatus | '') => void;
  statusNote: string;
  onNoteChange: (note: string) => void;
  allowedTransitions: OrderStatus[];
  isLoading: boolean;
}

