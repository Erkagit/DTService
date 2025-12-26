import { useState, useEffect, useRef } from 'react';
import { MapPin, Truck, User, Calendar, ChevronLeft, ChevronRight, Trash2, Building2, Package, Edit, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/types/types';
import type { OrderCardProps } from '@/types/types';

export function OrderCard({
  order,
  canUpdate,
  previousStatus,
  nextStatus,
  onQuickUpdate,
  onDelete,
  onChangeVehicle,
  onConvertToPreOrder,
}: OrderCardProps) {
  const [showEditMenu, setShowEditMenu] = useState(false);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      {/* Header with title and actions */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className={`inline-block px-2 py-1 text-xs rounded mb-1 ${ORDER_STATUS_COLORS[order.status as OrderStatus]}`}>
            {ORDER_STATUS_LABELS[order.status as OrderStatus]}
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">{order.code}</h3>
          {order.company && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <Building2 className="w-4 h-4" />
              {order.company.name}
            </div>
          )}
        </div>
        {canUpdate && (onChangeVehicle || onDelete) && (
          <Dropdown
            isOpen={showEditMenu}
            onClose={() => setShowEditMenu(false)}
            trigger={
              <Button
                onClick={() => setShowEditMenu(!showEditMenu)}
                variant="ghost"
                size="sm"
                icon={MoreVertical}
                className="text-gray-500 hover:text-gray-700"
              >
                {''}
              </Button>
            }
            className="min-w-48"
          >
            <div className="py-1">
              {onChangeVehicle && (
                <button
                  onClick={() => {
                    onChangeVehicle(order);
                    setShowEditMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4" />
                  Машин солих
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => {
                    onDelete(order);
                    setShowEditMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Order
                </button>
              )}
            </div>
          </Dropdown>
        )}
      </div>

      {/* Addresses */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-green-600" />
          <span className="font-medium">From:</span> {order.origin}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-red-600" />
          <span className="font-medium">To:</span> {order.destination}
        </div>
      </div>

      {/* Vehicle Info */}
      {order.vehicle && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Truck className="w-4 h-4" />
          <span>{order.vehicle.plateNo}</span>
        </div>
      )}

      {/* PreOrder Information - Admin only */}
      {canUpdate && order.preOrders && order.preOrders.length > 0 && (
        <div className="mb-3">
          {order.preOrders.map((preOrder) => (
            <div key={preOrder.id} className="space-y-2 text-xs text-gray-700">
              <div className="grid grid-cols-2 gap-2">
                <p><strong>Нэр:</strong> {preOrder.name}</p>
                <div className="flex gap-2">
                  {preOrder.weight && <p><strong>Жин:</strong> {preOrder.weight} тн</p>}
                  {preOrder.dimension && <p><strong>📐</strong> {preOrder.dimension}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <p><strong>Төрөл:</strong> {preOrder.vehicleType === 'DEFAULT' ? 'Энгийн' : preOrder.vehicleType === 'GIT' ? 'Гит' : 'ТИР'}</p>
                {preOrder.trailerType && <p><strong>Сав:</strong> {
                  preOrder.trailerType === 'ZADGAI' ? 'Задгай' :
                  preOrder.trailerType === 'TENT' ? 'Тент' :
                  preOrder.trailerType === 'HURGUUR' ? 'Хүргүүр' : 'Чингэлэг'
                }</p>}
              </div>

              {/* Бичиг баримт section */}
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-700 mb-1"><strong>Бичиг баримт:</strong></p>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${preOrder.invoice ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    Invoice {preOrder.invoice ? '✓' : '✗'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${preOrder.packageList ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    Package List {preOrder.packageList ? '✓' : '✗'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${preOrder.originDoc ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    Origin {preOrder.originDoc ? '✓' : '✗'}
                  </span>
                </div>
              </div>

              {/* Төлбөр section */}
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-700 mb-1"><strong>Төлбөр:</strong></p>
                <div className="grid grid-cols-2 gap-2">
                  <span className={`px-2 py-1 text-xs rounded text-center ${preOrder.invoiceSent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    Нэхэмжлэл {preOrder.invoiceSent ? '✓' : '✗'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded text-center ${preOrder.paymentReceived ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    Төлбөр {preOrder.paymentReceived ? '✓' : '✗'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded text-center ${preOrder.idleTime ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    Сул зогсолт {preOrder.idleTime ? '✓' : '✗'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded text-center ${preOrder.transportDone ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    Тээвэр {preOrder.transportDone ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assigned User */}
      {order.assignedTo && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <User className="w-4 h-4" />
          <span>{order.assignedTo.name}</span>
        </div>
      )}

      {/* Date */}
      <div className="text-xs text-gray-400 mb-3">
        {new Date(order.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </div>

      {/* Status Update Buttons */}
      {canUpdate && (previousStatus || nextStatus) && (
        <div className="flex flex-col sm:flex-row gap-2">
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
    </Card>
  );
}
