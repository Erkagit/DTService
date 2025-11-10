import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { CreateOrderModalProps } from '@/types/types';

export function CreateOrderModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
  vehicles,
  companies,
  isAdmin,
  isLoading,
}: CreateOrderModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Шинэ захиалга үүсгэх">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Захиалгын код"
          type="text"
          value={formData.code}
          onChange={(e) => onChange({ ...formData, code: e.target.value })}
          placeholder="Achir Bayron LLC-2025-0001"
          required
        />

        <Input
          label="Эх газар"
          type="text"
          value={formData.origin}
          onChange={(e) => onChange({ ...formData, origin: e.target.value })}
          placeholder="Улаанбаатар"
          required
        />

        <Input
          label="Очих газар"
          type="text"
          value={formData.destination}
          onChange={(e) => onChange({ ...formData, destination: e.target.value })}
          placeholder="Замын-Үүд"
          required
        />

        <Select
          label="Тээврийн хэрэгсэл"
          value={formData.vehicleId}
          onChange={(e) => onChange({ ...formData, vehicleId: e.target.value })}
        >
          <option value="">Тээврийн хэрэгсэл сонгох...</option>
          {vehicles?.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.plateNo} - {vehicle.driverName}
            </option>
          ))}
        </Select>

        {isAdmin && companies && (
          <Select
            label="Компани"
            value={formData.companyId}
            onChange={(e) => onChange({ ...formData, companyId: e.target.value })}
            required
          >
            <option value="">Компани сонгох...</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </Select>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" onClick={onClose} variant="secondary" fullWidth>
            Цуцлах
          </Button>
          <Button type="submit" disabled={isLoading} fullWidth>
            {isLoading ? 'Үүсгэж байна...' : 'Захиалга үүсгэх'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
