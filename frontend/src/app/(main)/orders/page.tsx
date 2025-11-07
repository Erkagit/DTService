'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '@/services/api';
import { OrderStatus, Order } from '@/types/types';
import { useAuth } from '@/context/AuthProvider';
import { useOrders } from '@/hooks/useOrders';
import { canUpdateStatus, getAllowedTransitions } from '@/utils/orderStatusFlow';
import { OrdersHeader } from '@/components/orders/OrdersHeader';
import { OrderList } from '@/components/orders/OrderList';
import { EmptyOrdersState } from '@/components/orders/EmptyOrdersState';
import { CreateOrderModal, CreateOrderFormData } from '@/components/orders/CreateOrderModal';
import { UpdateStatusModal } from '@/components/orders/UpdateStatusModal';

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const {
    orders,
    isLoadingOrders,
    vehicles,
    createOrderMutation,
    updateStatusMutation,
  } = useOrders();

  // Fetch companies only for admin users
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await companiesApi.getAll();
      return res.data;
    },
    enabled: user?.role === 'ADMIN',
  });

  // Generate order code
  const generateOrderCode = () => {
    const date = new Date();
    const year = date.getFullYear();
    const count = (orders?.length || 0) + 1;
    return `DTS-${year}-${String(count).padStart(4, '0')}`;
  };

  // Handle creating new order
  const handleCreateOrder = () => {
    setShowCreateForm(true);
  };

  // Handle create order form submission
  const handleCreateSubmit = (data: CreateOrderFormData) => {
    const payload = {
      code: data.code,
      origin: data.origin,
      destination: data.destination,
      vehicleId: data.vehicleId ? parseInt(data.vehicleId) : undefined,
      companyId: data.companyId ? parseInt(data.companyId) : undefined,
    };

    createOrderMutation.mutate(payload, {
      onSuccess: () => {
        setShowCreateForm(false);
        alert('✅ Order created successfully!');
      },
      onError: (error: any) => {
        alert('❌ ' + (error.response?.data?.error || 'Failed to create order'));
      },
    });
  };

  // Handle quick status update (from navigation buttons)
  const handleQuickStatusUpdate = (orderId: number, newStatus: OrderStatus) => {
    updateStatusMutation.mutate(
      { orderId, status: newStatus },
      {
        onSuccess: () => {
          alert('✅ Order status updated successfully!');
        },
        onError: (error: any) => {
          alert('❌ ' + (error.response?.data?.error || 'Failed to update status'));
        },
      }
    );
  };

  // Handle status update form submission
  const handleStatusUpdateSubmit = (data: { status: OrderStatus; note?: string }) => {
    if (!selectedOrder) return;

    updateStatusMutation.mutate(
      {
        orderId: selectedOrder.id,
        status: data.status,
        note: data.note,
      },
      {
        onSuccess: () => {
          setShowStatusModal(false);
          setSelectedOrder(null);
          alert('✅ Order status updated successfully!');
        },
        onError: (error: any) => {
          alert('❌ ' + (error.response?.data?.error || 'Failed to update status'));
        },
      }
    );
  };

  // Check if user can update order status
  const checkCanUpdateStatus = (order: Order) => {
    return canUpdateStatus(order, user);
  };

  // Redirect to login if not authenticated
  if (!user) {
    router.push('/login');
    return null;
  }

  const allowedStatuses = selectedOrder
    ? getAllowedTransitions(selectedOrder.status as OrderStatus)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <OrdersHeader onCreateOrder={handleCreateOrder} />

      <CreateOrderModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={createOrderMutation.isPending}
        userRole={user.role}
        defaultCompanyId={user.companyId ?? undefined}
        vehicles={vehicles}
        companies={companies}
        initialOrderCode={generateOrderCode()}
      />

      <UpdateStatusModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        allowedStatuses={allowedStatuses}
        onSubmit={handleStatusUpdateSubmit}
        isSubmitting={updateStatusMutation.isPending}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isLoadingOrders && (!orders || orders.length === 0) ? (
          <EmptyOrdersState onCreateOrder={handleCreateOrder} />
        ) : (
          <OrderList
            orders={orders || []}
            isLoading={isLoadingOrders}
            canUpdateStatus={checkCanUpdateStatus}
            onStatusUpdate={handleQuickStatusUpdate}
          />
        )}
      </main>
    </div>
  );
}
