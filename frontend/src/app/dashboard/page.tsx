'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ordersApi, vehiclesApi, companiesApi } from '@/services/api';
import { Package, Truck, MapPin, LogOut, Users, Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await ordersApi.getAll();
      return res.data;
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
    {
      label: 'Active Vehicles',
      value: vehicles?.length || 0,
      icon: Truck,
      color: 'bg-green-500',
      loading: vehiclesLoading,
      link: '/vehicles',
      description: 'Fleet in operation',
    },
    {
      label: 'In Transit',
      value: orders?.filter((o) => o.status === 'IN_TRANSIT').length || 0,
      icon: MapPin,
      color: 'bg-orange-500',
      loading: ordersLoading,
      link: '/orders',
      description: 'Currently on delivery',
    },
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DTS Dashboard</h1>
                <p className="text-sm text-gray-500">Delivery Tracking System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <div className="flex items-center justify-end gap-2 text-xs text-gray-500">
                  {user.role === 'ADMIN' && <Users className="w-3 h-3" />}
                  {user.companyId && <Building2 className="w-3 h-3" />}
                  <span className="bg-gray-100 px-2 py-0.5 rounded">{user.role}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
          <div className={`grid grid-cols-1 md:grid-cols-2 ${user.role === 'ADMIN' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
            {stats.map((stat) => (
              <Link
                key={stat.label}
                href={stat.link}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    {stat.loading ? (
                      <div className="h-10 w-20 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl shadow-sm`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center text-sm text-blue-600 group-hover:text-blue-700 font-medium">
                  View details
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/orders"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
          >
            <Package className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-bold mb-1">Manage Orders</h3>
            <p className="text-sm text-blue-100">Create and track delivery orders</p>
          </Link>
          
          <Link
            href="/vehicles"
            className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
          >
            <Truck className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-bold mb-1">Fleet Management</h3>
            <p className="text-sm text-green-100">Monitor vehicles and drivers</p>
          </Link>
          
          {user.role === 'ADMIN' && (
            <Link
              href="/companies"
              className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <Building2 className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-bold mb-1">Companies</h3>
              <p className="text-sm text-purple-100">Manage logistics companies</p>
            </Link>
          )}
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
                  <div
                    key={order.id}
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No orders found</p>
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  <Package className="w-4 h-4" />
                  Create First Order
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
