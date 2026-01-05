import { OrderStatus } from '@prisma/client';

// Order workflow status sequence
export const STATUS_ORDER: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.LOADING,
  OrderStatus.TRANSFER_LOADING,
  OrderStatus.CN_EXPORT_CUSTOMS,
  OrderStatus.MN_IMPORT_CUSTOMS,
  OrderStatus.IN_TRANSIT,
  OrderStatus.ARRIVED_AT_SITE,
  OrderStatus.UNLOADED,
  OrderStatus.RETURN_TRIP,
  OrderStatus.MN_EXPORT_RETURN,
  OrderStatus.CN_IMPORT_RETURN,
  OrderStatus.TRANSFER,
  OrderStatus.COMPLETED
];

// Allowed status transitions - Sequential workflow with cancel option at each step
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.LOADING, OrderStatus.CANCELLED],
  LOADING: [OrderStatus.TRANSFER_LOADING, OrderStatus.CANCELLED],
  TRANSFER_LOADING: [OrderStatus.CN_EXPORT_CUSTOMS, OrderStatus.CANCELLED],
  CN_EXPORT_CUSTOMS: [OrderStatus.MN_IMPORT_CUSTOMS, OrderStatus.CANCELLED],
  MN_IMPORT_CUSTOMS: [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
  IN_TRANSIT: [OrderStatus.ARRIVED_AT_SITE, OrderStatus.CANCELLED],
  ARRIVED_AT_SITE: [OrderStatus.UNLOADED, OrderStatus.CANCELLED],
  UNLOADED: [OrderStatus.RETURN_TRIP, OrderStatus.CANCELLED],
  RETURN_TRIP: [OrderStatus.MN_EXPORT_RETURN, OrderStatus.CANCELLED],
  MN_EXPORT_RETURN: [OrderStatus.CN_IMPORT_RETURN, OrderStatus.CANCELLED],
  CN_IMPORT_RETURN: [OrderStatus.TRANSFER, OrderStatus.CANCELLED],
  TRANSFER: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: []
};

// Get previous status in the workflow
export const getPreviousStatus = (currentStatus: OrderStatus): OrderStatus | null => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  if (currentIndex <= 0) return null;
  return STATUS_ORDER[currentIndex - 1];
};

// Get next status in the workflow
export const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex >= STATUS_ORDER.length - 1) {
    return null;
  }
  return STATUS_ORDER[currentIndex + 1];
};

// Check if status transition is valid
export const isValidTransition = (fromStatus: OrderStatus, toStatus: OrderStatus): boolean => {
  // Can't change from COMPLETED or CANCELLED
  if (fromStatus === OrderStatus.COMPLETED || fromStatus === OrderStatus.CANCELLED) {
    return false;
  }
  
  // Can always go to CANCELLED (except from COMPLETED)
  if (toStatus === OrderStatus.CANCELLED) {
    return true;
  }
  
  // Check if it's a forward transition
  const allowedForward = ALLOWED_TRANSITIONS[fromStatus] || [];
  if (allowedForward.includes(toStatus)) {
    return true;
  }
  
  // Check if it's a backward transition (one step back)
  const previousStatus = getPreviousStatus(fromStatus);
  if (previousStatus && previousStatus === toStatus) {
    return true;
  }
  
  return false;
};

// Check if order is completed
export const isOrderCompleted = (status: OrderStatus): boolean => {
  return status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED;
};

// Check if order is active
export const isOrderActive = (status: OrderStatus): boolean => {
  return !isOrderCompleted(status);
};
