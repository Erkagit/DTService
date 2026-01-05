/**
 * Order status utility functions
 * Reusable functions for order status management
 */

import { type OrderStatus } from '@/types/types';

/**
 * Sequential order of statuses for workflow
 */
export const STATUS_ORDER: OrderStatus[] = [
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

/**
 * Allowed status transitions - Sequential workflow with cancel option at each step
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
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

/**
 * Get previous status in the workflow
 * @param currentStatus - Current order status
 * @returns Previous status or null if at the beginning
 */
export const getPreviousStatus = (currentStatus: OrderStatus): OrderStatus | null => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  return currentIndex <= 0 ? null : STATUS_ORDER[currentIndex - 1];
};

/**
 * Get next status in the workflow
 * @param currentStatus - Current order status
 * @returns Next status or null if at the end
 */
export const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  return currentIndex === -1 || currentIndex >= STATUS_ORDER.length - 1 
    ? null 
    : STATUS_ORDER[currentIndex + 1];
};

/**
 * Check if user can update order status
 * @param order - Order object
 * @param isAdmin - Whether user is admin
 * @returns Boolean indicating if status can be updated
 */
export const canUpdateOrderStatus = (order: any, isAdmin: boolean): boolean => {
  return isAdmin && order.status !== 'COMPLETED' && order.status !== 'CANCELLED';
};

/**
 * Check if order is completed (COMPLETED or CANCELLED)
 * @param status - Order status
 * @returns Boolean indicating if order is finished
 */
export const isOrderCompleted = (status: OrderStatus): boolean => {
  return status === 'COMPLETED' || status === 'CANCELLED';
};

/**
 * Check if order is active (not COMPLETED or CANCELLED)
 * @param status - Order status
 * @returns Boolean indicating if order is active
 */
export const isOrderActive = (status: OrderStatus): boolean => {
  return status !== 'COMPLETED' && status !== 'CANCELLED';
};
