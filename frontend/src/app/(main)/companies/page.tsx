'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesApi } from '@/services/api';
import api from '@/services/api';
import { Package, Building2, UserPlus, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { PageHeader, Button, EmptyState } from '@/components/ui';
import { CreateCompanyModal, CreateUserModal, CompanyCard, CompanyDetailsModal, EditCompanyModal } from './components';

export default function CompaniesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
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
      alert('✅ Компани амжилттай үүсгэлээ!');
    },
    onError: (error: any) => {
      alert('❌ ' + (error.response?.data?.error || 'Компани үүсгэх амжилтгүй боллоо'));
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
      alert('✅ Харилцагчийн админ хэрэглэгч амжилттай үүсгэлээ!');
    },
    onError: (error: any) => {
      alert('❌ ' + (error.response?.data?.error || 'Хэрэглэгч үүсгэх амжилтгүй боллоо'));
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
      alert('✅ Компани амжилттай шинэчлэгдлээ!');
    },
    onError: (error: any) => {
      alert('❌ ' + (error.response?.data?.error || 'Компани шинэчлэх амжилтгүй боллоо'));
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: number) => {
      return companiesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      alert('✅ Компани амжилттай устгагдлаа!');
    },
    onError: (error: any) => {
      alert('❌ ' + (error.response?.data?.error || 'Компани устгах амжилтгүй боллоо'));
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
      alert('❌ Компанийн мэдээлэл татах амжилтгүй боллоо');
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
    if (confirm(`"${company.name}"-г устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.`)) {
      deleteCompanyMutation.mutate(company.id);
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Хандах эрхгүй</h1>
          <p className="text-gray-600 mb-4">Админ эрх шаардлагатай</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        icon={<Building2 className="w-8 h-8 text-purple-600" />}
        title="Компаниуд"
        action={
          <Button icon={Plus} onClick={() => setShowCreateForm(true)}>
            Шинэ компани
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-white rounded-xl animate-pulse"></div>
            ))}
          </div>
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
            title="Компани байхгүй байна"
            description="Эхний компаниа үүсгэнэ үү"
            actionLabel="Компани үүсгэх"
            onAction={() => setShowCreateForm(true)}
          />
        )}
      </main>
    </div>
  );
}
