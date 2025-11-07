import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, vehiclesApi, companiesApi } from '@/services/api';
import api from '@/services/api';
import { OrderStatus } from '@/types/types';

/**
 * Custom hook for managing orders data and mutations
 * Encapsulates all order-related queries and mutations
 */
export function useOrders() {
  const queryClient = useQueryClient();

  // Query for fetching all orders
  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await ordersApi.getAll();
      return res.data;
    },
  });

  // Query for fetching vehicles
  const vehiclesQuery = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const res = await vehiclesApi.getAll();
      return res.data;
    },
  });

  // Query for fetching companies (for admins)
  // NOTE: This query is disabled by default. It should be enabled
  // by the consuming component based on user role (e.g., enabled: user?.role === 'ADMIN')
  const companiesQuery = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await companiesApi.getAll();
      return res.data;
    },
    enabled: false,
  });

  // Mutation for creating a new order
  const createOrderMutation = useMutation({
    mutationFn: async (data: {
      code: string;
      origin: string;
      destination: string;
      vehicleId?: number;
      companyId?: number;
    }) => {
      const payload = {
        code: data.code,
        origin: data.origin,
        destination: data.destination,
        vehicleId: data.vehicleId,
        companyId: data.companyId,
      };
      return ordersApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // Mutation for updating order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
      note,
    }: {
      orderId: number;
      status: OrderStatus;
      note?: string;
    }) => {
      return api.patch(`/api/orders/${orderId}/status`, { status, note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    // Queries
    orders: ordersQuery.data,
    isLoadingOrders: ordersQuery.isLoading,
    vehicles: vehiclesQuery.data,
    companies: companiesQuery.data,
    
    // Mutations
    createOrder: createOrderMutation.mutate,
    isCreatingOrder: createOrderMutation.isPending,
    
    updateStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
    
    // Mutation objects - provide access to mutation states and additional methods
    // Use these when you need: isLoading, isError, error details, reset(), etc.
    createOrderMutation,
    updateStatusMutation,
  };
}
