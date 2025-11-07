import { Edit2, Trash2, Mail, Building2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { UserTableProps } from '@/types/types';

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.company?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={() => onEdit(user)}
                        variant="ghost"
                        size="sm"
                        icon={Edit2}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => onDelete(user)}
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                <span
                  className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                    user.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="break-all">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span>{user.company?.name || 'No Company'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <Button
                onClick={() => onEdit(user)}
                variant="ghost"
                size="sm"
                icon={Edit2}
                className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
              >
                Edit
              </Button>
              <Button
                onClick={() => onDelete(user)}
                variant="ghost"
                size="sm"
                icon={Trash2}
                className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
