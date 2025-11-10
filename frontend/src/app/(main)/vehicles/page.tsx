'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '@/services/api';
import api from '@/services/api';
import { Truck, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { PageHeader, Button, EmptyState } from '@/components/ui';
import { CreateVehicleModal, CreateDeviceModal, VehicleCard, EditVehicleModal, EditDeviceModal } from './components';

export default function VehiclesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreateVehicle, setShowCreateVehicle] = useState(false);
  const [showCreateDevice, setShowCreateDevice] = useState(false);
  const [showEditVehicle, setShowEditVehicle] = useState(false);
  const [showEditDevice, setShowEditDevice] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [editingDevice, setEditingDevice] = useState<any>(null);
  
  const [vehicleForm, setVehicleForm] = useState({
    plateNo: '',
    driverName: '',
    driverPhone: '',
    deviceId: '',
  });

  const [editVehicleForm, setEditVehicleForm] = useState({
    plateNo: '',
    driverName: '',
    driverPhone: '',
    deviceId: '',
  });

  const [deviceForm, setDeviceForm] = useState({
    deviceId: '',
  });

  const [editDeviceForm, setEditDeviceForm] = useState({
    deviceId: '',
  });

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const res = await vehiclesApi.getAll();
      return res.data;
    },
  });

  const { data: devices } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const res = await api.get('/api/devices');
      return res.data;
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/api/vehicles', {
        plateNo: data.plateNo,
        driverName: data.driverName,
        driverPhone: data.driverPhone,
        deviceId: data.deviceId ? parseInt(data.deviceId) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setShowCreateVehicle(false);
      setVehicleForm({ plateNo: '', driverName: '', driverPhone: '', deviceId: '' });
      alert('✅ Тээврийн хэрэгсэл амжилттай үүсгэлээ!');
    },
    onError: (error: any) => {
      alert('❌ ' + (error.response?.data?.error || 'Тээврийн хэрэгсэл үүсгэх амжилтгүй боллоо'));
    },
  });

  const createDeviceMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/api/devices', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setShowCreateDevice(false);
      setDeviceForm({ deviceId: '' });
      alert('✅ Төхөөрөмж амжилттай үүсгэлээ!');
    },
    onError: (error: any) => {
      alert('❌ ' + (error.response?.data?.error || 'Төхөөрөмж үүсгэх амжилтгүй боллоо'));
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return api.put(`/api/vehicles/${id}`, {
        plateNo: data.plateNo,
        driverName: data.driverName,
        driverPhone: data.driverPhone,
        deviceId: data.deviceId ? parseInt(data.deviceId) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setShowEditVehicle(false);
      setEditingVehicle(null);
      setEditVehicleForm({ plateNo: '', driverName: '', driverPhone: '', deviceId: '' });
      alert('✅ Тээврийн хэрэгсэл амжилттай шинэчлэгдлээ!');
    },
    onError: (error: any) => {
      alert('❌ ' + (error.response?.data?.error || 'Тээврийн хэрэгсэл шинэчлэх амжилтгүй боллоо'));
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/api/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      alert('✅ Тээврийн хэрэгсэл амжилттай устгагдлаа!');
    },
    onError: (error: any) => {
      alert('❌ ' + (error.response?.data?.error || 'Тээврийн хэрэгсэл устгах амжилтгүй боллоо'));
    },
  });

  const updateDeviceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return api.put(`/api/devices/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setShowEditDevice(false);
      setEditingDevice(null);
      setEditDeviceForm({ deviceId: '' });
      alert('✅ Төхөөрөмж амжилттай шинэчлэгдлээ!');
    },
    onError: (error: any) => {
      alert('❌ ' + (error.response?.data?.error || 'Төхөөрөмж шинэчлэх амжилтгүй боллоо'));
    },
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/api/devices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      alert('✅ Төхөөрөмж амжилттай устгагдлаа!');
    },
    onError: (error: any) => {
      alert('❌ ' + (error.response?.data?.error || 'Төхөөрөмж устгах амжилтгүй боллоо'));
    },
  });

  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createVehicleMutation.mutate(vehicleForm);
  };

  const handleDeviceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDeviceMutation.mutate(deviceForm);
  };

  const handleEditVehicle = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setEditVehicleForm({
      plateNo: vehicle.plateNo,
      driverName: vehicle.driverName,
      driverPhone: vehicle.driverPhone,
      deviceId: vehicle.deviceId ? vehicle.deviceId.toString() : '',
    });
    setShowEditVehicle(true);
  };

  const handleUpdateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    updateVehicleMutation.mutate({ id: editingVehicle.id, data: editVehicleForm });
  };

  const handleDeleteVehicle = (vehicle: any) => {
    if (confirm(`Are you sure you want to delete vehicle "${vehicle.plateNo}"? This action cannot be undone.`)) {
      deleteVehicleMutation.mutate(vehicle.id);
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        icon={<Truck className="w-8 h-8 text-green-600" />}
        title="Тээврийн хэрэгсэл"
        subtitle="Тээврийн хэрэгсэл болон GPS төхөөрөмж удирдлага"
        action={
          <div className="flex gap-2">
            {user.role === 'ADMIN' && (
              <Button
                variant="secondary"
                onClick={() => setShowCreateDevice(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Шинэ төхөөрөмж
              </Button>
            )}
            <Button
              variant="success"
              onClick={() => setShowCreateVehicle(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Шинэ тээврийн хэрэгсэл
            </Button>
          </div>
        }
      />

      <CreateVehicleModal
        isOpen={showCreateVehicle}
        onClose={() => setShowCreateVehicle(false)}
        onSubmit={handleVehicleSubmit}
        formData={vehicleForm}
        onChange={setVehicleForm}
        devices={devices}
        isLoading={createVehicleMutation.isPending}
      />

      <CreateDeviceModal
        isOpen={showCreateDevice}
        onClose={() => setShowCreateDevice(false)}
        onSubmit={handleDeviceSubmit}
        formData={deviceForm}
        onChange={setDeviceForm}
        isLoading={createDeviceMutation.isPending}
      />

      <EditVehicleModal
        isOpen={showEditVehicle}
        onClose={() => {
          setShowEditVehicle(false);
          setEditingVehicle(null);
          setEditVehicleForm({ plateNo: '', driverName: '', driverPhone: '', deviceId: '' });
        }}
        onSubmit={handleUpdateVehicle}
        vehicle={editingVehicle}
        formData={editVehicleForm}
        onChange={setEditVehicleForm}
        devices={devices || []}
        isLoading={updateVehicleMutation.isPending}
      />

      <EditDeviceModal
        isOpen={showEditDevice}
        onClose={() => {
          setShowEditDevice(false);
          setEditingDevice(null);
          setEditDeviceForm({ deviceId: '' });
        }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!editingDevice) return;
          updateDeviceMutation.mutate({ id: editingDevice.id, data: editDeviceForm });
        }}
        device={editingDevice}
        formData={editDeviceForm}
        onChange={setEditDeviceForm}
        isLoading={updateDeviceMutation.isPending}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-white rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : vehicles && vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle}
                onEdit={handleEditVehicle}
                onDelete={handleDeleteVehicle}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Truck}
            title="Бүртгэлтэй тээврийн хэрэгсэл байхгүй"
            description="Эхний тээврийн хэрэгслээ нэмж хяналт эхлүүлнэ үү"
            actionLabel="Тээврийн хэрэгсэл нэмэх"
            onAction={() => setShowCreateVehicle(true)}
          />
        )}
      </main>
    </div>
  );
}
