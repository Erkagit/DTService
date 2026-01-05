'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ordersApi, companiesApi } from '@/services/api';
import { 
  FileSpreadsheet, 
  Search, 
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Building2,
  Truck,
  Calendar,
  Package,
  Eye,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage } from '@/context/LanguageProvider';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/types/types';
import { CompletedOrderModal } from './components';
import { formatDate, formatCurrency } from '@/utils';

const ITEMS_PER_PAGE = 10;

export default function ReportsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  
  // Redirect CLIENT_ADMIN
  useEffect(() => {
    if (user?.role?.toUpperCase() === 'CLIENT_ADMIN') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await ordersApi.getAll();
      return res.data;
    },
  });

  // Fetch companies for filter
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await companiesApi.getAll();
      return res.data;
    },
  });

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    let result = [...orders];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter((order: any) => 
        order.code?.toLowerCase().includes(search) ||
        order.origin?.toLowerCase().includes(search) ||
        order.destination?.toLowerCase().includes(search) ||
        order.company?.name?.toLowerCase().includes(search) ||
        order.vehicle?.driverName?.toLowerCase().includes(search) ||
        order.vehicle?.plateNo?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((order: any) => order.status === statusFilter);
    }

    // Company filter
    if (companyFilter !== 'all') {
      result = result.filter((order: any) => order.companyId === parseInt(companyFilter));
    }

    // Sort
    result.sort((a: any, b: any) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (sortField === 'company') {
        aVal = a.company?.name || '';
        bVal = b.company?.name || '';
      }
      
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [orders, searchTerm, statusFilter, companyFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Stats
  const stats = useMemo(() => {
    if (!filteredOrders.length) return { total: 0, completed: 0, pending: 0, totalAmount: 0 };
    
    const completed = filteredOrders.filter((o: any) => o.status === 'COMPLETED').length;
    const pending = filteredOrders.filter((o: any) => o.status === 'PENDING').length;
    const totalAmount = filteredOrders.reduce((sum: number, o: any) => {
      const preOrder = o.preOrders?.[0];
      return sum + (preOrder?.totalAmount || 0);
    }, 0);

    return { total: filteredOrders.length, completed, pending, totalAmount };
  }, [filteredOrders]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ['Код', 'Компани', 'Гарах', 'Очих', 'Машин', 'Жолооч', 'Статус', 'Нийт дүн', 'Огноо'];
    const rows = filteredOrders.map((order: any) => [
      order.code,
      order.company?.name || '-',
      order.origin,
      order.destination,
      order.vehicle?.plateNo || '-',
      order.vehicle?.driverName || '-',
      ORDER_STATUS_LABELS[order.status as OrderStatus],
      order.preOrders?.[0]?.totalAmount || 0,
      formatDate(order.createdAt)
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tailan_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!user || user.role?.toUpperCase() === 'CLIENT_ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        icon={<FileSpreadsheet className="w-8 h-8 text-white" />}
        title={t('reports.title')}
        subtitle={t('reports.subtitle')}
        action={
          <Button onClick={handleExport} variant="secondary" icon={Download}>
            {t('reports.export')}
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-500">{t('reports.totalOrders')}</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-500">{t('reports.completed')}</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-500">{t('reports.pending')}</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-500">{t('reports.totalAmount')}</p>
            <p className="text-lg sm:text-2xl font-bold text-blue-600">{formatCurrency(stats.totalAmount)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder={t('reports.search')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500 text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              >
                <option value="all">{t('reports.allStatus')}</option>
                {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              {/* Company Filter */}
              <select
                value={companyFilter}
                onChange={(e) => {
                  setCompanyFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              >
                <option value="all">{t('reports.allCompanies')}</option>
                {companies?.map((company: any) => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table/Cards */}
        {isLoading ? (
          <TableSkeleton rows={10} columns={8} />
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 sm:p-12 border border-gray-100 text-center shadow-sm">
            <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">{t('reports.noResults')}</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {paginatedOrders.map((order: any) => (
                <div 
                  key={order.id} 
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">#{order.code}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        {order.company?.name || '-'}
                      </div>
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
                    {isAdmin && (
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
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('code')}
                      >
                        <div className="flex items-center gap-1">
                          Код
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('company')}
                      >
                        <div className="flex items-center gap-1">
                          Компани
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Чиглэл
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Машин / Жолооч
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-1">
                          Статус
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      {isAdmin && (
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                          Нийт дүн
                        </th>
                      )}
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center gap-1">
                          Огноо
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
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
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{order.company?.name || '-'}</span>
                          </div>
                        </td>
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
                        {isAdmin && (
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
                            onClick={() => setSelectedOrder(order)}
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
          </>
        )}

        {/* Pagination */}
        {!isLoading && filteredOrders.length > 0 && totalPages > 1 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-500">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} / {filteredOrders.length}
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
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <CompletedOrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
