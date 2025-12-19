import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { CreateVehicleModalProps } from '@/types/types';

export function CreateVehicleModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
  devices,
  isLoading,
}: CreateVehicleModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Шинэ тээврийн хэрэгсэл нэмэх" maxWidth="form">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Улсын дугаар"
          type="text"
          value={formData.plateNo}
          onChange={(e) => onChange({ ...formData, plateNo: e.target.value })}
          placeholder="УБХ-1234"
          required
        />

        <Input
          label="Жолоочийн нэр"
          type="text"
          value={formData.driverName}
          onChange={(e) => onChange({ ...formData, driverName: e.target.value })}
          placeholder="Батаа"
          required
        />

        <Input
          label="Жолоочийн утас"
          type="tel"
          value={formData.driverPhone}
          onChange={(e) => onChange({ ...formData, driverPhone: e.target.value })}
          placeholder="+976-99001122"
          required
        />

        <Select
          label="GPS төхөөрөмж (Сонголттой)"
          value={formData.deviceId}
          onChange={(e) => onChange({ ...formData, deviceId: e.target.value })}
        >
          <option value="">Төхөөрөмжгүй</option>
          {devices?.map((device: any) => (
            <option key={device.id} value={device.id}>
              {device.deviceId}
            </option>
          ))}
        </Select>

        <div className="flex gap-3 pt-4">
          <Button type="button" onClick={onClose} variant="secondary" fullWidth>
            Цуцлах
          </Button>
          <Button type="submit" disabled={isLoading} variant="primary" fullWidth>
            {isLoading ? 'Үүсгэж байна...' : 'Тээврийн хэрэгсэл үүсгэх'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
