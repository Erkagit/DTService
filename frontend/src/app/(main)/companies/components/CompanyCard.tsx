import { Building2, Users as UsersIcon, Package, UserPlus, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import type { CompanyCardProps } from '@/types/types';

export function CompanyCard({ company, onAddUser, onViewDetails, onEdit, onDelete }: CompanyCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/companies/${company.id}`);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 truncate">{company.name}</h3>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      {/* Stats */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleCardClick}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <UsersIcon className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-lg font-bold text-gray-900">{company._count?.users || 0}</p>
              <p className="text-xs text-gray-500">Хэрэглэгч</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <Package className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-lg font-bold text-gray-900">{company._count?.orders || 0}</p>
              <p className="text-xs text-gray-500">Захиалга</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Small & Compact */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddUser(company);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>User</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(company);
            }}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(company);
            }}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
}
