import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { CreateCompanyModalProps } from '@/types/types';

export function CreateCompanyModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
  isLoading,
}: CreateCompanyModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Шинэ компани үүсгэх" maxWidth="form">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Компанийн нэр"
          type="text"
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Acme Logistics"
          required
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" onClick={onClose} variant="secondary" fullWidth>
            Цуцлах
          </Button>
          <Button type="submit" disabled={isLoading} fullWidth>
            {isLoading ? 'Үүсгэж байна...' : 'Компани үүсгэх'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
