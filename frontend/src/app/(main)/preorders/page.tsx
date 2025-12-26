'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preOrdersApi, companiesApi, vehiclesApi } from '@/services/api';
import { FileBox, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { CreatePreOrderModal, PreOrderCard, PreOrderDetailModal, CreateOrderFromPreOrderModal } from './components';
import type { PreOrder, VehicleType, TrailerType, ContainerOption } from '@/types/types';

interface PreOrderFormData {
  companyId: string;
  pickupAddress: string;
  deliveryAddress: string;
  name: string;
  weight: string;
  dimension: string;
  loadingCost: string;
  transportCost: string;
  transshipmentCost: string;
  exportCustomsCost: string;
  mongolTransportCost: string;
  importCustomsCost: string;
  profit: string;
  expense: string;
  totalAmount: string;
  invoice: boolean;
  packageList: boolean;
  originDoc: boolean;
  vehicleType: VehicleType;
  foreignVehicleCount: string;
  mongolVehicleCount: string;
  trailerType: TrailerType | '';
  hasContainer: ContainerOption;
  containerNumber: string;
  invoiceSent: boolean;
  paymentReceived: boolean;
  idleTime: boolean;
  transportDone: boolean;
}

export default function PreOrdersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPreOrder, setSelectedPreOrder] = useState<PreOrder | null>(null);

  // Order үүсгэх modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderPreOrder, setOrderPreOrder] = useState<PreOrder | null>(null);

  const { data: preOrders, isLoading } = useQuery({
    queryKey: ['preOrders'],
    queryFn: async () => {
      const res = await preOrdersApi.getAll();
      let filteredOrders = res.data;
      
      // Filter for CLIENT_ADMIN - only show their company's pre-orders
      if (user?.role === 'CLIENT_ADMIN' && user.companyId) {
        filteredOrders = filteredOrders.filter((po: PreOrder) => po.companyId === user.companyId);
      }
      
      // Sort by createdAt descending
      return filteredOrders.sort((a: PreOrder, b: PreOrder) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
  });

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await companiesApi.getAll();
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

  const createMutation = useMutation({
    mutationFn: (data: Partial<PreOrder>) => preOrdersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preOrders'] });
      setShowCreateModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => preOrdersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preOrders'] });
      setShowDeleteModal(false);
      setSelectedPreOrder(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PreOrder> }) => preOrdersApi.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['preOrders'] });
      // Update selected preOrder with latest data
      if (selectedPreOrder && response.data) {
        setSelectedPreOrder(response.data);
      }
    },
  });

  const handleUpdate = (data: Partial<PreOrder>) => {
    if (selectedPreOrder) {
      updateMutation.mutate({ id: selectedPreOrder.id, data });
    }
  };

  const handleCreate = (formData: PreOrderFormData) => {
    const data: Partial<PreOrder> = {
      companyId: formData.companyId ? parseInt(formData.companyId) : null,
      pickupAddress: formData.pickupAddress || null,
      deliveryAddress: formData.deliveryAddress || null,
      name: formData.name,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      dimension: formData.dimension || null,
      loadingCost: formData.loadingCost ? parseFloat(formData.loadingCost) : null,
      transportCost: formData.transportCost ? parseFloat(formData.transportCost) : null,
      transshipmentCost: formData.transshipmentCost ? parseFloat(formData.transshipmentCost) : null,
      exportCustomsCost: formData.exportCustomsCost ? parseFloat(formData.exportCustomsCost) : null,
      mongolTransportCost: formData.mongolTransportCost ? parseFloat(formData.mongolTransportCost) : null,
      importCustomsCost: formData.importCustomsCost ? parseFloat(formData.importCustomsCost) : null,
      profit: formData.profit ? parseFloat(formData.profit) : null,
      expense: formData.expense ? parseFloat(formData.expense) : null,
      totalAmount: formData.totalAmount ? parseFloat(formData.totalAmount) : null,
      invoice: formData.invoice,
      packageList: formData.packageList,
      originDoc: formData.originDoc,
      vehicleType: formData.vehicleType,
      foreignVehicleCount: formData.foreignVehicleCount ? parseInt(formData.foreignVehicleCount) : null,
      mongolVehicleCount: formData.mongolVehicleCount ? parseInt(formData.mongolVehicleCount) : null,
      trailerType: formData.trailerType || null,
      hasContainer: formData.hasContainer,
      containerNumber: formData.containerNumber || null,
      invoiceSent: formData.invoiceSent,
      paymentReceived: formData.paymentReceived,
      idleTime: formData.idleTime,
      transportDone: formData.transportDone,
    };
    createMutation.mutate(data);
  };

  const handleView = (preOrder: PreOrder) => {
    setSelectedPreOrder(preOrder);
    setShowDetailModal(true);
  };

  const handleDelete = (preOrder: PreOrder) => {
    setSelectedPreOrder(preOrder);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedPreOrder) {
      deleteMutation.mutate(selectedPreOrder.id);
    }
  };

  // Order үүсгэх товч дарахад дуудагдана
  const handleCreateOrder = (preOrder: PreOrder) => {
    setOrderPreOrder(preOrder);
    setShowOrderModal(true);
  };

  // PreOrder-оос Order үүсгэх submit handler
  const handleSubmitOrderFromPreOrder = async ({ preOrderId, vehicleId }: { preOrderId: number, vehicleId: string }) => {
    try {
      await preOrdersApi.createOrder(preOrderId, { vehicleId });
      setShowOrderModal(false);
      setOrderPreOrder(null);
      queryClient.invalidateQueries({ queryKey: ['preOrders'] });
      // Optionally, also refresh orders if needed
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      alert('✅ Order амжилттай үүсгэгдлээ!');
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Order үүсгэхэд алдаа гарлаа');
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  // Only ADMIN can access this page
  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <FileBox className="w-16 h-16 mb-4 text-gray-300" />
          <p className="text-lg">Хандах эрхгүй байна</p>
          <p className="text-sm">Энэ хуудсыг зөвхөн админ хандах боломжтой</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0">
      <PageHeader
        icon={<FileBox className="w-6 h-6 text-white" />}
        title="Урьдчилсан захиалга"
        subtitle="Урьдчилсан захиалгуудын жагсаалт"
        action={
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Шинээр үүсгэх
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : !preOrders || preOrders.length === 0 ? (
        <EmptyState
          icon={FileBox}
          title="Урьдчилсан захиалга байхгүй"
          description="Шинээр урьдчилсан захиалга үүсгэнэ үү"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {preOrders.map((preOrder: PreOrder) => (
            <PreOrderCard
              key={preOrder.id}
              preOrder={preOrder}
              onView={handleView}
              onDelete={handleDelete}
              onCreateOrder={handleCreateOrder}
            />
          ))}
        </div>
      )}

      <CreatePreOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        companies={companies || []}
        isLoading={createMutation.isPending}
      />

      <PreOrderDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedPreOrder(null);
        }}
        preOrder={selectedPreOrder}
        onUpdate={handleUpdate}
        isUpdating={updateMutation.isPending}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPreOrder(null);
        }}
        onConfirm={confirmDelete}
        title="Устгах уу?"
        message={`"${selectedPreOrder?.name}" урьдчилсан захиалгыг устгахдаа итгэлтэй байна уу?`}
        confirmLabel="Устгах"
        isLoading={deleteMutation.isPending}
      />

      <CreateOrderFromPreOrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        preOrder={orderPreOrder}
        vehicles={vehicles || []}
        isLoading={false}
        onSubmit={handleSubmitOrderFromPreOrder}
      />
    </div>
  );
}
