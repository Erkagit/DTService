import { Order, OrderStatus } from '@/types/types';
import { OrderCard } from './OrderCard';
import { getPreviousStatus, getNextStatus } from '@/utils/orderStatusFlow';

interface OrderListProps {
  orders: Order[];
  isLoading: boolean;
  canUpdateStatus: (order: Order) => boolean;
  onStatusUpdate: (orderId: number, newStatus: OrderStatus) => void;
}

/**
 * Grid container for displaying order cards
 * Handles responsive layout and loading skeletons
 */
export function OrderList({
  orders,
  isLoading,
  canUpdateStatus,
  onStatusUpdate,
}: OrderListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-white rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {orders.map((order) => {
        const previousStatus = getPreviousStatus(order.status as OrderStatus);
        const nextStatus = getNextStatus(order.status as OrderStatus);
        
        return (
          <OrderCard
            key={order.id}
            order={order}
            canUpdateStatus={canUpdateStatus(order)}
            previousStatus={previousStatus}
            nextStatus={nextStatus}
            onStatusUpdate={(newStatus) => onStatusUpdate(order.id, newStatus)}
          />
        );
      })}
    </div>
  );
}
