'use client';

import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage } from '@/context/LanguageProvider';
import api from '@/services/api';
import { PageHeader, Button } from '@/components/ui';
import { CreateUserModal, UserTable, EditUserModal } from './components';
import type { User, Company } from '@/types/types';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'CLIENT_ADMIN',
    companyId: ''
  });
  const [editFormData, setEditFormData] = useState({
    email: '',
    name: '',
    role: 'CLIENT_ADMIN',
    companyId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get<User[]>('/api/users');
      setUsers(response.data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.error || t('users.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get<Company[]>('/api/companies');
      setCompanies(response.data);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const userData = {
        ...formData,
        companyId: formData.companyId ? parseInt(formData.companyId) : null
      };

      await api.post('/api/users', userData);
      setSuccess('✅ ' + t('users.createSuccess'));
      setShowCreateModal(false);
      setFormData({ email: '', name: '', password: '', role: 'CLIENT_ADMIN', companyId: '' });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || t('users.createFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId ? user.companyId.toString() : ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent, passwordData?: { newPassword: string }) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const userData: any = {
        email: editFormData.email,
        name: editFormData.name,
        role: editFormData.role,
        companyId: editFormData.companyId ? parseInt(editFormData.companyId) : null
      };

      // Add password if provided
      if (passwordData?.newPassword) {
        userData.password = passwordData.newPassword;
      }

      await api.put(`/api/users/${editingUser.id}`, userData);
      setSuccess(passwordData?.newPassword 
        ? '✅ ' + t('users.updateWithPasswordSuccess')
        : '✅ ' + t('users.updateSuccess'));
      setShowEditModal(false);
      setEditingUser(null);
      setEditFormData({ email: '', name: '', role: 'CLIENT_ADMIN', companyId: '' });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || t('users.updateFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`"${user.name}" ${t('users.deleteConfirm')}`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await api.delete(`/api/users/${user.id}`);
      setSuccess('✅ ' + t('users.deleteSuccess'));
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || t('users.deleteFailed'));
    }
  };

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {t('users.accessDenied')}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        icon={<UserPlus className="w-8 h-8 text-white" />}
        title={t('users.title')}
        subtitle={t('users.subtitle')}
        action={
          <Button onClick={() => setShowCreateModal(true)}>
            <UserPlus className="w-5 h-5 mr-2" />
            {t('users.create')}
          </Button>
        }
      />

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : (
          <UserTable 
            users={users} 
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        )}
      </main>

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ email: '', name: '', password: '', role: 'CLIENT_ADMIN', companyId: '' });
          setError('');
        }}
        onSubmit={handleCreateUser}
        formData={formData}
        onChange={setFormData}
        companies={companies}
        isLoading={submitting}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
          setEditFormData({ email: '', name: '', role: 'CLIENT_ADMIN', companyId: '' });
          setError('');
        }}
        onSubmit={handleUpdateUser}
        user={editingUser}
        formData={editFormData}
        onChange={setEditFormData}
        companies={companies}
        isLoading={submitting}
      />
    </div>
  );
}
