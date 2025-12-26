import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { User, Company } from '@/types/types';
import { useState } from 'react';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent, passwordData?: { newPassword: string }) => void;
  user: User | null;
  formData: {
    email: string;
    name: string;
    role: string;
    companyId: string;
  };
  onChange: (data: any) => void;
  companies: Company[];
  isLoading: boolean;
}

export function EditUserModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  formData,
  onChange,
  companies,
  isLoading,
}: EditUserModalProps) {
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords if changing
    if (changePassword) {
      if (!newPassword || !confirmPassword) {
        setPasswordError('Both password fields are required');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }
      if (newPassword.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        return;
      }
    }
    
    setPasswordError('');
    
    // Pass password data if changing
    const passwordData = changePassword ? { newPassword } : undefined;
    onSubmit(e, passwordData);
  };

  const handleClose = () => {
    setChangePassword(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit User" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
          required
          placeholder="Enter user name"
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange({ ...formData, email: e.target.value })}
          required
          placeholder="Enter email address"
        />

        <Select
          label="Role"
          value={formData.role}
          onChange={(e) => onChange({ ...formData, role: e.target.value })}
          required
        >
          <option value="">Select role</option>
          <option value="ADMIN">Admin</option>
          <option value="CLIENT_ADMIN">Client Admin</option>
        </Select>

        <Select
          label="Company"
          value={formData.companyId}
          onChange={(e) => onChange({ ...formData, companyId: e.target.value })}
        >
          <option value="">No Company</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </Select>

        {/* Password Change Section */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="changePassword"
              checked={changePassword}
              onChange={(e) => {
                setChangePassword(e.target.checked);
                setNewPassword('');
                setConfirmPassword('');
                setPasswordError('');
              }}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="changePassword" className="text-sm font-medium text-gray-700 cursor-pointer">
              Change Password
            </label>
          </div>

          {changePassword && (
            <div className="space-y-3 pl-6">
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required={changePassword}
                placeholder="Enter new password"
                minLength={6}
              />

              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={changePassword}
                placeholder="Confirm new password"
                minLength={6}
              />

              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
