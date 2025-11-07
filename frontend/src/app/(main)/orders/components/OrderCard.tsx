import { MapPin, Truck, User, Calendar, ChevronLeft, ChevronRight, Trash2, Building2 } from 'lucide-react';
import { Card, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/types/types';
import type { OrderCardProps } from '@/types/types';

export function OrderCard({
  order,
  canUpdate,
  previousStatus,
  nextStatus,
  onQuickUpdate,
  onDelete,
}: OrderCardProps) {
  return (
    <Card hover>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
          <h3 className="text-lg font-bold text-gray-900 break-all">{order.code}</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap self-start ${
              ORDER_STATUS_COLORS[order.status as OrderStatus]
            }`}
          >
            {ORDER_STATUS_LABELS[order.status as OrderStatus]}
          </span>
        </div>

        <div className="space-y-3">
          {order.company && (
            <div className="flex items-center gap-2 text-sm bg-purple-50 px-3 py-2 rounded-lg">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span className="text-purple-900 font-medium">{order.company.name}</span>
            </div>
          )}

          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-gray-600">
                From: <span className="font-medium text-gray-900">{order.origin}</span>
              </p>
              <p className="text-gray-600">
                To: <span className="font-medium text-gray-900">{order.destination}</span>
              </p>
            </div>
          </div>

          {order.vehicle && (
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">{order.vehicle.plateNo}</span>
            </div>
          )}

          {order.assignedTo && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{order.assignedTo.name}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          {canUpdate && (previousStatus || nextStatus) && (
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              {previousStatus && (
                <Button
                  onClick={() => onQuickUpdate(order, previousStatus)}
                  variant="secondary"
                  size="sm"
                  fullWidth
                  className="text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Prev</span>
                </Button>
              )}
              {nextStatus && (
                <Button
                  onClick={() => onQuickUpdate(order, nextStatus)}
                  size="sm"
                  fullWidth
                  className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      {canUpdate && onDelete && (
        <CardFooter className="pt-3 border-t border-gray-100">
          <Button
            onClick={() => onDelete(order)}
            variant="ghost"
            size="sm"
            icon={Trash2}
            fullWidth
            className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
          >
            Delete Order
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
