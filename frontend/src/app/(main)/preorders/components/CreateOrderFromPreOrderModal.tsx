import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { PreOrder, Vehicle } from '@/types/types';

interface CreateOrderFromPreOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  preOrder: PreOrder | null;
  vehicles: Vehicle[];
  isLoading?: boolean;
  onSubmit: (data: any) => void;
}

export function CreateOrderFromPreOrderModal({
  isOpen,
  onClose,
  preOrder,
  vehicles,
  isLoading,
  onSubmit,
}: CreateOrderFromPreOrderModalProps) {
  const [vehicleId, setVehicleId] = useState('');

  if (!preOrder) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pre-order-оос Order үүсгэх" size="form">
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!vehicleId) return alert('Тээврийн хэрэгсэл сонгоно уу!');
          onSubmit({
            preOrderId: preOrder.id,
            vehicleId,
          });
        }}
        className="space-y-4"
      >
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Захиалгын дугаар автоматаар үүснэ:</p>
          <p className="text-lg font-mono font-semibold text-blue-600">
            Achir-Bairon-{new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, '0')}-{String(new Date().getDate()).padStart(2, '0')}-XXXX
          </p>
          <p className="text-xs text-gray-500 mt-1">XXXX нь өдрийн дараалалтай дугаар байна</p>
        </div>

        <Select label="Тээврийн хэрэгсэл" value={vehicleId} onChange={e => setVehicleId(e.target.value)} required>
          <option value="">Тээврийн хэрэгсэл сонгох...</option>
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
            Үүсгэх
          </Button>
        </div>
      </form>
    </Modal>
  );
}
