'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { Company, VehicleType, TrailerType, ContainerOption } from '@/types/types';

interface PreOrderFormData {
  // Order Note
  companyId: string;
  pickupAddress: string;
  deliveryAddress: string;
  name: string;
  weight: string;
  dimension: string;
  // Order Price
  loadingCost: string;
  transportCost: string;
  transshipmentCost: string;
  exportCustomsCost: string;
  mongolTransportCost: string;
  importCustomsCost: string;
  profit: string;
  expense: string;
  totalAmount: string;
  // Teever
  invoice: boolean;
  packageList: boolean;
  originDoc: boolean;
  vehicleType: VehicleType;
  foreignVehicleCount: string;
  mongolVehicleCount: string;
  trailerType: TrailerType | '';
  hasContainer: ContainerOption;
  containerNumber: string;
  // Tulbur - Төлбөр
  invoiceSent: boolean;
  paymentReceived: boolean;
  idleTime: boolean;
  transportDone: boolean;
}

interface CreatePreOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PreOrderFormData) => void;
  companies: Company[];
  isLoading: boolean;
}

const STEPS = [
  { id: 1, name: 'Захиалгын тэмдэглэл', key: 'orderNote' },
  { id: 2, name: 'Үнэ', key: 'orderPrice' },
  { id: 3, name: 'Тээвэр', key: 'teever' },
  { id: 4, name: 'Төлбөр', key: 'tulbur' },
];

const initialFormData: PreOrderFormData = {
  companyId: '',
  pickupAddress: '',
  deliveryAddress: '',
  name: '',
  weight: '',
  dimension: '',
  loadingCost: '',
  transportCost: '',
  transshipmentCost: '',
  exportCustomsCost: '',
  mongolTransportCost: '',
  importCustomsCost: '',
  profit: '',
  expense: '',
  totalAmount: '',
  invoice: false,
  packageList: false,
  originDoc: false,
  vehicleType: 'DEFAULT',
  foreignVehicleCount: '',
  mongolVehicleCount: '',
  trailerType: '',
  hasContainer: 'NO',
  containerNumber: '',
  invoiceSent: false,
  paymentReceived: false,
  idleTime: false,
  transportDone: false,
};

