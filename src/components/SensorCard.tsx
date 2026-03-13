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
    if (value === null) return 'text-maroon-300/40';
    if (value < 20) return 'text-red-400';
    if (value < 40) return 'text-gold-400';
    return 'text-gold-200';
  };

  const getBatteryIcon = (level: number | null) => {
    if (level === null) return <Battery size={12} className="text-maroon-300/20" />;
    if (level > 80) return <Battery size={12} className="text-emerald-400" />;
    if (level > 20) return <Battery size={12} className="text-gold-400" />;
    return <Battery size={12} className="text-red-400" />;
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border ${
        isActive 
          ? 'bg-maroon-900/40 shadow-lg border-gold-500/30 ring-1 ring-gold-500/20' 
          : 'bg-maroon-900/10 border-transparent hover:bg-maroon-900/20 hover:border-maroon-800/30'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${isActive ? 'bg-gold-500/20 text-gold-400' : 'bg-maroon-900/30 text-maroon-400'}`}>
            <Droplets size={18} />
          </div>
          <span className={`font-medium ${isActive ? 'text-white' : 'text-maroon-100'}`}>{data.name}</span>
        </div>
        <span className={`text-2xl font-bold ${getStatusColor(data.currentValue)}`}>
          {data.currentValue !== null ? `${data.currentValue}%` : 'N/A'}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-xs text-maroon-300/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{data.lastUpdated ? `${formatDistanceToNow(data.lastUpdated)} ago` : 'No data'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Signal size={12} className={data.signal !== null ? (data.signal > 70 ? 'text-emerald-400' : 'text-gold-400') : 'text-maroon-300/20'} />
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
