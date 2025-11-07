'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ordersApi, vehiclesApi, companiesApi } from '@/services/api';
import { Package, Truck, Building2, ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { PageHeader, StatCard, EmptyState } from '@/components/ui';

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await ordersApi.getAll();
      let filteredOrders = res.data;
      
      // Filter orders for CLIENT_ADMIN
      if (user?.role === 'CLIENT_ADMIN' && user.companyId) {
        filteredOrders = filteredOrders.filter((o: any) => o.companyId === user.companyId);
      }
      
      // Sort by createdAt descending (newest first)
      return filteredOrders.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    enabled: !!user,
  });

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const res = await vehiclesApi.getAll();
      return res.data;
    },
    enabled: !!user,
  });

  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await companiesApi.getAll();
      return res.data;
    },
    enabled: !!user && user.role === 'ADMIN',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Orders',
      value: orders?.length || 0,
      icon: Package,
      color: 'bg-blue-500',
      loading: ordersLoading,
      link: '/orders',
      description: 'Active & completed orders',
    },
    ...(user.role === 'ADMIN' ? [{
      label: 'Active Vehicles',
      value: vehicles?.length || 0,
      icon: Truck,
      color: 'bg-green-500',
      loading: vehiclesLoading,
      link: '/vehicles',
      description: 'Fleet in operation',
    }] : []),
  ];

  // Add Companies card for Admin users
  if (user.role === 'ADMIN') {
    stats.push({
      label: 'Companies',
      value: companies?.length || 0,
      icon: Building2,
      color: 'bg-purple-500',
      loading: companiesLoading,
      link: '/companies',
      description: 'Registered companies',
    });
  }

  // Add My Company card for CLIENT_ADMIN users
  if (user.role === 'CLIENT_ADMIN' && user.companyId) {
    stats.push({
      label: 'My Company',
      value: 1,
      icon: Building2,
      color: 'bg-purple-500',
      loading: false,
      link: `/companies/${user.companyId}`,
      description: 'View company details',
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        icon={<Truck className="w-8 h-8 text-blue-600" />}
        title="Dashboard"
        subtitle="Delivery Tracking System Overview"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
          <div className={`grid grid-cols-1 md:grid-cols-2 ${user.role === 'ADMIN' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <p className="text-sm text-gray-500 mt-1">Latest delivery orders</p>
            </div>
            <Link
              href="/orders"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6">
            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <Link
                    key={order.id}
                    href="/orders"
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-gray-900">{order.code}</p>
                        {order.vehicle && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            {order.vehicle.plateNo}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {order.origin} → {order.destination}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                        order.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'IN_TRANSIT'
                          ? 'bg-blue-100 text-blue-700'
                          : order.status === 'LOADING'
                          ? 'bg-purple-100 text-purple-700'
                          : order.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="No orders found"
                description="Create your first order to get started"
                actionLabel="Create First Order"
                onAction={() => {}}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
