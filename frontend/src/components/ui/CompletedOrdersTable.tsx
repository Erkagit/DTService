'use client';

import { useState } from 'react';
import { 
  Building2, 
  Truck, 
  Calendar, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  MapPin,
  Package
} from 'lucide-react';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/types/types';
import { formatDate, formatCurrency } from '@/utils';

interface CompletedOrdersTableProps {
  orders: any[];
  onViewOrder: (order: any) => void;
  isAdmin?: boolean;
  showCompany?: boolean;
  showAmount?: boolean;
  itemsPerPage?: number;
  emptyMessage?: string;
}

export function CompletedOrdersTable({
  orders,
  onViewOrder,
  isAdmin = false,
  showCompany = true,
  showAmount = true,
  itemsPerPage = 10,
  emptyMessage = 'Дууссан захиалга байхгүй'
}: CompletedOrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-8 sm:p-12 text-center">
        <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-base sm:text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {paginatedOrders.map((order: any) => (
          <div 
            key={order.id} 
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer active:bg-gray-50"
            onClick={() => onViewOrder(order)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900">#{order.code}</p>
                {showCompany && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Building2 className="w-3 h-3" />
                    {order.company?.name || '-'}
                  </div>
                )}
              </div>
              <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${ORDER_STATUS_COLORS[order.status as OrderStatus]}`}>
                {ORDER_STATUS_LABELS[order.status as OrderStatus]}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{order.origin}</span>
              <span className="text-gray-400">→</span>
              <span className="truncate">{order.destination}</span>
            </div>
            
            {order.vehicle && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Truck className="w-3.5 h-3.5 text-gray-400" />
                <span>{order.vehicle.plateNo}</span>
                <span className="text-gray-400">•</span>
                <span>{order.vehicle.driverName || '-'}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {formatDate(order.createdAt)}
              </div>
              {showAmount && isAdmin && (
                <span className="font-semibold text-blue-600">
                  {formatCurrency(order.preOrders?.[0]?.totalAmount)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Код
                </th>
                {showCompany && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Компани
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Чиглэл
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Машин / Жолооч
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Статус
                </th>
                {showAmount && isAdmin && (
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Нийт дүн
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Огноо
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                  Үйлдэл
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{order.code}</span>
                  </td>
                  {showCompany && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{order.company?.name || '-'}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="text-gray-900 truncate max-w-[150px]" title={order.origin}>
                        {order.origin}
                      </p>
                      <p className="text-gray-500 truncate max-w-[150px]" title={order.destination}>
                        → {order.destination}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {order.vehicle ? (
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{order.vehicle.plateNo}</p>
                          <p className="text-gray-500">{order.vehicle.driverName}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${ORDER_STATUS_COLORS[order.status as OrderStatus]}`}>
                      {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                    </span>
                  </td>
                  {showAmount && isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(order.preOrders?.[0]?.totalAmount)}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {formatDate(order.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewOrder(order);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Дэлгэрэнгүй"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
          <p className="text-xs sm:text-sm text-gray-500">
            {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, orders.length)} / {orders.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
