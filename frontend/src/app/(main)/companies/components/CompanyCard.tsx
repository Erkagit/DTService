import { Building2, Users as UsersIcon, Package, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import type { CompanyCardProps } from '@/types/types';

export function CompanyCard({ company, onAddUser, onViewDetails, onEdit, onDelete }: CompanyCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/companies/${company.id}`);
  };

  return (
    <Card hover>
      <CardHeader>
        <div 
          className="flex items-start justify-between mb-4 cursor-pointer"
          onClick={handleCardClick}
        >
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-purple-600 transition-colors">
              {company.name}
            </h3>
            <div className="space-y-2">
              {company._count && (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <UsersIcon className="w-4 h-4 text-gray-400" />
                    <span>{company._count.users} Хэрэглэгч</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span>{company._count.orders} Захиалга</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <Building2 className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </CardHeader>

      <CardFooter className="pt-4 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onAddUser(company);
            }}
            variant="ghost"
            icon={UserPlus}
            fullWidth
            className="bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200"
          >
            <span className="hidden sm:inline">Харилцагчийн админ нэмэх</span>
            <span className="sm:hidden">Админ нэмэх</span>
          </Button>
          <div className="flex gap-2 sm:flex-none">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(company);
              }}
              variant="ghost"
              size="md"
              icon={Edit2}
              className="flex-1 sm:flex-none bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
            >
              <span className="hidden sm:inline">Засах</span>
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(company);
              }}
              variant="ghost"
              size="md"
              icon={Trash2}
              className="flex-1 sm:flex-none bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
            >
              <span className="hidden sm:inline">Устгах</span>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
