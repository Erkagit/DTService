import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { CreateDeviceModalProps } from '@/types/types';

export function CreateDeviceModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
  isLoading,
}: CreateDeviceModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Шинэ GPS төхөөрөмж нэмэх" maxWidth="form">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Төхөөрөмжийн ID"
          type="text"
          value={formData.deviceId}
          onChange={(e) => onChange({ deviceId: e.target.value })}
          placeholder="GPS-0002"
          required
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" onClick={onClose} variant="secondary" fullWidth>
            Цуцлах
          </Button>
          <Button type="submit" disabled={isLoading} variant="primary" fullWidth>
            {isLoading ? 'Үүсгэж байна...' : 'Төхөөрөмж үүсгэх'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
