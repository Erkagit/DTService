import { Truck, User, Phone, Activity, Edit2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { VehicleCardProps } from '@/types/types';

export function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-3xl font-bold text-green-600 mb-2">{vehicle.plateNo}</p>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{vehicle.driverName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{vehicle.driverPhone}</span>
              </div>
            </div>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <Truck className="w-6 h-6 text-green-600" />
          </div>
        </div>

        {vehicle.device && (
          <div className="space-y-2 text-sm pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <Activity className="w-4 h-4" />
              <span>
                GPS: <span className="font-medium text-gray-900">{vehicle.device.deviceId}</span>
              </span>
            </div>
            {vehicle.pings && vehicle.pings.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Last ping: {new Date(vehicle.pings[0].at).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardFooter className="pt-4 border-t border-gray-100">
        <div className="flex gap-2 w-full">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(vehicle);
            }}
            variant="ghost"
            icon={Edit2}
            fullWidth
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
          >
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(vehicle);
            }}
            variant="ghost"
            icon={Trash2}
            fullWidth
            className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
          >
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
