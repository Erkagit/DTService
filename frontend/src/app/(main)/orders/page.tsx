'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, vehiclesApi, companiesApi } from '@/services/api';
import { Package, Plus } from 'lucide-react';
import { type OrderStatus } from '@/types/types';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage } from '@/context/LanguageProvider';
import api from '@/services/api';
import { PageHeader, Button, EmptyState, CompletedOrdersTable } from '@/components/ui';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { CreateOrderModal, StatusUpdateModal, OrderCard, ChangeVehicleModal } from './components';
import { CompletedOrderModal } from '../reports/components';
import { 
  formatDate, 
  formatCurrency, 
  ALLOWED_TRANSITIONS, 
  getPreviousStatus, 
  getNextStatus, 
  canUpdateOrderStatus,
  isOrderActive,
  isOrderCompleted
} from '@/utils';

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showChangeVehicleModal, setShowChangeVehicleModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);
  const [changingVehicleOrderId, setChangingVehicleOrderId] = useState<number | null>(null);
  const [viewingOrder, setViewingOrder] = useState<any>(null);
  
  // CLIENT_ADMIN can only VIEW orders, not modify them
  // Use uppercase comparison for consistency
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  
  const [formData, setFormData] = useState({
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
      if (user?.role?.toUpperCase() === 'CLIENT_ADMIN' && user.companyId) {
        filteredOrders = filteredOrders.filter((order: any) => order.companyId === user.companyId);
      }
      
      // Sort by createdAt descending (newest first)
      return filteredOrders.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    // Only fetch when auth is loaded
    enabled: !authLoading,
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
    enabled: user?.role?.toUpperCase() === 'ADMIN',
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
      console.log('🔄 deleteOrderMutation: Starting delete for orderId:', orderId);
      setDeletingOrderId(orderId);
      const response = await ordersApi.delete(orderId);
      console.log('🔄 deleteOrderMutation: Response received', response);
      return response;
    },
    onSuccess: () => {
      console.log('✅ deleteOrderMutation: Success!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      alert('✅ ' + t('orders.deleteSuccess'));
    },
    onError: (error: any) => {
      console.error('❌ deleteOrderMutation: Error!', error);
      alert('❌ ' + (error.response?.data?.error || t('orders.deleteFailed')));
    },
    onSettled: () => {
      console.log('🔄 deleteOrderMutation: Settled');
      setDeletingOrderId(null);
    },
  });

  const handleCreateClick = () => {
    setShowCreateForm(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateForm(false);
    setFormData({
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

  const canUpdateStatus = (order: any) => canUpdateOrderStatus(order, isAdmin);

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
    console.log('📋 handleDeleteOrder called', { orderId: order.id, orderCode: order.code });
    if (confirm(`"${order.code}" ${t('orders.deleteConfirm')}`)) {
      console.log('📋 User confirmed delete, calling mutation...');
      deleteOrderMutation.mutate(order.id);
    } else {
      console.log('📋 User cancelled delete');
    }
  };

  const handleChangeVehicle = (order: any) => {
    console.log('📋 handleChangeVehicle called', { orderId: order.id, orderCode: order.code });
    setSelectedOrder(order);
    setShowChangeVehicleModal(true);
  };

  const changeVehicleMutation = useMutation({
    mutationFn: async ({ orderId, vehicleId }: { orderId: number; vehicleId: string | null }) => {
      console.log('🔄 changeVehicleMutation: Starting change for', { orderId, vehicleId });
      setChangingVehicleOrderId(orderId);
      const response = await ordersApi.updateVehicle(orderId, vehicleId);
      console.log('🔄 changeVehicleMutation: Response received', response);
      return response;
    },
    onSuccess: () => {
      console.log('✅ changeVehicleMutation: Success!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setShowChangeVehicleModal(false);
      setSelectedOrder(null);
      alert('✅ Машин амжилттай солигдлоо!');
    },
    onError: (error: any) => {
      console.error('❌ changeVehicleMutation: Error!', error);
      alert('❌ ' + (error?.response?.data?.error || 'Машин солихэд алдаа гарлаа'));
    },
    onSettled: () => {
      console.log('🔄 changeVehicleMutation: Settled');
      setChangingVehicleOrderId(null);
    },
  });

  const handleSubmitChangeVehicle = (orderId: number, vehicleId: string | null) => {
    console.log('📋 handleSubmitChangeVehicle called', { orderId, vehicleId });
    changeVehicleMutation.mutate({ orderId, vehicleId });
  };

  if (!user) {
    router.push('/');
    return null;
  }

  // Separate active and completed orders
  const activeOrders = orders?.filter(order => isOrderActive(order.status)) || [];
  const completedOrders = orders?.filter(order => isOrderCompleted(order.status)) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        icon={<Package className="w-8 h-8 text-white" />}
        title={t('orders.title')}
        subtitle={t('orders.subtitle')}
        action={
          isAdmin ? (
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

      {selectedOrder && (
        <ChangeVehicleModal
          isOpen={showChangeVehicleModal}
          onClose={() => {
            setShowChangeVehicleModal(false);
            setSelectedOrder(null);
          }}
          onSubmit={handleSubmitChangeVehicle}
          order={selectedOrder}
          vehicles={vehicles || []}
          isLoading={changeVehicleMutation.isPending}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {isLoading ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
            <GridSkeleton count={6} />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-visible">
                  {activeOrders.map((order: any) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      canUpdate={isAdmin && canUpdateStatus(order)}
                      previousStatus={isAdmin ? getPreviousStatus(order.status as OrderStatus) : null}
                      nextStatus={isAdmin ? getNextStatus(order.status as OrderStatus) : null}
                      onQuickUpdate={isAdmin ? handleQuickStatusUpdate : undefined}
                      onDelete={isAdmin ? handleDeleteOrder : undefined}
                      onChangeVehicle={isAdmin ? handleChangeVehicle : undefined}
                      isDeleting={deletingOrderId === order.id}
                      isChangingVehicle={changingVehicleOrderId === order.id}
                      isAdmin={isAdmin}
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

            {/* Completed Orders Section - Table Format */}
            <section>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('orders.completed')}</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
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
              
              {showCompleted && (
                <CompletedOrdersTable
                  orders={completedOrders}
                  onViewOrder={setViewingOrder}
                  isAdmin={isAdmin}
                  showCompany={true}
                  showAmount={true}
                  itemsPerPage={10}
                  emptyMessage={t('orders.noActive')}
                />
              )}
            </section>
          </>
        ) : (
          <EmptyState
            icon={Package}
            title={t('orders.noOrders')}
            description={t('orders.createFirst')}
          />
        )}
      </main>

      {/* Completed Order Detail Modal */}
      {viewingOrder && (
        <CompletedOrderModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