export function CreatePreOrderModal({
  isOpen,
  onClose,
  onSubmit,
  companies,
  isLoading,
}: CreatePreOrderModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PreOrderFormData>(initialFormData);

  const handleClose = () => {
    setCurrentStep(1);
    setFormData(initialFormData);
    onClose();
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    handleClose();
  };

  const updateFormData = (field: keyof PreOrderFormData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate total when any price field changes
      const priceFields = [
        'loadingCost', 'transportCost', 'transshipmentCost', 
        'exportCustomsCost', 'mongolTransportCost', 'importCustomsCost', 
        'profit', 'expense'
      ];
      
      if (priceFields.includes(field)) {
        const costs = [
          parseFloat(field === 'loadingCost' ? value : newData.loadingCost) || 0,
          parseFloat(field === 'transportCost' ? value : newData.transportCost) || 0,
          parseFloat(field === 'transshipmentCost' ? value : newData.transshipmentCost) || 0,
          parseFloat(field === 'exportCustomsCost' ? value : newData.exportCustomsCost) || 0,
          parseFloat(field === 'mongolTransportCost' ? value : newData.mongolTransportCost) || 0,
          parseFloat(field === 'importCustomsCost' ? value : newData.importCustomsCost) || 0,
          parseFloat(field === 'expense' ? value : newData.expense) || 0,
        ];
        const profit = parseFloat(field === 'profit' ? value : newData.profit) || 0;
        const total = costs.reduce((sum, cost) => sum + cost, 0) + profit;
        newData.totalAmount = total > 0 ? total.toString() : '';
      }
      
      return newData;
    });
  };

  const renderStepIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep === step.id
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : currentStep > step.id
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-300 bg-white text-gray-500'
              }`}
            >
              {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
            </div>
            <span
              className={`ml-2 text-sm font-medium ${
                currentStep === step.id ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {step.name}
            </span>
            {index < STEPS.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderOrderNote = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Захиалгын тэмдэглэл</h3>
      
      <Select
        label="Компани"
        value={formData.companyId}
        onChange={(e) => updateFormData('companyId', e.target.value)}
        required
      >
        <option value="">Компани сонгох</option>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </Select>

      <Input
        label="Ачаа авах хаяг"
        value={formData.pickupAddress}
        onChange={(e) => updateFormData('pickupAddress', e.target.value)}
        placeholder="Ачаа авах хаяг оруулна уу"
      />

      <Input
        label="Хүргэх хаяг"
        value={formData.deliveryAddress}
        onChange={(e) => updateFormData('deliveryAddress', e.target.value)}
        placeholder="Хүргэх хаяг оруулна уу"
      />

      <Input
        label="Нэр"
        value={formData.name}
        onChange={(e) => updateFormData('name', e.target.value)}
        placeholder="Ачааны нэр"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Жин (тн)"
          type="number"
          value={formData.weight}
          onChange={(e) => updateFormData('weight', e.target.value)}
          placeholder="0"
        />

        <Input
          label="Хэмжээ"
          value={formData.dimension}
          onChange={(e) => updateFormData('dimension', e.target.value)}
          placeholder="Урт x Өргөн x Өндөр"
        />
      </div>
    </div>
  );

  const renderOrderPrice = () => {
    // Format number with thousand separators
    const formatNumber = (value: string) => {
      const num = parseFloat(value.replace(/,/g, ''));
      if (isNaN(num) || num === 0) return '';
      return new Intl.NumberFormat('mn-MN').format(num);
    };

    // Currency input component with formatting on blur
    const CurrencyInput = ({ label, field, value }: { label: string; field: keyof PreOrderFormData; value: string }) => {
      const [displayValue, setDisplayValue] = useState(value ? formatNumber(value) : '');
      const [isFocused, setIsFocused] = useState(false);

      // Update display when value changes externally
      React.useEffect(() => {
        if (!isFocused) {
          setDisplayValue(value ? formatNumber(value) : '');
        }
      }, [value, isFocused]);

      const handleFocus = () => {
        setIsFocused(true);
        // Show raw number when focused
        setDisplayValue(value || '');
      };

      const handleBlur = () => {
        setIsFocused(false);
        // Format on blur
        setDisplayValue(value ? formatNumber(value) : '');
      };

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        // Only allow numbers
        const rawValue = inputValue.replace(/[^0-9]/g, '');
        setDisplayValue(rawValue);
        updateFormData(field, rawValue);
      };

      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={displayValue}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="0"
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₮</span>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Үнэ</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <CurrencyInput label="Ачилт" field="loadingCost" value={formData.loadingCost} />
          <CurrencyInput label="Тээвэр" field="transportCost" value={formData.transportCost} />
          <CurrencyInput label="Шилжүүлэн ачилт" field="transshipmentCost" value={formData.transshipmentCost} />
          <CurrencyInput label="Экспорт гааль" field="exportCustomsCost" value={formData.exportCustomsCost} />
          <CurrencyInput label="Монгол тээвэр" field="mongolTransportCost" value={formData.mongolTransportCost} />
          <CurrencyInput label="Импорт гааль" field="importCustomsCost" value={formData.importCustomsCost} />
          <CurrencyInput label="Ашиг" field="profit" value={formData.profit} />
          <CurrencyInput label="Зардал" field="expense" value={formData.expense} />
        </div>

        <div className="pt-4 border-t bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-700">Нийт дүн:</span>
            <span className="text-2xl font-bold text-blue-600">
              {formData.totalAmount ? `${formatNumber(formData.totalAmount)} ₮` : '0 ₮'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderTeever = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Тээвэр</h3>
      
      {/* Checklist */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-3">Бичиг баримт</p>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.invoice}
              onChange={(e) => updateFormData('invoice', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Invoice</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.packageList}
              onChange={(e) => updateFormData('packageList', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Package List</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.originDoc}
              onChange={(e) => updateFormData('originDoc', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Origin</span>
          </label>
        </div>
      </div>

      <Select
        label="Машин төрөл"
        value={formData.vehicleType}
        onChange={(e) => updateFormData('vehicleType', e.target.value as VehicleType)}
      >
        <option value="DEFAULT">Энгийн</option>
        <option value="GIT">Гит</option>
        <option value="TIR">ТИР</option>
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Гадаад машин тоо"
          type="number"
          value={formData.foreignVehicleCount}
          onChange={(e) => updateFormData('foreignVehicleCount', e.target.value)}
          placeholder="0"
        />

        <Input
          label="Монгол машин тоо"
          type="number"
          value={formData.mongolVehicleCount}
          onChange={(e) => updateFormData('mongolVehicleCount', e.target.value)}
          placeholder="0"
        />
      </div>

      <Select
        label="Чиргүүл төрөл"
        value={formData.trailerType}
        onChange={(e) => updateFormData('trailerType', e.target.value as TrailerType | '')}
      >
        <option value="">Сонгох</option>
        <option value="TENT">Тент</option>
        <option value="HURGUUR">Хүргүүр</option>
        <option value="ZADGAI">Задгай</option>
        <option value="CHINGELEG">Чингэлэг</option>
      </Select>

      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-3">Чингэлэг</p>
        <div className="flex gap-6 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hasContainer"
              checked={formData.hasContainer === 'YES'}
              onChange={() => updateFormData('hasContainer', 'YES')}
              className="w-5 h-5 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Тийм</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hasContainer"
              checked={formData.hasContainer === 'NO'}
              onChange={() => updateFormData('hasContainer', 'NO')}
              className="w-5 h-5 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Үгүй</span>
          </label>
        </div>

        {formData.hasContainer === 'YES' && (
          <Input
            label="Чингэлэгний дугаар"
            value={formData.containerNumber}
            onChange={(e) => updateFormData('containerNumber', e.target.value)}
            placeholder="Чингэлэгний дугаар оруулна уу"
          />
        )}
      </div>
    </div>
  );

  const renderTulbur = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Төлбөр</h3>
      
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Төлбөрийн мэдээлэл</p>
        
        {/* Нэхэмжлэл явуулсан эсэх */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <span className="text-sm text-gray-700">Нэхэмжлэл явуулсан эсэх</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="invoiceSent"
                checked={formData.invoiceSent === true}
                onChange={() => updateFormData('invoiceSent', true)}
                className="w-5 h-5 border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-green-700 font-medium">Тийм</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="invoiceSent"
                checked={formData.invoiceSent === false}
                onChange={() => updateFormData('invoiceSent', false)}
                className="w-5 h-5 border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-red-700 font-medium">Үгүй</span>
            </label>
          </div>
        </div>

        {/* Төлбөр төлөгдсөн эсэх */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <span className="text-sm text-gray-700">Төлбөр төлөгдсөн эсэх</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentReceived"
                checked={formData.paymentReceived === true}
                onChange={() => updateFormData('paymentReceived', true)}
                className="w-5 h-5 border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-green-700 font-medium">Тийм</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="paymentReceived"
                checked={formData.paymentReceived === false}
                onChange={() => updateFormData('paymentReceived', false)}
                className="w-5 h-5 border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-red-700 font-medium">Үгүй</span>
            </label>
          </div>
        </div>

        {/* Сул зогсолт */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <span className="text-sm text-gray-700">Сул зогсолт</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="idleTime"
                checked={formData.idleTime === true}
                onChange={() => updateFormData('idleTime', true)}
                className="w-5 h-5 border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-green-700 font-medium">Тийм</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="idleTime"
                checked={formData.idleTime === false}
                onChange={() => updateFormData('idleTime', false)}
                className="w-5 h-5 border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-red-700 font-medium">Үгүй</span>
            </label>
          </div>
        </div>

        {/* Тээвэр */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <span className="text-sm text-gray-700">Тээвэр</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="transportDone"
                checked={formData.transportDone === true}
                onChange={() => updateFormData('transportDone', true)}
                className="w-5 h-5 border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-green-700 font-medium">Тийм</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="transportDone"
                checked={formData.transportDone === false}
                onChange={() => updateFormData('transportDone', false)}
                className="w-5 h-5 border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-red-700 font-medium">Үгүй</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderOrderNote();
      case 2:
        return renderOrderPrice();
      case 3:
        return renderTeever();
      case 4:
        return renderTulbur();
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Урьдчилсан захиалга үүсгэх" maxWidth="form">
      <form onSubmit={handleSubmit}>
        {renderStepIndicator()}
        
        <div className="min-h-[400px]">
          {renderCurrentStep()}
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Өмнөх
          </Button>

          {currentStep < 4 ? (
            <Button type="button" onClick={handleNext}>
              Дараах
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading || !formData.name}>
              {isLoading ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
