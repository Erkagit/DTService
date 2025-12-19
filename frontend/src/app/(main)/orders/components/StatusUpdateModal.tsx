import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types/types';
import type { StatusUpdateModalProps } from '@/types/types';

export function StatusUpdateModal({
  isOpen,
  onClose,
  onSubmit,
  order,
  selectedStatus,
  onStatusChange,
  statusNote,
  onNoteChange,
  allowedTransitions,
  isLoading,
}: StatusUpdateModalProps) {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Order Status" maxWidth="form">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Order Code"
          type="text"
          value={order.code}
          disabled
        />

        <Input
          label="Current Status"
          type="text"
          value={order.status.replace(/_/g, ' ')}
          disabled
        />

        <Select
          label="New Status"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as OrderStatus | '')}
          required
        >
          <option value="">Select new status...</option>
          {allowedTransitions.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note (optional)
          </label>
          <textarea
            value={statusNote}
            onChange={(e) => onNoteChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Add any notes about this status change..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" onClick={onClose} variant="secondary" fullWidth>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} fullWidth>
            {isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
