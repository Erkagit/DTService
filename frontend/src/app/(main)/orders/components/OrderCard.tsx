import { useState } from 'react';
import { 
  MapPin, 
  Truck, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Building2, 
  Edit, 
  MoreVertical,
  FileText,
  Scale,
  Box,
  CreditCard,
  CheckCircle,
  XCircle,
  Ruler,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, VEHICLE_TYPE_LABELS, TRAILER_TYPE_LABELS, type OrderStatus } from '@/types/types';
import type { OrderCardProps } from '@/types/types';

// Helper component for document/payment badges
function StatusBadge({ label, isActive, variant = 'default' }: { 
  label: string; 
  isActive: boolean;
  variant?: 'default' | 'payment';
}) {
  const baseClasses = 'px-2 py-1 text-xs rounded-md flex items-center gap-1';
  const activeClasses = variant === 'payment' 
    ? 'bg-green-50 text-green-700 border border-green-200' 
    : 'bg-blue-50 text-blue-700 border border-blue-200';
  const inactiveClasses = 'bg-gray-50 text-gray-400 border border-gray-200';
  
  return (
    <span className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {label}
    </span>
  );
}

// Section component for grouping info
function Section({ title, icon: Icon, children, className = '' }: { 
  title: string; 
  icon?: any;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h4>
      </div>
      {children}
    </div>
  );
}

