'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesApi } from '@/services/api';
import api from '@/services/api';
import { Package, Building2, UserPlus, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage } from '@/context/LanguageProvider';
import { PageHeader, Button, EmptyState, GridSkeleton } from '@/components/ui';
import { CreateCompanyModal, CreateUserModal, CompanyCard, CompanyDetailsModal, EditCompanyModal } from './components';

export default function CompaniesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Redirect CLIENT_ADMIN to dashboard - they can only access dashboard
  useEffect(() => {
    if (user?.role?.toUpperCase() === 'CLIENT_ADMIN') {
      router.replace('/dashboard');
    }
  }, [user, router]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedCompanyDetails, setSelectedCompanyDetails] = useState<any>(null);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
  });

  const [userFormData, setUserFormData] = useState({
    email: '',
    name: '',
    password: '',
  });

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await companiesApi.getAll();
      return res.data;
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/api/companies', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setShowCreateForm(false);
      setFormData({ name: '' });
      alert('✅ ' + t('companies.createSuccess'));
    },
    onError: (error: any) => {
      alert('❌ ' + (error.response?.data?.error || t('companies.createFailed')));
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/api/users', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setShowCreateUserModal(false);
      setSelectedCompany(null);
      setUserFormData({ email: '', name: '', password: '' });
      alert('✅ ' + t('companies.adminCreateSuccess'));
    },
    onError: (error: any) => {
      alert('❌ ' + (error.response?.data?.error || t('companies.userCreateFailed')));
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return companiesApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setShowEditModal(false);
      setEditingCompany(null);
      setEditFormData({ name: '' });
      alert('✅ ' + t('companies.updateSuccess'));
    },
    onError: (error: any) => {
      alert('❌ ' + (error.response?.data?.error || t('companies.updateFailed')));
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: number) => {
      return companiesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      alert('✅ ' + t('companies.deleteSuccess'));
    },
    onError: (error: any) => {
      alert('❌ ' + (error.response?.data?.error || t('companies.deleteFailed')));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCompanyMutation.mutate(formData);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    
    createUserMutation.mutate({
      ...userFormData,
      role: 'CLIENT_ADMIN',
      companyId: selectedCompany.id
    });
  };

  const openCreateUserModal = (company: any) => {
    setSelectedCompany(company);
    setShowCreateUserModal(true);
  };

  const handleViewDetails = async (company: any) => {
    try {
      const response = await companiesApi.getById(company.id);
      setSelectedCompanyDetails(response.data);
      setShowDetailsModal(true);
    } catch (error: any) {
      console.error('Error fetching company details:', error);
      alert('❌ ' + t('companies.fetchFailed'));
    }
  };

  const handleCloseUserModal = () => {
    setShowCreateUserModal(false);
    setSelectedCompany(null);
    setUserFormData({ email: '', name: '', password: '' });
  };

  const handleEditCompany = (company: any) => {
    setEditingCompany(company);
    setEditFormData({ name: company.name });
    setShowEditModal(true);
  };

  const handleUpdateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    updateCompanyMutation.mutate({ id: editingCompany.id, data: editFormData });
  };

  const handleDeleteCompany = (company: any) => {
    if (confirm(`"${company.name}" ${t('companies.deleteConfirm')}`)) {
      deleteCompanyMutation.mutate(company.id);
    }
  };

  if (!user) {
    router.push('/');
    return null;
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('companies.accessDenied')}</h1>
          <p className="text-gray-600 mb-4">{t('companies.adminRequired')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        icon={<Building2 className="w-8 h-8 text-white" />}
        title={t('companies.title')}
        subtitle={t('companies.subtitle')}
        action={
          <Button icon={Plus} onClick={() => setShowCreateForm(true)}>
            {t('companies.new')}
          </Button>
        }
      />

      <CreateCompanyModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleSubmit}
        formData={formData}
        onChange={setFormData}
        isLoading={createCompanyMutation.isPending}
      />

      <CreateUserModal
        isOpen={showCreateUserModal}
        onClose={handleCloseUserModal}
        onSubmit={handleUserSubmit}
        company={selectedCompany}
        formData={userFormData}
        onChange={setUserFormData}
        isLoading={createUserMutation.isPending}
      />

      <CompanyDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        company={selectedCompanyDetails}
      />

      <EditCompanyModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCompany(null);
          setEditFormData({ name: '' });
        }}
        onSubmit={handleUpdateCompany}
        company={editingCompany}
        formData={editFormData}
        onChange={setEditFormData}
        isLoading={updateCompanyMutation.isPending}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <GridSkeleton count={6} />
        ) : companies && companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onAddUser={openCreateUserModal}
                onViewDetails={handleViewDetails}
                onEdit={handleEditCompany}
                onDelete={handleDeleteCompany}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Building2}
            title={t('companies.noCompanies')}
            description={t('companies.createFirst')}
            actionLabel={t('companies.create')}
            onAction={() => setShowCreateForm(true)}
          />
        )}
      </main>
    </div>
  );
}
