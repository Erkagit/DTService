'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, vehiclesApi, companiesApi } from '@/services/api';
import { Package, Plus } from 'lucide-react';
import { type OrderStatus } from '@/types/types';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage } from '@/context/LanguageProvider';
import api from '@/services/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { CreateOrderModal, StatusUpdateModal, OrderCard } from './components';

// Allowed status transitions - Sequential workflow with cancel option at each step
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['LOADING', 'CANCELLED'],
  LOADING: ['TRANSFER_LOADING', 'CANCELLED'],
  TRANSFER_LOADING: ['CN_EXPORT_CUSTOMS', 'CANCELLED'],
  CN_EXPORT_CUSTOMS: ['MN_IMPORT_CUSTOMS', 'CANCELLED'],
  MN_IMPORT_CUSTOMS: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['ARRIVED_AT_SITE', 'CANCELLED'],
  ARRIVED_AT_SITE: ['UNLOADED', 'CANCELLED'],
  UNLOADED: ['RETURN_TRIP', 'CANCELLED'],
  RETURN_TRIP: ['MN_EXPORT_RETURN', 'CANCELLED'],
  MN_EXPORT_RETURN: ['CN_IMPORT_RETURN', 'CANCELLED'],
  CN_IMPORT_RETURN: ['TRANSFER', 'CANCELLED'],
  TRANSFER: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: []
};

