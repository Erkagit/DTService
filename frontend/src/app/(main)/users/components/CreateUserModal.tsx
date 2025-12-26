import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { CreateUserModalProps } from '@/types/types';

export function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
  companies,
  isLoading,
}: CreateUserModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New User" size="md">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Name"
          type="text"
          value={formData.name}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
          required
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange({ ...formData, email: e.target.value })}
          required
        />

        <Input
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => onChange({ ...formData, password: e.target.value })}
          required
          minLength={6}
        />

        <Select
          label="Role"
          value={formData.role}
          onChange={(e) => onChange({ ...formData, role: e.target.value })}
          required
        >
          <option value="ADMIN">Admin</option>
          <option value="CLIENT_ADMIN">Client Admin</option>
        </Select>

        {formData.role === 'CLIENT_ADMIN' && (
          <Select
            label="Company"
            value={formData.companyId}
            onChange={(e) => onChange({ ...formData, companyId: e.target.value })}
            required
          >
            <option value="">Select a company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </Select>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" onClick={onClose} variant="secondary" fullWidth>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} fullWidth>
            {isLoading ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
