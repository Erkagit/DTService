'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Package, MapPin, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to from-blue-50 via-white to-indigo-50">
      <div className="text-center">
        <div className="flex items-center justify-center mb-8">
          <Truck className="w-16 h-16 text-blue-600 animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Delivery Tracking System
        </h1>
        <div className="flex items-center justify-center gap-8 mt-12 text-gray-600">
          <div className="flex flex-col items-center">
            <Package className="w-8 h-8 mb-2 text-blue-500" />
            <span className="text-sm">Real-time Tracking</span>
          </div>
          <div className="flex flex-col items-center">
            <MapPin className="w-8 h-8 mb-2 text-green-500" />
            <span className="text-sm">GPS Monitoring</span>
          </div>
          <div className="flex flex-col items-center">
            <Clock className="w-8 h-8 mb-2 text-orange-500" />
            <span className="text-sm">Live Updates</span>
          </div>
        </div>
        <div className="mt-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  );
}
