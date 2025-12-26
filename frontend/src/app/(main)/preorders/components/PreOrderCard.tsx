'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trash2, Eye, Building2, MapPin, Package, Truck } from 'lucide-react';
import type { PreOrder } from '@/types/types';
import { VEHICLE_TYPE_LABELS, TRAILER_TYPE_LABELS } from '@/types/types';

interface PreOrderCardProps {
  preOrder: PreOrder;
  onView: (preOrder: PreOrder) => void;
  onDelete: (preOrder: PreOrder) => void;
  onCreateOrder: (preOrder: PreOrder) => void;
}

export function PreOrderCard({ preOrder, onView, onDelete, onCreateOrder }: PreOrderCardProps) {
  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('mn-MN').format(value) + '₮';
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{preOrder.name}</h3>
          {preOrder.company && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <Building2 className="w-4 h-4" />
              {preOrder.company.name}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onView(preOrder)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(preOrder)} className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Addresses */}
      <div className="space-y-2 mb-3">
        {preOrder.pickupAddress && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="font-medium">Авах:</span> {preOrder.pickupAddress}
          </div>
        )}
        {preOrder.deliveryAddress && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="font-medium">Хүргэх:</span> {preOrder.deliveryAddress}
          </div>
        )}
      </div>

      {/* Weight & Dimension */}
      <div className="flex gap-4 mb-3 text-sm">
        {preOrder.weight && (
          <div className="flex items-center gap-1 text-gray-600">
            <Package className="w-4 h-4" />
            <span>{preOrder.weight} тн</span>
          </div>
        )}
        {preOrder.dimension && (
          <div className="text-gray-600">
            📐 {preOrder.dimension}
          </div>
        )}
      </div>

      {/* Vehicle Info */}
      <div className="flex gap-3 mb-3 text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <Truck className="w-4 h-4" />
          <span>{VEHICLE_TYPE_LABELS[preOrder.vehicleType]}</span>
        </div>
        {preOrder.trailerType && (
          <span className="text-gray-500">| {TRAILER_TYPE_LABELS[preOrder.trailerType]}</span>
        )}
      </div>

      {/* Documents Checklist */}
      <div className="flex gap-3 mb-3">
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

      {/* Payment Checklist - Төлбөр */}
      <div className="grid grid-cols-2 gap-2 mb-3">
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

      {/* Total Amount */}
      {preOrder.totalAmount && (
        <div className="pt-3 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Нийт дүн:</span>
            <span className="text-lg font-bold text-blue-600">{formatCurrency(preOrder.totalAmount)}</span>
          </div>
        </div>
      )}

      {/* Date */}
      <div className="text-xs text-gray-400 mt-2">
        {new Date(preOrder.createdAt).toLocaleDateString('mn-MN')}
      </div>

      {/* Order үүсгэх товч */}
      <div className="mt-3 flex justify-end">
        <Button size="sm" variant="primary" onClick={() => onCreateOrder(preOrder)}>
          Order үүсгэх
        </Button>
      </div>
    </Card>
  );
}
