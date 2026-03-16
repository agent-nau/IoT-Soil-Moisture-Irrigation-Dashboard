import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, LayoutDashboard, Plus, Signal, Battery, Thermometer, Droplets, Waves, Copy, Check, Sparkles, Trash2, Settings, Edit2 } from 'lucide-react';
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
  onRemoveSensor?: () => void;
  onEditSensor?: () => void;
  onRenameSensor?: (name: string) => void;
  user: any;
}

export const Dashboard: React.FC<DashboardProps> = ({
  sensors,
  selectedSensorId,
  setSelectedSensorId,
  loading,
  error,
  lastRefresh,
  setIsSetupOpen,
  user,
  onRemoveSensor,
  onEditSensor,
  onRenameSensor
}) => {
  const [copied, setCopied] = React.useState(false);
  const [isEditingSensorName, setIsEditingSensorName] = React.useState(false);
  const [tempSensorName, setTempSensorName] = React.useState('');
  const [customName, setCustomName] = React.useState('');
  const [generatedCode, setGeneratedCode] = React.useState<string | null>(null);
  const selectedSensor = sensors.find(s => s.id === selectedSensorId);

  const getAccountName = () => {
    return user?.user_metadata?.monitor_name || 
           user?.user_metadata?.full_name?.split(' ')[0] || 
           user?.user_metadata?.name?.split(' ')[0] || 
           user?.email?.split('@')[0] || 
           'Owner';
  };

  const generateUniqueCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Create prefix from custom name (e.g., "El Salvador" -> "ElSal")
    let prefix = 'LDCU';
    if (customName.trim()) {
      const cleanName = customName.trim().replace(/[^a-zA-Z0-9]/g, '');
      prefix = cleanName.length > 5 ? cleanName.substring(0, 5) : cleanName;
    }
    
    const accountName = getAccountName();
    const sensorNameStr = customName.trim() || 'Shared Sensor';
    setGeneratedCode(`${prefix}-${randomPart}:${accountName}:${sensorNameStr}`);
  };

  const handleCopyCode = () => {
    if (selectedSensor) {
      const accountName = getAccountName();
      navigator.clipboard.writeText(`${selectedSensor.id}:${accountName}:${selectedSensor.name}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyGenerated = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
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

          {/* Code Generator Card */}
          {user && (
            <div className="bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-500/20 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-gold-400">
                <Sparkles size={16} />
                <h3 className="text-xs font-bold uppercase tracking-widest">Unique Code Generator</h3>
              </div>
              <p className="text-[10px] text-maroon-300 leading-tight">
                Enter a location or name to create a personalized ID for your hardware.
              </p>
              
              <div className="relative">
                <input 
                  type="text"
                  placeholder="e.g. Backyard Garden"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-maroon-950/50 border border-gold-500/20 rounded-xl py-2 px-3 text-xs text-gold-50 placeholder:text-maroon-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all font-sans"
                />
              </div>

              {generatedCode ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between bg-black/20 rounded-xl p-2 border border-gold-500/30">
                    <code className="text-[11px] font-mono text-gold-400 font-bold ml-1 truncate" title={generatedCode}>{generatedCode}</code>
                    <button 
                      onClick={handleCopyGenerated}
                      className="p-2 text-gold-400 hover:bg-gold-500/10 rounded-lg transition-colors flex-shrink-0"
                    >
                      {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      setGeneratedCode(null);
                      setCustomName('');
                    }}
                    className="text-[10px] text-maroon-400 hover:text-gold-400 underline transition-colors"
                  >
                    Generate another
                  </button>
                </div>
              ) : (
                <button 
                  onClick={generateUniqueCode}
                  className="w-full py-2 bg-gold-500/20 hover:bg-gold-500/30 text-gold-400 text-xs font-bold rounded-xl border border-gold-500/30 transition-all uppercase tracking-widest"
                >
                  Generate ID
                </button>
              )}
            </div>
          )}

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
                  <div className="flex-1">
                    {isEditingSensorName ? (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (tempSensorName.trim() && onRenameSensor) {
                            onRenameSensor(tempSensorName.trim());
                            setIsEditingSensorName(false);
                          }
                        }}
                        className="flex items-center gap-2 mb-1"
                      >
                        <input 
                          autoFocus
                          value={tempSensorName}
                          onChange={(e) => setTempSensorName(e.target.value)}
                          className="bg-maroon-950/50 border border-gold-500/30 rounded px-2 py-1 text-xl font-bold text-white focus:outline-none focus:ring-1 focus:ring-gold-500/50 w-full max-w-sm"
                        />
                        <button type="submit" className="text-emerald-400 hover:text-emerald-300 p-1">
                          <Check size={20} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setIsEditingSensorName(false)}
                          className="text-maroon-400 hover:text-maroon-300 p-1"
                        >
                          <Plus size={20} className="rotate-45" />
                        </button>
                      </form>
                    ) : (
                      <div className="flex flex-col mb-1">
                        {selectedSensor.monitorName && (
                          <span className="text-[10px] text-maroon-300 font-bold uppercase tracking-widest mb-1 opacity-70">
                            {selectedSensor.monitorName}
                          </span>
                        )}
                        <div className="flex items-center gap-2 group">
                          <h2 className="text-2xl font-bold text-white">{selectedSensor.name}</h2>
                          {user && (
                            <button 
                              onClick={() => {
                                setTempSensorName(selectedSensor.name);
                                setIsEditingSensorName(true);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-maroon-400 hover:text-gold-400"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
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
                    <div className="flex items-center gap-2">
                      <div className="px-4 py-2 bg-maroon-900/40 rounded-xl text-xs font-medium text-maroon-200 flex items-center gap-2 border border-maroon-800/30">
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                        {selectedSensor.lastUpdated ? `Updated ${lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Waiting for data...'}
                      </div>
                      {onEditSensor && user && (
                        <button 
                          onClick={onEditSensor}
                          className="p-2 text-maroon-400 hover:text-gold-400 hover:bg-gold-500/10 rounded-xl transition-all border border-transparent hover:border-gold-500/20"
                          title="Edit Sensor"
                        >
                          <Settings size={18} />
                        </button>
                      )}
                       {onRemoveSensor && user && (
                         <button 
                           onClick={onRemoveSensor}
                           className="p-2 text-maroon-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                           title="Remove Sensor"
                         >
                           <Trash2 size={18} />
                         </button>
                       )}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 bg-maroon-900/40 rounded-2xl border border-maroon-800/30">
                    <p className="text-xs text-maroon-300 font-semibold uppercase tracking-wider mb-1">Moisture</p>
                    <div className="flex items-center gap-2">
                       <Droplets size={18} className="text-gold-400" />
                       <p className="text-2xl font-bold text-gold-400">{selectedSensor.currentValue !== null ? `${selectedSensor.currentValue}%` : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-maroon-900/40 rounded-2xl border border-maroon-800/30">
                    <p className="text-xs text-maroon-400 font-semibold uppercase tracking-wider mb-1">Temperature</p>
                    <div className="flex items-center gap-1">
                      <Thermometer size={18} className="text-maroon-400" />
                      <p className="text-2xl font-bold text-maroon-200">{selectedSensor.currentValue !== null ? '24°C' : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-maroon-900/40 rounded-2xl border border-maroon-800/30">
                    <p className="text-xs text-maroon-400 font-semibold uppercase tracking-wider mb-1">Water Threshold</p>
                    <div className="flex items-center gap-1">
                      <Waves size={18} className="text-maroon-400" />
                      <p className="text-2xl font-bold text-maroon-200">{selectedSensor.currentValue !== null ? '20L' : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-maroon-900/40 rounded-2xl border border-maroon-800/30">
                    <p className="text-xs text-maroon-400 font-semibold uppercase tracking-wider mb-1">Status</p>
                    <p className="text-2xl font-bold text-emerald-400">{selectedSensor.currentValue !== null ? 'Normal' : 'N/A'}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gold-50">Moisture Trend</h3>
                </div>

                <MoistureChart readings={selectedSensor.readings} />
              </motion.div>
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center text-maroon-300 bg-maroon-900/10 rounded-3xl border border-dashed border-maroon-800/30 p-8 text-center">
                <div className="w-16 h-16 bg-gold-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <Plus size={32} className="text-gold-400/50" />
                </div>
                <h3 className="text-lg font-bold text-gold-50 mb-2">No sensors yet</h3>
                <p className="text-sm text-maroon-300/60 max-w-xs">
                  {sensors.length === 0 
                    ? "Your dashboard is ready. Click the plus button on the left to add your first irrigation sensor."
                    : "Select a sensor from the sidebar to view detailed moisture level analysis."}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};
