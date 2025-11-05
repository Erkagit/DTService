'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '@/services/api';
import api from '@/services/api';
import { Truck, ArrowLeft, Activity, Plus, X, User, Phone } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';

export default function VehiclesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  
  const [vehicleForm, setVehicleForm] = useState({
    plateNo: '',
    driverName: '',
    driverPhone: '',
    deviceId: '',
  });

  const [deviceForm, setDeviceForm] = useState({
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
      setShowCreateForm(false);
      setVehicleForm({ plateNo: '', driverName: '', driverPhone: '', deviceId: '' });
      alert('Vehicle created successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to create vehicle');
    },
  });

  const createDeviceMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/api/devices', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setShowDeviceForm(false);
      setDeviceForm({ deviceId: '' });
      alert('Device created successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to create device');
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

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center gap-3">
                <Truck className="w-8 h-8 text-green-600" />
                <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
              </div>
            </div>
            <div className="flex gap-2">
              {user.role === 'ADMIN' && (
                <button
                  onClick={() => setShowDeviceForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  New Device
                </button>
              )}
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Plus className="w-5 h-5" />
                New Vehicle
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Create Vehicle Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add New Vehicle</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <form onSubmit={handleVehicleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plate Number *
                </label>
                <input
                  type="text"
                  value={vehicleForm.plateNo}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, plateNo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="UBX-1234"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver Name *
                </label>
                <input
                  type="text"
                  value={vehicleForm.driverName}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Батаа"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver Phone *
                </label>
                <input
                  type="tel"
                  value={vehicleForm.driverPhone}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, driverPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+976-99001122"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GPS Device (Optional)
                </label>
                <select
                  value={vehicleForm.deviceId}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, deviceId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">No device</option>
                  {devices?.map((device: any) => (
                    <option key={device.id} value={device.id}>
                      {device.deviceId}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createVehicleMutation.isPending}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {createVehicleMutation.isPending ? 'Creating...' : 'Create Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Device Modal */}
      {showDeviceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create New Device</h2>
              <button
                onClick={() => setShowDeviceForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <form onSubmit={handleDeviceSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device ID *
                </label>
                <input
                  type="text"
                  value={deviceForm.deviceId}
                  onChange={(e) => setDeviceForm({ deviceId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="GPS-0002"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeviceForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDeviceMutation.isPending}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                >
                  {createDeviceMutation.isPending ? 'Creating...' : 'Create Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
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
              <div
                key={vehicle.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-3xl font-bold text-green-600 mb-2">{vehicle.plateNo}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{vehicle.driverName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{vehicle.driverPhone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Truck className="w-6 h-6 text-green-600" />
                  </div>
                </div>

                {vehicle.device && (
                  <div className="space-y-2 text-sm pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Activity className="w-4 h-4" />
                      <span>GPS: <span className="font-medium text-gray-900">{vehicle.device.deviceId}</span></span>
                    </div>
                    {vehicle.pings && vehicle.pings.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Last ping: {new Date(vehicle.pings[0].at).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles registered</h3>
            <p className="text-gray-500 mb-6">Add your first vehicle to start tracking</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Plus className="w-5 h-5" />
              Add Vehicle
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
