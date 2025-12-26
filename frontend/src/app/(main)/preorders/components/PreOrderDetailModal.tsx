'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Building2, MapPin, Package, Truck, FileCheck, DollarSign, CreditCard, Save } from 'lucide-react';
import type { PreOrder } from '@/types/types';
import { VEHICLE_TYPE_LABELS, TRAILER_TYPE_LABELS } from '@/types/types';

interface PreOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  preOrder: PreOrder | null;
  onUpdate?: (data: Partial<PreOrder>) => void;
  isUpdating?: boolean;
}

export function PreOrderDetailModal({ isOpen, onClose, preOrder, onUpdate, isUpdating }: PreOrderDetailModalProps) {
  const [paymentData, setPaymentData] = useState({
    invoiceSent: false,
    paymentReceived: false,
    idleTime: false,
    transportDone: false,
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state with preOrder data
  useEffect(() => {
    if (preOrder) {
      setPaymentData({
        invoiceSent: preOrder.invoiceSent || false,
        paymentReceived: preOrder.paymentReceived || false,
        idleTime: preOrder.idleTime || false,
        transportDone: preOrder.transportDone || false,
      });
      setHasChanges(false);
    }
  }, [preOrder]);

  if (!preOrder) return null;

  const handleToggle = (field: keyof typeof paymentData) => {
    setPaymentData(prev => {
      const newData = { ...prev, [field]: !prev[field] };
      // Check if there are changes
      const changed = 
        newData.invoiceSent !== (preOrder.invoiceSent || false) ||
        newData.paymentReceived !== (preOrder.paymentReceived || false) ||
        newData.idleTime !== (preOrder.idleTime || false) ||
        newData.transportDone !== (preOrder.transportDone || false);
      setHasChanges(changed);
      return newData;
    });
  };

  const handleSave = () => {
    if (onUpdate && hasChanges) {
      onUpdate(paymentData);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || value === 0) return '-';
    return new Intl.NumberFormat('mn-MN').format(value) + '₮';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Урьдчилсан захиалгын дэлгэрэнгүй" size="2xl">
      <div className="space-y-6">
        {/* Order Note Section */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Захиалгын тэмдэглэл
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {preOrder.company && (
              <div>
                <p className="text-sm text-gray-500">Компани</p>
                <p className="font-medium flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {preOrder.company.name}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Нэр</p>
              <p className="font-medium">{preOrder.name}</p>
            </div>
            {preOrder.pickupAddress && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Ачаа авах хаяг</p>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-green-600" />
                  {preOrder.pickupAddress}
                </p>
              </div>
            )}
            {preOrder.deliveryAddress && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Хүргэх хаяг</p>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-red-600" />
                  {preOrder.deliveryAddress}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Жин</p>
              <p className="font-medium">{preOrder.weight ? `${preOrder.weight} тн` : '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Хэмжээ</p>
              <p className="font-medium">{preOrder.dimension || '-'} м3</p>
            </div>
          </div>
        </div>

        {/* Order Price Section */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Үнэ
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-sm text-gray-500">Ачилт</p>
              <p className="font-medium">{formatCurrency(preOrder.loadingCost)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Тээвэр</p>
              <p className="font-medium">{formatCurrency(preOrder.transportCost)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Шилжүүлэн ачилт</p>
              <p className="font-medium">{formatCurrency(preOrder.transshipmentCost)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Экспорт гааль</p>
              <p className="font-medium">{formatCurrency(preOrder.exportCustomsCost)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Монгол тээвэр</p>
              <p className="font-medium">{formatCurrency(preOrder.mongolTransportCost)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Импорт гааль</p>
              <p className="font-medium">{formatCurrency(preOrder.importCustomsCost)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ашиг</p>
              <p className="font-medium text-green-600">{formatCurrency(preOrder.profit)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Зардал</p>
              <p className="font-medium text-red-600">{formatCurrency(preOrder.expense)}</p>
            </div>
            <div className="bg-white p-2 rounded">
              <p className="text-sm text-gray-500">Нийт дүн</p>
              <p className="font-bold text-lg text-blue-600">{formatCurrency(preOrder.totalAmount)}</p>
            </div>
          </div>
        </div>

        {/* Teever Section */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Тээвэр
          </h3>
          
          {/* Documents */}
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Бичиг баримт</p>
            <div className="flex gap-3">
              <span className={`px-3 py-1 rounded-full text-sm ${preOrder.invoice ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                <FileCheck className="w-4 h-4 inline mr-1" />
                Invoice {preOrder.invoice ? '✓' : '✗'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${preOrder.packageList ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                <FileCheck className="w-4 h-4 inline mr-1" />
                Package List {preOrder.packageList ? '✓' : '✗'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${preOrder.originDoc ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                <FileCheck className="w-4 h-4 inline mr-1" />
                Origin {preOrder.originDoc ? '✓' : '✗'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Машин төрөл</p>
              <p className="font-medium">{VEHICLE_TYPE_LABELS[preOrder.vehicleType]}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Чиргүүл төрөл</p>
              <p className="font-medium">{preOrder.trailerType ? TRAILER_TYPE_LABELS[preOrder.trailerType] : '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Гадаад машин тоо</p>
              <p className="font-medium">{preOrder.foreignVehicleCount || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Монгол машин тоо</p>
              <p className="font-medium">{preOrder.mongolVehicleCount || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Чингэлэг</p>
              <p className="font-medium">{preOrder.hasContainer === 'YES' ? 'Тийм' : 'Үгүй'}</p>
            </div>
            {preOrder.hasContainer === 'YES' && preOrder.containerNumber && (
              <div>
                <p className="text-sm text-gray-500">Чингэлэгний дугаар</p>
                <p className="font-medium">{preOrder.containerNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tulbur Section - Төлбөр */}
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Төлбөр
            {hasChanges && <span className="text-xs bg-orange-200 px-2 py-0.5 rounded-full">Өөрчлөгдсөн</span>}
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleToggle('invoiceSent')}
              className={`flex items-center justify-between p-3 bg-white rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${paymentData.invoiceSent ? 'border-green-400' : 'border-gray-200'}`}
            >
              <span className="text-sm text-gray-700">Нэхэмжлэл явуулсан</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentData.invoiceSent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {paymentData.invoiceSent ? 'Тийм ✓' : 'Үгүй ✗'}
              </span>
            </button>
            
            <button 
              onClick={() => handleToggle('paymentReceived')}
              className={`flex items-center justify-between p-3 bg-white rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${paymentData.paymentReceived ? 'border-green-400' : 'border-gray-200'}`}
            >
              <span className="text-sm text-gray-700">Төлбөр төлөгдсөн</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentData.paymentReceived ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {paymentData.paymentReceived ? 'Тийм ✓' : 'Үгүй ✗'}
              </span>
            </button>
            
            <button 
              onClick={() => handleToggle('idleTime')}
              className={`flex items-center justify-between p-3 bg-white rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${paymentData.idleTime ? 'border-green-400' : 'border-gray-200'}`}
            >
              <span className="text-sm text-gray-700">Сул зогсолт</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentData.idleTime ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {paymentData.idleTime ? 'Тийм ✓' : 'Үгүй ✗'}
              </span>
            </button>
            
            <button 
              onClick={() => handleToggle('transportDone')}
              className={`flex items-center justify-between p-3 bg-white rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${paymentData.transportDone ? 'border-green-400' : 'border-gray-200'}`}
            >
              <span className="text-sm text-gray-700">Тээвэр</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentData.transportDone ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {paymentData.transportDone ? 'Тийм ✓' : 'Үгүй ✗'}
              </span>
            </button>
          </div>

          {hasChanges && (
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSave} disabled={isUpdating}>
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? 'Хадгалж байна...' : 'Хадгалах'}
              </Button>
            </div>
          )}
        </div>

        {/* Date */}
        <div className="text-sm text-gray-500 text-right">
          Үүсгэсэн: {new Date(preOrder.createdAt).toLocaleString('mn-MN')}
        </div>
      </div>
    </Modal>
  );
}
