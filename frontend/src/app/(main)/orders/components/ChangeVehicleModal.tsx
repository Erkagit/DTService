import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Truck, MapPin, Building2 } from 'lucide-react';
import type { Order, Vehicle } from '@/types/types';

interface ExtendedVehicle extends Vehicle {
  isAvailable?: boolean;
  activeOrder?: {
    id: number;
    code: string;
    status: string;
    company?: { name: string };
  } | null;
}

interface ChangeVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  vehicles: ExtendedVehicle[];
  isLoading?: boolean;
  onSubmit: (orderId: number, vehicleId: string | null) => void;
}

export function ChangeVehicleModal({
  isOpen,
  onClose,
  order,
  vehicles,
  isLoading = false,
  onSubmit,
}: ChangeVehicleModalProps) {
  const [vehicleId, setVehicleId] = useState(order?.vehicleId?.toString() || '');

  // Reset vehicleId when order changes
  useEffect(() => {
    if (order) {
      setVehicleId(order.vehicleId?.toString() || '');
    }
  }, [order?.id]);

  if (!order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(order.id, vehicleId || null);
  };

  const currentVehicle = order.vehicle;
  const selectedVehicle = vehicles.find(v => v.id.toString() === vehicleId);
  
  // Filter vehicles - available ones + current vehicle (so we can keep it selected)
  const availableVehicles = vehicles.filter(v => 
    v.isAvailable !== false || v.id === order.vehicleId
  );
  const unavailableVehicles = vehicles.filter(v => 
    v.isAvailable === false && v.id !== order.vehicleId
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Машин солих" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Захиалгын дугаар</p>
          <p className="text-lg font-mono font-bold text-gray-900">{order.code}</p>
          {order.company && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-2">
              <Building2 className="w-4 h-4" />
              <span>{order.company.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
            <MapPin className="w-4 h-4" />
            <span>{order.origin} → {order.destination}</span>
          </div>
        </div>

        {/* Current Vehicle */}
        {currentVehicle && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Одоогийн машин</p>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-900">{currentVehicle.plateNo}</span>
              <span className="text-gray-400">-</span>
              <span className="text-gray-600">{currentVehicle.driverName}</span>
            </div>
          </div>
        )}

        {/* Vehicle Select */}
        <div>
          <Select 
            label="Шинэ тээврийн хэрэгсэл" 
            value={vehicleId} 
            onChange={e => setVehicleId(e.target.value)}
          >
            <option value="">Машин сонгохгүй</option>
            {availableVehicles.length > 0 && (
              <optgroup label="✅ Боломжтой машинууд">
                {availableVehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plateNo} - {vehicle.driverName}
                    {vehicle.id === order.vehicleId ? ' (одоогийн)' : ''}
                  </option>
                ))}
              </optgroup>
            )}
            {unavailableVehicles.length > 0 && (
              <optgroup label="❌ Бусад захиалгад оноогдсон">
                {unavailableVehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id} disabled>
                    {vehicle.plateNo} - {vehicle.driverName} ({vehicle.activeOrder?.company?.name || 'Захиалгатай'})
                  </option>
                ))}
              </optgroup>
            )}
          </Select>
          {availableVehicles.length === 0 && (
            <p className="text-sm text-orange-600 mt-2">
              ⚠️ Боломжтой машин байхгүй байна.
            </p>
          )}
        </div>

        {/* Selected Vehicle Preview */}
        {selectedVehicle && selectedVehicle.id !== currentVehicle?.id && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <p className="text-xs text-green-600 mb-1">Сонгосон машин</p>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-green-500" />
              <span className="font-medium text-gray-900">{selectedVehicle.plateNo}</span>
              <span className="text-gray-400">-</span>
              <span className="text-gray-600">{selectedVehicle.driverName}</span>
            </div>
            {selectedVehicle.driverPhone && (
              <p className="text-sm text-gray-500 mt-1 ml-6">{selectedVehicle.driverPhone}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Болих
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={isLoading}
          >
            {isLoading ? 'Солиж байна...' : 'Солих'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}