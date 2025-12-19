import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { CreateUserForCompanyModalProps } from '@/types/types';

export function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  company,
  formData,
  onChange,
  isLoading,
}: CreateUserForCompanyModalProps) {
  if (!company) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${company.name}-д харилцагчийн админ үүсгэх`} maxWidth="form">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Нэр"
          type="text"
          value={formData.name}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
          placeholder="Жон Доу"
          required
        />

        <Input
          label="Имэйл"
          type="email"
          value={formData.email}
          onChange={(e) => onChange({ ...formData, email: e.target.value })}
          placeholder="john@company.com"
          required
        />

        <Input
          label="Нууц үг"
          type="password"
          value={formData.password}
          onChange={(e) => onChange({ ...formData, password: e.target.value })}
          placeholder="••••••••"
          helperText="Хамгийн багадаа 6 тэмдэгт"
          required
          minLength={6}
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" onClick={onClose} variant="secondary" fullWidth>
            Цуцлах
          </Button>
          <Button type="submit" disabled={isLoading} fullWidth>
            {isLoading ? 'Үүсгэж байна...' : 'Хэрэглэгч үүсгэх'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
