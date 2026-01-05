'use client';

import { 
  X, 
  Building2, 
  Truck, 
  Phone, 
  MapPin, 
  Calendar, 
  Package,
  Clock,
  FileText,
  CheckCircle2,
  Scale,
  CreditCard
} from 'lucide-react';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/types/types';
import { formatDateTime, formatCurrency } from '@/utils';

interface CompletedOrderModalProps {
  order: any;
  onClose: () => void;
  isAdmin: boolean;
}

export function CompletedOrderModal({ order, onClose, isAdmin }: CompletedOrderModalProps) {
  const preOrder = order.preOrders?.[0];

  const isCompleted = order.status === 'COMPLETED';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 ${isCompleted ? 'bg-green-50' : 'bg-blue-50'} border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isCompleted ? (
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              ) : (
                <Package className="w-8 h-8 text-blue-600" />
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Захиалга #{order.code}
                </h2>
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${ORDER_STATUS_COLORS[order.status as OrderStatus]}`}>
                  {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
          {/* Company & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-medium">Компани</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {order.company?.name || '-'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Үүсгэсэн огноо</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatDateTime(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Route */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-3">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Чиглэл</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500">Гарах</p>
                <p className="font-semibold text-gray-900">{order.origin}</p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-8 h-0.5 bg-gray-300 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-400 border-y-4 border-y-transparent" />
                </div>
              </div>
              <div className="flex-1 text-right">
                <p className="text-xs text-gray-500">Очих</p>
                <p className="font-semibold text-gray-900">{order.destination}</p>
              </div>
            </div>
          </div>

          {/* Vehicle & Driver */}
          {order.vehicle && (
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-3">
                <Truck className="w-4 h-4" />
                <span className="text-sm font-medium">Тээврийн хэрэгсэл</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Машины дугаар</p>
                  <p className="font-semibold text-gray-900">{order.vehicle.plateNo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Жолоочийн нэр</p>
                  <p className="font-semibold text-gray-900">{order.vehicle.driverName || '-'}</p>
                </div>
                {/* Driver phone - only visible to Admin */}
                {isAdmin && order.vehicle.driverPhone && (
                  <div>
                    <p className="text-xs text-gray-500">Жолоочийн утас</p>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <p className="font-semibold text-gray-900">{order.vehicle.driverPhone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PreOrder Info - Only for Admin */}
          {isAdmin && preOrder && (
            <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-3">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Урьдчилсан захиалгын мэдээлэл</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {preOrder.itemCount && (
                  <div>
                    <p className="text-xs text-gray-500">Барааны тоо</p>
                    <div className="flex items-center gap-1">
                      <Package className="w-3 h-3 text-gray-400" />
                      <p className="font-semibold text-gray-900">{preOrder.itemCount}</p>
                    </div>
                  </div>
                )}
                {preOrder.weight && (
                  <div>
                    <p className="text-xs text-gray-500">Жин</p>
                    <div className="flex items-center gap-1">
                      <Scale className="w-3 h-3 text-gray-400" />
                      <p className="font-semibold text-gray-900">{preOrder.weight} кг</p>
                    </div>
                  </div>
                )}
                {preOrder.unitPrice && (
                  <div>
                    <p className="text-xs text-gray-500">Нэгж үнэ</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(preOrder.unitPrice)}</p>
                  </div>
                )}
                {preOrder.totalAmount && (
                  <div className="col-span-2 md:col-span-3 pt-2 border-t border-blue-100">
                    <p className="text-xs text-gray-500">Нийт дүн</p>
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4 text-blue-500" />
                      <p className="text-xl font-bold text-blue-600">{formatCurrency(preOrder.totalAmount)}</p>
                    </div>
                  </div>
                )}
              </div>
              {preOrder.description && (
                <div className="mt-3 pt-3 border-t border-blue-100">
                  <p className="text-xs text-gray-500 mb-1">Тайлбар</p>
                  <p className="text-sm text-gray-700">{preOrder.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Completion Status */}
          {isCompleted && (
            <div className="bg-green-50/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-600 mb-3">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Амжилттай дууссан</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Сүүлд шинэчилсэн: {formatDateTime(order.updatedAt)}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Тэмдэглэл</span>
              </div>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Хаах
          </button>
        </div>
      </div>
    </div>
  );
}
