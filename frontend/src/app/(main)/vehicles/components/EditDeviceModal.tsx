import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Device } from '@/types/types';

interface EditDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  device: Device | null;
  formData: { deviceId: string };
  onChange: (data: { deviceId: string }) => void;
  isLoading: boolean;
}

export function EditDeviceModal({
  isOpen,
  onClose,
  onSubmit,
  device,
  formData,
  onChange,
  isLoading,
}: EditDeviceModalProps) {
  if (!device) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="GPS төхөөрөмж засах" size="md">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Төхөөрөмжийн ID"
          value={formData.deviceId}
          onChange={(e) => onChange({ deviceId: e.target.value })}
          required
          placeholder="Төхөөрөмжийн ID оруулна уу"
        />

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
