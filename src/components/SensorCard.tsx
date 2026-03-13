import React from 'react';
import { Droplets, Thermometer, Clock, Battery, Signal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SensorData } from '../types';

interface SensorCardProps {
  data: SensorData;
  isActive: boolean;
  onClick: () => void;
}

export const SensorCard: React.FC<SensorCardProps> = ({ data, isActive, onClick }) => {
  const getStatusColor = (value: number | null) => {
    if (value === null) return 'text-rose-300/40';
    if (value < 20) return 'text-red-400';
    if (value < 40) return 'text-amber-400';
    return 'text-amber-200';
  };

  const getBatteryIcon = (level: number | null) => {
    if (level === null) return <Battery size={12} className="text-rose-300/20" />;
    if (level > 80) return <Battery size={12} className="text-emerald-400" />;
    if (level > 20) return <Battery size={12} className="text-amber-400" />;
    return <Battery size={12} className="text-red-400" />;
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border ${
        isActive 
          ? 'bg-rose-900/40 shadow-lg border-amber-500/30 ring-1 ring-amber-500/20' 
          : 'bg-rose-900/10 border-transparent hover:bg-rose-900/20 hover:border-rose-800/30'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-900/30 text-rose-400'}`}>
            <Droplets size={18} />
          </div>
          <span className={`font-medium ${isActive ? 'text-white' : 'text-rose-100'}`}>{data.name}</span>
        </div>
        <span className={`text-2xl font-bold ${getStatusColor(data.currentValue)}`}>
          {data.currentValue !== null ? `${data.currentValue}%` : 'N/A'}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-xs text-rose-300/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{data.lastUpdated ? `${formatDistanceToNow(data.lastUpdated)} ago` : 'No data'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Signal size={12} className={data.signal !== null ? (data.signal > 70 ? 'text-emerald-400' : 'text-amber-400') : 'text-rose-300/20'} />
            <span>{data.signal !== null ? `${data.signal}%` : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            {getBatteryIcon(data.battery)}
            <span>{data.battery !== null ? `${data.battery}%` : 'N/A'}</span>
          </div>
        </div>
      </div>
    </button>
  );
};