export function OrderCard({
  order,
  canUpdate,
  previousStatus,
  nextStatus,
  onQuickUpdate,
  onDelete,
  onChangeVehicle,
  isDeleting = false,
  isChangingVehicle = false,
}: OrderCardProps & { isDeleting?: boolean; isChangingVehicle?: boolean }) {
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const preOrder = order.preOrders && order.preOrders.length > 0 ? order.preOrders[0] : null;
  const hasPreOrderData = !!preOrder;

  const handleDeleteClick = (e: React.MouseEvent) => {
    console.log('🗑️ DELETE CLICKED', { orderId: order.id, orderCode: order.code });
    e.preventDefault();
    e.stopPropagation();
    setShowEditMenu(false);
    if (onDelete) {
      console.log('🗑️ Calling onDelete handler...');
      onDelete(order);
    } else {
      console.warn('⚠️ onDelete handler is not defined!');
    }
  };

  const handleChangeVehicleClick = (e: React.MouseEvent) => {
    console.log('🚚 CHANGE VEHICLE CLICKED', { orderId: order.id, orderCode: order.code });
    e.preventDefault();
    e.stopPropagation();
    setShowEditMenu(false);
    if (onChangeVehicle) {
      console.log('🚚 Calling onChangeVehicle handler...');
      onChangeVehicle(order);
    } else {
      console.warn('⚠️ onChangeVehicle handler is not defined!');
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      {/* Header Section */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* Status Badge */}
            <div className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full mb-2 ${ORDER_STATUS_COLORS[order.status as OrderStatus]}`}>
              {ORDER_STATUS_LABELS[order.status as OrderStatus]}
            </div>
            
            {/* Order Code */}
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{order.code}</h3>
            
            {/* Company */}
            {order.company && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span>{order.company.name}</span>
              </div>
            )}
          </div>
          
          {/* Actions Menu */}
          {(onChangeVehicle || onDelete) && (
            <Dropdown
              isOpen={showEditMenu}
              onClose={() => setShowEditMenu(false)}
              trigger={
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowEditMenu(!showEditMenu);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  disabled={isDeleting || isChangingVehicle}
                >
                  {(isDeleting || isChangingVehicle) ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <MoreVertical className="w-5 h-5" />
                  )}
                </Button>
              }
              className="min-w-48"
            >
              <div className="py-1">
                {onChangeVehicle && (
                  <button
                    onClick={handleChangeVehicleClick}
                    disabled={isChangingVehicle}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingVehicle ? (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    ) : (
                      <Edit className="w-4 h-4 text-blue-500" />
                    )}
                    <span>{isChangingVehicle ? 'Солиж байна...' : 'Машин солих'}</span>
                  </button>
                )}
                {onDelete && (
                  <>
                    {onChangeVehicle && <div className="border-t border-gray-100 my-1" />}
                    <button
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      <span>{isDeleting ? 'Устгаж байна...' : 'Захиалга устгах'}</span>
                    </button>
                  </>
                )}
              </div>
            </Dropdown>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* 📍 Location Info */}
        <Section title="Байршил" icon={MapPin}>
          <div className="space-y-2 pl-1">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
              <div>
                <span className="text-xs text-gray-400">Авах газар</span>
                <p className="text-sm text-gray-900">{order.origin || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
              <div>
                <span className="text-xs text-gray-400">Хүргэх газар</span>
                <p className="text-sm text-gray-900">{order.destination || '-'}</p>
              </div>
            </div>
          </div>
        </Section>

        {/* 🚚 Vehicle Info */}
        <Section title="Тээврийн хэрэгсэл" icon={Truck}>
          {order.vehicle ? (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{order.vehicle.plateNo}</p>
                  <p className="text-sm text-gray-500">{order.vehicle.driverName}</p>
                </div>
                {order.vehicle.driverPhone && (
                  <a 
                    href={`tel:${order.vehicle.driverPhone}`}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    {order.vehicle.driverPhone}
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Машин оноогдоогүй</p>
          )}
        </Section>

        {/* PreOrder Details - Collapsible */}
        {hasPreOrderData && (
          <>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between py-2 px-3 bg-blue-50 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <span className="font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Урьдчилсан захиалгын мэдээлэл
              </span>
              <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>

            {isExpanded && preOrder && (
              <div className="space-y-4 pt-2">
                {/* 📦 Cargo Details */}
                <Section title="Ачааны мэдээлэл" icon={Box}>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-gray-400 text-xs">Нэр</span>
                      <p className="font-medium text-gray-900">{preOrder.name || '-'}</p>
                    </div>
                    {preOrder.weight && (
                      <div className="bg-gray-50 rounded-lg p-2">
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          <Scale className="w-3 h-3" /> Жин
                        </span>
                        <p className="font-medium text-gray-900">{preOrder.weight} тн</p>
                      </div>
                    )}
                    {preOrder.dimension && (
                      <div className="bg-gray-50 rounded-lg p-2">
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          <Ruler className="w-3 h-3" /> Хэмжээ
                        </span>
                        <p className="font-medium text-gray-900">{preOrder.dimension}</p>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-gray-400 text-xs">Машин төрөл</span>
                      <p className="font-medium text-gray-900">{VEHICLE_TYPE_LABELS[preOrder.vehicleType]}</p>
                    </div>
                    {preOrder.trailerType && (
                      <div className="bg-gray-50 rounded-lg p-2">
                        <span className="text-gray-400 text-xs">Чиргүүл</span>
                        <p className="font-medium text-gray-900">{TRAILER_TYPE_LABELS[preOrder.trailerType]}</p>
                      </div>
                    )}
                    {preOrder.hasContainer === 'YES' && (
                      <div className="bg-gray-50 rounded-lg p-2">
                        <span className="text-gray-400 text-xs">Чингэлэг дугаар</span>
                        <p className="font-medium text-gray-900">{preOrder.containerNumber || 'Тийм'}</p>
                      </div>
                    )}
                  </div>
                </Section>

                {/* 📄 Documents */}
                <Section title="Бичиг баримт" icon={FileText}>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge label="Invoice" isActive={preOrder.invoice} />
                    <StatusBadge label="Package List" isActive={preOrder.packageList} />
                    <StatusBadge label="Origin" isActive={preOrder.originDoc} />
                  </div>
                </Section>

                {/* 💰 Payment Status */}
                <Section title="Төлбөр" icon={CreditCard}>
                  <div className="grid grid-cols-2 gap-2">
                    <StatusBadge label="Нэхэмжлэл" isActive={preOrder.invoiceSent} variant="payment" />
                    <StatusBadge label="Төлбөр" isActive={preOrder.paymentReceived} variant="payment" />
                    <StatusBadge label="Сул зогсолт" isActive={preOrder.idleTime} variant="payment" />
                    <StatusBadge label="Тээвэр" isActive={preOrder.transportDone} variant="payment" />
                  </div>
                </Section>

                {/* 💵 Price Summary */}
                {(preOrder.totalAmount || preOrder.transportCost) && (
                  <Section title="Үнийн мэдээлэл" icon={CreditCard}>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 space-y-2">
                      {preOrder.loadingCost && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Ачилт:</span>
                          <span className="font-medium">{preOrder.loadingCost.toLocaleString()}₮</span>
                        </div>
                      )}
                      {preOrder.transportCost && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Тээвэр:</span>
                          <span className="font-medium">{preOrder.transportCost.toLocaleString()}₮</span>
                        </div>
                      )}
                      {preOrder.totalAmount && (
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                          <span className="text-gray-700 font-medium">Нийт:</span>
                          <span className="font-bold text-blue-600">{preOrder.totalAmount.toLocaleString()}₮</span>
                        </div>
                      )}
                    </div>
                  </Section>
                )}
              </div>
            )}
          </>
        )}

        {/* 📅 Date Info */}
        <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-100">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            Үүсгэсэн: {new Date(order.createdAt).toLocaleDateString('mn-MN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      {/* Status Update Actions - Only show when canUpdate and onQuickUpdate is provided */}
      {canUpdate && onQuickUpdate && (previousStatus || nextStatus) && (
        <div className="px-4 pb-4">
          <div className="flex gap-2">
            {previousStatus && (
              <Button
                onClick={() => onQuickUpdate(order, previousStatus)}
                variant="secondary"
                size="sm"
                fullWidth
                className="text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Өмнөх</span>
              </Button>
            )}
            {nextStatus && (
              <Button
                onClick={() => onQuickUpdate(order, nextStatus)}
                size="sm"
                fullWidth
                className="text-sm bg-blue-600 text-white hover:bg-blue-700"
              >
                <span className="hidden sm:inline mr-1">Дараах</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