export default function OrdersPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    origin: '',
    destination: '',
    vehicleId: '',
    companyId: String(user?.companyId || ''),
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await ordersApi.getAll();
      let filteredOrders = res.data;
      
      // Filter orders for CLIENT_ADMIN - only show their company's orders
      if (user?.role === 'CLIENT_ADMIN' && user.companyId) {
        filteredOrders = filteredOrders.filter((order: any) => order.companyId === user.companyId);
      }
      
      // Sort by createdAt descending (newest first)
      return filteredOrders.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
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
      // For non-admin users with a companyId, use their company
      // For admin users, require company selection
      const finalCompanyId = user?.companyId || data.companyId;
      
      if (!finalCompanyId) {
        throw new Error('Company is required');
      }

      const payload = {
        code: data.code,
        origin: data.origin,
        destination: data.destination,
        vehicleId: data.vehicleId ? parseInt(data.vehicleId) : undefined,
        companyId: parseInt(finalCompanyId),
        createdById: user?.id,
      };
      return ordersApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      handleCloseCreateModal();
      alert('✅ ' + t('orders.createSuccess'));
    },
    onError: (error: any) => {
      alert('❌ ' + (error.response?.data?.error || t('orders.createFailed')));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, note }: { orderId: number; status: OrderStatus; note?: string }) => {
      return api.patch(`/api/orders/${orderId}/status`, { status, note });
    },
    onMutate: async ({ orderId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      
      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData(['orders']);
      
      // Optimistically update to the new value (update status but keep position)
      queryClient.setQueryData(['orders'], (old: any) => {
        if (!old) return old;
        return old.map((order: any) => 
          order.id === orderId 
            ? { ...order, status }
            : order
        );
      });
      
      // Return context with the previous orders
      return { previousOrders };
    },
    onError: (error: any, variables, context) => {
      // Rollback on error
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders'], context.previousOrders);
      }
      alert('❌ ' + (error.response?.data?.error || t('orders.statusUpdateFailed')));
    },
    onSuccess: () => {
      // Refetch to get the latest data from server
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      handleCloseStatusModal();
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return ordersApi.delete(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      alert('✅ ' + t('orders.deleteSuccess'));
    },
    onError: (error: any) => {
      alert('❌ ' + (error.response?.data?.error || t('orders.deleteFailed')));
    },
  });

  const generateOrderCode = (count: number) => {
    const year = new Date().getFullYear();
    return `Achir Bayron LLC-${year}-${String(count).padStart(4, '0')}`;
  };  const handleCreateClick = () => {
    setFormData({ ...formData, code: generateOrderCode(orders?.length || 0) });
    setShowCreateForm(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateForm(false);
    setFormData({
      code: '',
      origin: '',
      destination: '',
      vehicleId: '',
      companyId: String(user?.companyId || ''),
    });
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setSelectedOrder(null);
    setSelectedStatus('');
    setStatusNote('');
  };

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

  const canUpdateStatus = (order: any) => {
    return user?.role === 'ADMIN' && order.status !== 'COMPLETED' && order.status !== 'CANCELLED';
  };

  const STATUS_ORDER: OrderStatus[] = [
    'PENDING',
    'LOADING',
    'TRANSFER_LOADING',
    'CN_EXPORT_CUSTOMS',
    'MN_IMPORT_CUSTOMS',
    'IN_TRANSIT',
    'ARRIVED_AT_SITE',
    'UNLOADED',
    'RETURN_TRIP',
    'MN_EXPORT_RETURN',
    'CN_IMPORT_RETURN',
    'TRANSFER',
    'COMPLETED'
  ];

  const getPreviousStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    return currentIndex <= 0 ? null : STATUS_ORDER[currentIndex - 1];
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    return currentIndex === -1 || currentIndex >= STATUS_ORDER.length - 1 ? null : STATUS_ORDER[currentIndex + 1];
  };

  const handleQuickStatusUpdate = (order: any, newStatus: OrderStatus) => {
    if (confirm(`${order.code} ${t('orders.statusUpdateConfirm')} ${newStatus.replace(/_/g, ' ')}?`)) {
      updateStatusMutation.mutate({
        orderId: order.id,
        status: newStatus,
        note: undefined
      });
    }
  };

  const handleDeleteOrder = (order: any) => {
    if (confirm(`"${order.code}" ${t('orders.deleteConfirm')}`)) {
      deleteOrderMutation.mutate(order.id);
    }
  };

  if (!user) {
    router.push('/');
    return null;
  }

  // Separate active and completed orders
  const activeOrders = orders?.filter(order => 
    order.status !== 'COMPLETED' && order.status !== 'CANCELLED'
  ) || [];
  
  const completedOrders = orders?.filter(order => 
    order.status === 'COMPLETED' || order.status === 'CANCELLED'
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        icon={<Package className="w-8 h-8 text-white" />}
        title={t('orders.title')}
        subtitle={t('orders.subtitle')}
        action={
          user.role === 'ADMIN' ? (
            <Button icon={Plus} onClick={handleCreateClick}>
              {t('orders.new')}
            </Button>
          ) : undefined
        }
      />

      <CreateOrderModal
        isOpen={showCreateForm}
        onClose={handleCloseCreateModal}
        onSubmit={handleSubmit}
        formData={formData}
        onChange={setFormData}
        vehicles={vehicles || []}
        companies={companies}
        isAdmin={user.role === 'ADMIN'}
        isLoading={createOrderMutation.isPending}
      />

      {selectedOrder && (
        <StatusUpdateModal
          isOpen={showStatusModal}
          onClose={handleCloseStatusModal}
          onSubmit={handleStatusUpdate}
          order={selectedOrder}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          statusNote={statusNote}
          onNoteChange={setStatusNote}
          allowedTransitions={ALLOWED_TRANSITIONS[selectedOrder.status as OrderStatus] || []}
          isLoading={updateStatusMutation.isPending}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-white rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <>
            {/* Active Orders Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('orders.active')}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {activeOrders.length} {t('orders.inProgress')}
                  </p>
                </div>
              </div>
              
              {activeOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeOrders.map((order: any) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      canUpdate={canUpdateStatus(order)}
                      previousStatus={getPreviousStatus(order.status as OrderStatus)}
                      nextStatus={getNextStatus(order.status as OrderStatus)}
                      onQuickUpdate={handleQuickStatusUpdate}
                      onDelete={user?.role === 'ADMIN' ? handleDeleteOrder : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">{t('orders.noActive')}</p>
                </div>
              )}
            </section>

            {/* Completed Orders Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('orders.completed')}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {completedOrders.length} {t('orders.orderCompleted')}
                  </p>
                </div>
                {completedOrders.length > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => setShowCompleted(!showCompleted)}
                  >
                    {showCompleted ? t('orders.hide') : t('orders.show')}
                  </Button>
                )}
              </div>
              
              {showCompleted && completedOrders.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
                  {completedOrders.map((order: any) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      canUpdate={false}
                      previousStatus={null}
                      nextStatus={null}
                      onQuickUpdate={handleQuickStatusUpdate}
                      onDelete={user?.role === 'ADMIN' ? handleDeleteOrder : undefined}
                    />
                  ))}
                </div>
              )}
              
              {!showCompleted && completedOrders.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                  <p className="text-gray-600">
                    {completedOrders.length} {t('orders.completedHidden')}
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => setShowCompleted(true)}
                    className="mt-3"
                  >
                    {t('orders.showCompleted')}
                  </Button>
                </div>
              )}
            </section>
          </>
        ) : (
          <EmptyState
            icon={Package}
            title={t('orders.noOrders')}
            description={t('orders.createFirst')}
            actionLabel={t('orders.create')}
            onAction={handleCreateClick}
          />
        )}
      </main>
    </div>
  );
}
