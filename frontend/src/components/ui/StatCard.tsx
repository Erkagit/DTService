import React from 'react';
import Link from 'next/link';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  loading?: boolean;
  link: string;
  description: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  color,
  loading = false,
  link,
  description,
}) => {
  return (
    <Link
      href={link}
      className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 cursor-pointer group"
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-gray-50 to-transparent rounded-bl-full opacity-50" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
            {loading ? (
              <div className="h-12 w-24 bg-gray-100 animate-pulse rounded-xl"></div>
            ) : (
              <p className="text-4xl md:text-5xl font-bold text-gray-900">{value}</p>
            )}
            <p className="text-sm text-gray-400 mt-3">{description}</p>
          </div>
          <div className={`${color} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-900 font-medium pt-4 border-t border-gray-100">
          Дэлгэрэнгүй харах
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
        </div>
      </div>
    </Link>
  );
};
