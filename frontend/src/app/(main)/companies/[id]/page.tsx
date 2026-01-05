'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '@/services/api';
import { Building2, Users, Package, ArrowLeft, Mail, Calendar, User as UserIcon, MapPin, Truck, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { PageHeader, Button } from '@/components/ui';
import { OrderCard } from '../../orders/components';
import { CompletedOrderModal } from '../../reports/components';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/types/types';
import { 
  formatDate, 
  getPreviousStatus, 
  getNextStatus, 
  canUpdateOrderStatus,
  isOrderActive,
  isOrderCompleted
} from '@/utils';

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const companyId = parseInt(params.id as string);
  const [showCompleted, setShowCompleted] = useState(true);
  const [viewingOrder, setViewingOrder] = useState<any>(null);
  const [completedPage, setCompletedPage] = useState(1);
  const COMPLETED_ITEMS_PER_PAGE = 10;

  const { data: company, isLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      const res = await companiesApi.getById(companyId);
      return res.data;
    },
    enabled: !!companyId,
  });

  // Redirect if not authorized
  useEffect(() => {
    if (user && user.role === 'CLIENT_ADMIN' && user.companyId !== companyId) {
      router.push('/orders');
    }
  }, [user, companyId, router]);

  if (!user) {
    router.push('/');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-white rounded-xl"></div>
            <div className="h-64 bg-white rounded-xl"></div>
            <div className="h-96 bg-white rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const users = company.users || [];
  const orders = company.orders || [];

  // Sort orders by createdAt descending (newest first)
  const sortedOrders = [...orders].sort((a: any, b: any) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Separate active and completed orders
  const activeOrders = sortedOrders.filter(order => isOrderActive(order.status));
  const completedOrders = sortedOrders.filter(order => isOrderCompleted(order.status));

  // Pagination for completed orders
  const completedTotalPages = Math.ceil(completedOrders.length / COMPLETED_ITEMS_PER_PAGE);
  const paginatedCompletedOrders = completedOrders.slice(
    (completedPage - 1) * COMPLETED_ITEMS_PER_PAGE,
    completedPage * COMPLETED_ITEMS_PER_PAGE
  );

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  const canUpdateStatus = (order: any) => canUpdateOrderStatus(order, isAdmin);

  const handleQuickStatusUpdate = () => {
    // This will be handled by parent component in future
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        icon={<Building2 className="w-8 h-8 text-purple-600" />}
        title={company.name}
        subtitle="Company Details"
        action={
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => router.back()}
          >
            Back
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{activeOrders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-900">{completedOrders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            Users
          </h3>
          {users.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <UserIcon className="w-4 h-4 text-gray-400 shrink-0" />
                      <p className="font-medium text-gray-900 truncate">{user.name}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                      user.role === 'ADMIN' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'CLIENT_ADMIN' ? 'Client Admin' : user.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1 min-w-0">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users yet</p>
            </div>
          )}
        </section>

        {/* Active Orders Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Active Orders</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {activeOrders.length} order{activeOrders.length !== 1 ? 's' : ''} in progress
              </p>
            </div>
          </div>
          
          {activeOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOrders.map((order: any) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  canUpdate={canUpdateStatus(order)}
                  previousStatus={getPreviousStatus(order.status as OrderStatus)}
                  nextStatus={getNextStatus(order.status as OrderStatus)}
                  onQuickUpdate={handleQuickStatusUpdate}
                  onDelete={undefined}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No active orders</p>
            </div>
          )}
        </section>

        {/* Completed Orders Section - Table Format */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Completed Orders</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {completedOrders.length} order{completedOrders.length !== 1 ? 's' : ''} finished
              </p>
            </div>
            {completedOrders.length > 0 && (
              <Button
                variant="ghost"
                onClick={() => setShowCompleted(!showCompleted)}
              >
                {showCompleted ? 'Hide' : 'Show'} Completed
              </Button>
            )}
          </div>
          
          {showCompleted && completedOrders.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Код
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Чиглэл
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Машин / Жолооч
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Статус
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Огноо
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                        Үйлдэл
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedCompletedOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">{order.code}</span>
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
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.createdAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setViewingOrder(order)}
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

              {/* Pagination */}
              {completedTotalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {(completedPage - 1) * COMPLETED_ITEMS_PER_PAGE + 1} - {Math.min(completedPage * COMPLETED_ITEMS_PER_PAGE, completedOrders.length)} / {completedOrders.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCompletedPage(p => Math.max(1, p - 1))}
                      disabled={completedPage === 1}
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                      {completedPage} / {completedTotalPages}
                    </span>
                    <button
                      onClick={() => setCompletedPage(p => Math.min(completedTotalPages, p + 1))}
                      disabled={completedPage === completedTotalPages}
                      className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : completedOrders.length === 0 ? (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No completed orders yet</p>
            </div>
          ) : null}
        </section>
      </main>

      {/* Completed Order Detail Modal */}
      {viewingOrder && (
        <CompletedOrderModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
