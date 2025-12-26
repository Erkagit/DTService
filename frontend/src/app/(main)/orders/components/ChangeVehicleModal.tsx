import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Order, Vehicle } from '@/types/types';

interface ChangeVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  vehicles: Vehicle[];
  isLoading?: boolean;
  onSubmit: (orderId: number, vehicleId: string | null) => void;
}

export function ChangeVehicleModal({
  isOpen,
  onClose,
  order,
  vehicles,
  isLoading,
  onSubmit,
}: ChangeVehicleModalProps) {
  const [vehicleId, setVehicleId] = useState(order?.vehicleId?.toString() || '');

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Машин солих" size="md">
      <form
        onSubmit={e => {
          e.preventDefault();
          onSubmit(order.id, vehicleId || null);
        }}
        className="space-y-4"
      >
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Захиалга:</p>
          <p className="text-lg font-mono font-semibold text-blue-600">{order.code}</p>
        </div>

        <Select label="Шинэ тээврийн хэрэгсэл" value={vehicleId} onChange={e => setVehicleId(e.target.value)}>
          <option value="">Машин сонгохгүй</option>
          {vehicles.map(vehicle => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.plateNo} - {vehicle.driverName}
            </option>
          ))}
        </Select>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Болих
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            Солих
          </Button>
        </div>
      </form>
    </Modal>
  );
}