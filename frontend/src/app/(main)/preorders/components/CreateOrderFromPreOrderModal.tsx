import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { PreOrder, Vehicle } from '@/types/types';

interface ExtendedVehicle extends Vehicle {
  isAvailable?: boolean;
  activeOrder?: {
    id: number;
    code: string;
    status: string;
    company?: { name: string };
  } | null;
}

interface CreateOrderFromPreOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  preOrder: PreOrder | null;
  vehicles: ExtendedVehicle[];
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

  // Filter to show only available vehicles
  const availableVehicles = vehicles.filter(v => v.isAvailable !== false);
  const unavailableVehicles = vehicles.filter(v => v.isAvailable === false);

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

        <div>
          <Select label="Тээврийн хэрэгсэл" value={vehicleId} onChange={e => setVehicleId(e.target.value)} required>
            <option value="">Тээврийн хэрэгсэл сонгох...</option>
            {availableVehicles.length > 0 && (
              <optgroup label="✅ Боломжтой машинууд">
                {availableVehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plateNo} - {vehicle.driverName}
                  </option>
                ))}
              </optgroup>
            )}
            {unavailableVehicles.length > 0 && (
              <optgroup label="❌ Захиалгад оноогдсон">
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
              ⚠️ Боломжтой машин байхгүй байна. Бүх машин идэвхтэй захиалгад оноогдсон.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Болих
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading || availableVehicles.length === 0}>
            Үүсгэх
          </Button>
        </div>
      </form>
    </Modal>
  );
}
