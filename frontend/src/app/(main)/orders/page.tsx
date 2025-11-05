'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, vehiclesApi, companiesApi } from '@/services/api';
import { Truck, Package, Plus, ArrowLeft, MapPin, User, Calendar, X, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/types/types';
import { useAuth } from '@/context/AuthProvider';
import api from '@/services/api';

// Allowed status transitions
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['LOADING', 'CANCELLED'],
  LOADING: ['IN_TRANSIT', 'TRANSFER_LOADING', 'CANCELLED'],
  TRANSFER_LOADING: ['IN_TRANSIT', 'CANCELLED'],
  CN_EXPORT_CUSTOMS: ['IN_TRANSIT', 'CANCELLED'],
  MN_IMPORT_CUSTOMS: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['ARRIVED_AT_SITE', 'TRANSFER_LOADING', 'CANCELLED'],
  ARRIVED_AT_SITE: ['UNLOADED'],
  UNLOADED: ['COMPLETED', 'RETURN_TRIP'],
  RETURN_TRIP: ['MN_EXPORT_RETURN', 'CN_IMPORT_RETURN', 'COMPLETED'],
  MN_EXPORT_RETURN: ['CN_IMPORT_RETURN', 'COMPLETED'],
  CN_IMPORT_RETURN: ['COMPLETED'],
  TRANSFER: ['IN_TRANSIT', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: []
};

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  
  const [formData, setFormData] = useState({
    code: '',
    origin: '',
    destination: '',
    vehicleId: '',
    companyId: user?.companyId || '',
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await ordersApi.getAll();
      return res.data;
    },
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const res = await vehiclesApi.getAll();
      return res.data;
    },
  });

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await companiesApi.getAll();
      return res.data;
    },
    enabled: user?.role === 'ADMIN',
  });

    const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        code: data.code,
        origin: data.origin,
        destination: data.destination,
        vehicleId: data.vehicleId ? parseInt(data.vehicleId) : undefined,
        companyId: data.companyId ? parseInt(data.companyId) : undefined,
      };
      return ordersApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setShowCreateForm(false);
      setFormData({
        code: '',
        origin: '',
        destination: '',
        vehicleId: '',
        companyId: user?.companyId || '',
      });
      alert('✅ Order created successfully!');
    },
    onError: (error: any) => {
      alert('❌ ' + (error.response?.data?.error || 'Failed to create order'));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, note }: { orderId: number; status: OrderStatus; note?: string }) => {
      return api.patch(`/api/orders/${orderId}/status`, { status, note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setShowStatusModal(false);
      setSelectedOrder(null);
      setSelectedStatus('');
      setStatusNote('');
      alert('✅ Order status updated successfully!');
    },
    onError: (error: any) => {
      alert('❌ ' + (error.response?.data?.error || 'Failed to update status'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrderMutation.mutate(formData);
  };

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedStatus) return;
    updateStatusMutation.mutate({
      orderId: selectedOrder.id,
      status: selectedStatus as OrderStatus,
      note: statusNote || undefined
    });
  };

  const openStatusModal = (order: any) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const canUpdateStatus = (order: any) => {
    // Only ADMIN and OPERATOR can update status
    if (!user || (user.role !== 'ADMIN' && user.role !== 'OPERATOR')) {
      return false;
    }
    // OPERATOR can only update their assigned orders
    if (user.role === 'OPERATOR' && order.assignedToId !== user.id) {
      return false;
    }
    // Can't update if already completed or cancelled
    return order.status !== 'COMPLETED' && order.status !== 'CANCELLED';
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  const generateOrderCode = () => {
    const date = new Date();
    const year = date.getFullYear();
    const count = (orders?.length || 0) + 1;
    return `DTS-${year}-${String(count).padStart(4, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                  <p className="text-sm text-gray-500">Delivery order management</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setFormData({ ...formData, code: generateOrderCode() });
                setShowCreateForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              New Order
            </button>
          </div>
        </div>
      </header>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create New Order</h2>
              <button onClick={() => setShowCreateForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="DTS-2025-0001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Origin *</label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ulaanbaatar"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination *</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Zamyn-Uud"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select vehicle...</option>
                  {vehicles?.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plateNo} - {vehicle.driverName}
                    </option>
                  ))}
                </select>
              </div>
              {user.role === 'ADMIN' && companies && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select company...</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={createOrderMutation.isPending} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                  {createOrderMutation.isPending ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Update Order Status</h2>
              <button onClick={() => {
                setShowStatusModal(false);
                setSelectedOrder(null);
                setSelectedStatus('');
                setStatusNote('');
              }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <form onSubmit={handleStatusUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Code</label>
                <input
                  type="text"
                  value={selectedOrder.code}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                <input
                  type="text"
                  value={selectedOrder.status.replace(/_/g, ' ')}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Status *</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | '')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select new status...</option>
                  {ALLOWED_TRANSITIONS[selectedOrder.status as OrderStatus]?.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note (optional)</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add any notes about this status change..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => {
                  setShowStatusModal(false);
                  setSelectedOrder(null);
                  setSelectedStatus('');
                  setStatusNote('');
                }} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={updateStatusMutation.isPending} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                  {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-white rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{order.code}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status as OrderStatus]}`}>
                    {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-gray-600">From: <span className="font-medium text-gray-900">{order.origin}</span></p>
                      <p className="text-gray-600">To: <span className="font-medium text-gray-900">{order.destination}</span></p>
                    </div>
                  </div>
                  {order.vehicle && (
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-medium">{order.vehicle.plateNo}</span>
                    </div>
                  )}
                  {order.assignedTo && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{order.assignedTo.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Create your first order to get started</p>
            <button
              onClick={() => {
                setFormData({ ...formData, code: generateOrderCode() });
                setShowCreateForm(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Create Order
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
