import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Company } from '@/types/types';

interface EditCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  company: Company | null;
  formData: { name: string };
  onChange: (data: { name: string }) => void;
  isLoading: boolean;
}

export function EditCompanyModal({
  isOpen,
  onClose,
  onSubmit,
  company,
  formData,
  onChange,
  isLoading,
}: EditCompanyModalProps) {
  if (!company) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Компани засах" maxWidth="form">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Компанийн нэр"
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          required
          placeholder="Компанийн нэр оруулна уу"
        />

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Цуцлах
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Шинэчилж байна...' : 'Компани шинэчлэх'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
