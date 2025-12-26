import { X, Users, Package, Mail, Calendar, User as UserIcon, MapPin, Truck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/types';
import type { User, Order } from '@/types/types';

interface CompanyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: {
    id: number;
    name: string;
    users?: User[];
    orders?: Order[];
    _count?: {
      users: number;
      orders: number;
    };
  } | null;
}

export function CompanyDetailsModal({ isOpen, onClose, company }: CompanyDetailsModalProps) {
  if (!company) return null;

  const users = company.users || [];
  const orders = company.orders || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={company.name} size="lg">
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 text-purple-700 mb-1">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Users</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{users.length}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <Package className="w-5 h-5" />
              <span className="text-sm font-medium">Orders</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
          </div>
        </div>

        {/* Users Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Users
          </h3>
          {users.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          user.role === 'ADMIN' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role === 'CLIENT_ADMIN' ? 'Client Admin' : user.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No users yet</p>
            </div>
          )}
        </div>

        {/* Orders Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Orders
          </h3>
          {orders.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <p className="font-semibold text-gray-900">{order.code}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      ORDER_STATUS_COLORS[order.status]
                    }`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-green-500" />
                      <span className="truncate">{order.origin}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-red-500" />
                      <span className="truncate">{order.destination}</span>
                    </div>
                    {order.vehicle && (
                      <div className="flex items-center gap-2">
                        <Truck className="w-3 h-3 text-blue-500" />
                        <span>{order.vehicle.plateNo} - {order.vehicle.driverName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>Created {new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
