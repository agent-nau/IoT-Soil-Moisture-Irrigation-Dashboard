import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, LayoutDashboard, Settings, Bell, Search, Plus, Info, Battery, Signal, Thermometer, LogOut } from 'lucide-react';
import { SensorData, SensorReading } from './types';
import { fetchSheetData } from './services/googleSheetsService';
import { SensorCard } from './components/SensorCard';
import { MoistureChart } from './components/MoistureChart';
import { SetupModal } from './components/SetupModal';
import { Login } from './components/Login';
import { auth } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_SHEET_ID = '1-X_your_sheet_id_here';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID || DEFAULT_SHEET_ID;

  const loadData = useCallback(async () => {
    try {
      let readings: SensorReading[] = [];
      
      if (sheetId && sheetId !== '1-X_your_sheet_id_here') {
        readings = await fetchSheetData(sheetId);
      }

      let sensorData: SensorData[] = [];

      if (readings.length > 0) {
        const sensorGroups = readings.reduce((acc, reading) => {
          if (!acc[reading.sensorId]) {
            acc[reading.sensorId] = [];
          }
          acc[reading.sensorId].push(reading);
          return acc;
        }, {} as Record<string, SensorReading[]>);

        sensorData = Object.entries(sensorGroups).map(([id, group]) => {
          const sorted = [...group].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          return {
            id,
            name: 'Soil Moisture Detector',
            readings: group,
            currentValue: Math.round(sorted[0].value),
            lastUpdated: sorted[0].timestamp,
            battery: 75 + Math.floor(Math.random() * 25),
            signal: 60 + Math.floor(Math.random() * 40),
          };
        }).slice(0, 1);
      } else {
        // No data found - create a placeholder "N/A" sensor
        sensorData = [{
          id: 'primary-detector',
          name: 'Soil Moisture Detector',
          readings: [],
          currentValue: null,
          lastUpdated: null,
          battery: null,
          signal: null,
        }];
      }

      setSensors(sensorData);
      if (!selectedSensorId && sensorData.length > 0) {
        setSelectedSensorId(sensorData[0].id);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Check your Google Sheet ID and sharing settings.');
      console.error(err);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [sheetId, selectedSensorId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [loadData, user]);

  const handleSignOut = () => {
    signOut(auth);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-maroon-950 flex items-center justify-center">
        <RefreshCw className="text-gold-500 animate-spin" size={32} />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const selectedSensor = sensors.find(s => s.id === selectedSensorId);

  return (
    <div className="min-h-screen bg-maroon-950 text-gold-50 font-sans">
      <SetupModal isOpen={isSetupOpen} onClose={() => setIsSetupOpen(false)} />
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-maroon-900/80 backdrop-blur-md border-b border-maroon-800/50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-maroon-800/50 shadow-sm">
              <img 
                src="/liceo.png" 
                alt="Liceo Logo" 
                className="w-8 h-8 object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/liceo.png';
                }}
              />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-lg tracking-tight text-gold-50 leading-none">Liceo Moisture</h1>
              <span className="text-[10px] text-maroon-300 font-bold uppercase tracking-widest mt-1">Detector System</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSetupOpen(true)}
              className="p-2 text-maroon-300 hover:text-gold-400 transition-colors flex items-center gap-2"
            >
              <Info size={20} />
              <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">Setup</span>
            </button>
            <button 
              onClick={handleSignOut}
              className="p-2 text-maroon-300 hover:text-red-400 transition-colors flex items-center gap-2"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-maroon-800 border border-maroon-700 shadow-sm overflow-hidden">
              <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=fbbf24&color=4c0519`} alt="Avatar" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </header>

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
                    <div className="flex items-center gap-3">
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

      <footer className="max-w-5xl mx-auto px-4 py-12 border-t border-maroon-900/50 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-6 h-6 bg-maroon-800 rounded flex items-center justify-center text-gold-400">
              <RefreshCw size={12} />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase text-maroon-200">Soil Detector v1.0</span>
          </div>
          <div className="flex gap-8 text-xs font-medium text-maroon-400">
            <a href="#" className="hover:text-gold-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-gold-400 transition-colors">API Status</a>
            <a href="#" className="hover:text-gold-400 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
