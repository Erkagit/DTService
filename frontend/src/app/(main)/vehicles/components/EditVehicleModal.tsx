import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Vehicle, Device } from '@/types/types';

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  vehicle: Vehicle | null;
  formData: {
    plateNo: string;
    driverName: string;
    driverPhone: string;
    deviceId: string;
  };
  onChange: (data: any) => void;
  devices: Device[];
  isLoading: boolean;
}

export function EditVehicleModal({
  isOpen,
  onClose,
  onSubmit,
  vehicle,
  formData,
  onChange,
  devices,
  isLoading,
}: EditVehicleModalProps) {
  if (!vehicle) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Тээврийн хэрэгсэл засах" maxWidth="md">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Улсын дугаар"
          value={formData.plateNo}
          onChange={(e) => onChange({ ...formData, plateNo: e.target.value })}
          required
          placeholder="Улсын дугаар оруулна уу"
        />

        <Input
          label="Жолоочийн нэр"
          value={formData.driverName}
          onChange={(e) => onChange({ ...formData, driverName: e.target.value })}
          required
          placeholder="Жолоочийн нэр оруулна уу"
        />

        <Input
          label="Жолоочийн утас"
          value={formData.driverPhone}
          onChange={(e) => onChange({ ...formData, driverPhone: e.target.value })}
          required
          placeholder="Жолоочийн утас оруулна уу"
        />

        <Select
          label="GPS төхөөрөмж (Сонголттой)"
          value={formData.deviceId}
          onChange={(e) => onChange({ ...formData, deviceId: e.target.value })}
        >
          <option value="">Төхөөрөмжгүй</option>
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.deviceId}
            </option>
          ))}
        </Select>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Цуцлах
          </Button>
          <Button type="submit" disabled={isLoading} variant="primary" fullWidth>
            {isLoading ? 'Шинэчилж байна...' : 'Хадгалах'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
