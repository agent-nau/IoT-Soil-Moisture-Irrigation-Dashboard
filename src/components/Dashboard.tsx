import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, LayoutDashboard, Plus, Signal, Battery, Thermometer, Share2, Copy, Check } from 'lucide-react';
import { SensorData } from '../types';
import { SensorCard } from './SensorCard';
import { MoistureChart } from './MoistureChart';

interface DashboardProps {
  sensors: SensorData[];
  selectedSensorId: string | null;
  setSelectedSensorId: (id: string) => void;
  loading: boolean;
  error: string | null;
  lastRefresh: Date;
  setIsSetupOpen: (open: boolean) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  sensors,
  selectedSensorId,
  setSelectedSensorId,
  loading,
  error,
  lastRefresh,
  setIsSetupOpen
}) => {
  const [copied, setCopied] = React.useState(false);
  const selectedSensor = sensors.find(s => s.id === selectedSensorId);

  const handleCopyCode = () => {
    if (selectedSensor) {
      navigator.clipboard.writeText(selectedSensor.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar / Sensor List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-maroon-300/60">Your Sensors</h2>
            <button 
              onClick={() => setIsSetupOpen(true)}
              className="p-1 text-gold-400 hover:bg-maroon-900/50 rounded-md transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="space-y-3">
            {loading && sensors.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-maroon-900/30 rounded-2xl animate-pulse" />
              ))
            ) : (
              sensors.map(sensor => (
                <SensorCard 
                  key={sensor.id}
                  data={sensor}
                  isActive={selectedSensorId === sensor.id}
                  onClick={() => setSelectedSensorId(sensor.id)}
                />
              ))
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-200 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Main Content / Chart */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedSensor ? (
              <motion.div
                key={selectedSensor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-maroon-900/20 rounded-3xl p-6 md:p-8 shadow-sm border border-maroon-800/30 backdrop-blur-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{selectedSensor.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-maroon-200/70">
                      <div className="flex items-center gap-1">
                        <Signal size={14} className={selectedSensor.signal !== null ? 'text-emerald-400' : 'text-maroon-300/20'} />
                        <span>{selectedSensor.signal !== null ? `${selectedSensor.signal}% Signal` : 'Signal N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Battery size={14} className={selectedSensor.battery !== null ? 'text-gold-400' : 'text-maroon-300/20'} />
                        <span>{selectedSensor.battery !== null ? `${selectedSensor.battery}% Battery` : 'Battery N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-1 bg-maroon-900/40 rounded-xl px-2 py-1.5 border border-maroon-800/30 group">
                      <span className="text-[10px] uppercase font-bold text-maroon-400/70 tracking-tighter ml-1">Share Code:</span>
                      <code className="text-xs font-mono text-gold-400 px-2 select-all uppercase tracking-tight">{selectedSensor.id}</code>
                      <button 
                        onClick={handleCopyCode}
                        className="p-1.5 text-maroon-400 hover:text-gold-400 transition-colors rounded-lg hover:bg-gold-500/10"
                        title="Copy Share Code"
                      >
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div className="px-4 py-2 bg-maroon-900/40 rounded-xl text-xs font-medium text-maroon-200 flex items-center gap-2 border border-maroon-800/30">
                      <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                      {selectedSensor.lastUpdated ? `Updated ${lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Waiting for data...'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 bg-maroon-900/40 rounded-2xl border border-maroon-800/30">
                    <p className="text-xs text-maroon-300 font-semibold uppercase tracking-wider mb-1">Current</p>
                    <p className="text-2xl font-bold text-gold-400">{selectedSensor.currentValue !== null ? `${selectedSensor.currentValue}%` : 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gold-900/20 rounded-2xl border border-gold-800/20">
                    <p className="text-xs text-gold-400 font-semibold uppercase tracking-wider mb-1">Avg (24h)</p>
                    <p className="text-2xl font-bold text-gold-200">{selectedSensor.readings.length > 0 ? '42%' : 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-maroon-900/20 rounded-2xl border border-maroon-800/20">
                    <p className="text-xs text-maroon-400 font-semibold uppercase tracking-wider mb-1">Temp</p>
                    <div className="flex items-center gap-1">
                      <Thermometer size={16} className="text-maroon-400" />
                      <p className="text-2xl font-bold text-maroon-200">{selectedSensor.readings.length > 0 ? '24°C' : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-maroon-900/20 rounded-2xl border border-maroon-800/20">
                    <p className="text-xs text-maroon-400 font-semibold uppercase tracking-wider mb-1">High (24h)</p>
                    <p className="text-2xl font-bold text-maroon-200">{selectedSensor.readings.length > 0 ? '64%' : 'N/A'}</p>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gold-50">Moisture Trend</h3>
                  <div className="flex gap-2">
                    {['1H', '6H', '24H', '7D'].map(range => (
                      <button 
                        key={range}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors ${
                          range === '24H' ? 'bg-gold-500 text-maroon-950' : 'text-maroon-300 hover:bg-maroon-900/50'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                <MoistureChart readings={selectedSensor.readings} />
              </motion.div>
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center text-maroon-300/30 bg-maroon-900/10 rounded-3xl border border-dashed border-maroon-800/30">
                <LayoutDashboard size={48} className="mb-4 opacity-20" />
                <p>Select a sensor to view details</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};
