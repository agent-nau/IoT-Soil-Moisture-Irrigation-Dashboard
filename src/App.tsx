import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, LayoutDashboard, Settings, Bell, Search, Plus, Info, Battery, Signal, Thermometer, LogOut, Github, Edit2, Check } from 'lucide-react';
import { SensorData, SensorReading } from './types';
import { fetchSheetData } from './services/googleSheetsService';
import { fetchSupabaseData } from './services/supabaseService';
import { SensorCard } from './components/SensorCard';
import { MoistureChart } from './components/MoistureChart';
import { SetupModal } from './components/SetupModal';
import { Login } from './components/Login';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';

const DEFAULT_SHEET_ID = '1-X_your_sheet_id_here';

import { Dashboard } from './components/Dashboard';
import { Privacy } from './components/Privacy';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [sharedSensorId, setSharedSensorId] = useState<string | null>(() => {
    const raw = localStorage.getItem('sharedSensorId');
    return raw?.includes(':') ? raw.split(':')[0] : raw;
  });
  const [sharedMonitorName, setSharedMonitorName] = useState<string | null>(() => {
    const raw = localStorage.getItem('sharedSensorId');
    return raw?.includes(':') ? raw.split(':')[1] : localStorage.getItem('sharedMonitorName');
  });
  const [monitorName, setMonitorName] = useState<string | null>(localStorage.getItem('monitor_name'));
  const [customSheetId, setCustomSheetId] = useState<string | null>(localStorage.getItem('customSheetId'));
  const [rawSheetUrl, setRawSheetUrl] = useState<string | null>(localStorage.getItem('rawSheetUrl'));
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [setupMode, setSetupMode] = useState<'add' | 'edit'>('add');
  const [sensorName, setSensorName] = useState<string>(localStorage.getItem('sensor_name') || 'Soil Moisture Detector');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const navigate = useNavigate();

  const sheetId = customSheetId;

  const loadData = useCallback(async (forcedId?: string) => {
    setLoading(true);
    try {
      let sheetReadings: SensorReading[] = [];
      let supabaseReadings: SensorReading[] = [];
      
      const currentSheetId = forcedId || sheetId;
      
      // Fetch from Google Sheets if configured
      if (currentSheetId && currentSheetId !== '1-X_your_sheet_id_here') {
        sheetReadings = await fetchSheetData(currentSheetId);
      }

      // Fetch from Supabase Database
      supabaseReadings = await fetchSupabaseData();

      // Filter by custom sheet ID or shared sensor if specified
      if (customSheetId) {
        supabaseReadings = supabaseReadings.filter(r => r.sensorId === customSheetId);
      } else if (sharedSensorId) {
        supabaseReadings = supabaseReadings.filter(r => r.sensorId === sharedSensorId);
      } else {
        // If neither is set, we don't show random sensors from Supabase
        supabaseReadings = [];
      }

      // Merge and deduplicate readings
      const readings = [...sheetReadings, ...supabaseReadings].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

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
            name: sensorName,
            readings: group,
            currentValue: Math.round(sorted[0].value),
            lastUpdated: sorted[0].timestamp,
            battery: 75 + Math.floor(Math.random() * 25),
            signal: 60 + Math.floor(Math.random() * 40),
          };
        }).slice(0, 1);
      } else if (customSheetId && customSheetId !== '1-X_your_sheet_id_here') {
        // Create a placeholder sensor if we have an explicitly added sheet ID but no readings yet
        sensorData = [{
          id: customSheetId.length > 15 ? 'Sensor Code' : customSheetId,
          name: sensorName,
          readings: [],
          currentValue: null,
          lastUpdated: null,
          battery: null,
          signal: null,
        }];
      } else if (sharedSensorId) {
        // Show the shared sensor even if it has no readings yet
        sensorData = [{
          id: sharedSensorId,
          name: sharedMonitorName || 'Guest Monitor',
          readings: [],
          currentValue: null,
          lastUpdated: null,
          battery: null,
          signal: null,
        }];
      }

      setSensors(sensorData);
      
      // If we are forcing a new ID or don't have a selection, pick the first one
      if ((forcedId || !selectedSensorId) && sensorData.length > 0) {
        setSelectedSensorId(sensorData[0].id);
      } else if (sensorData.length === 0) {
        setSelectedSensorId(null);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Check your Google Sheet ID and sharing settings.');
      console.error(err);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [sheetId, selectedSensorId, sharedSensorId, sensorName]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setMonitorName(currentUser.user_metadata?.monitor_name || null);
        setCustomSheetId(currentUser.user_metadata?.custom_sheet_id || null);
        setSensorName(currentUser.user_metadata?.sensor_name || 'Soil Moisture Detector');
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setMonitorName(currentUser.user_metadata?.monitor_name || null);
        setCustomSheetId(currentUser.user_metadata?.custom_sheet_id || null);
        setSensorName(currentUser.user_metadata?.sensor_name || 'Soil Moisture Detector');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user || sharedSensorId) {
      loadData();
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [loadData, user, sharedSensorId]);

  const handleSetMonitorName = async (name: string, shouldOpenSetup = true) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { monitor_name: name }
      });
      if (error) throw error;
      
      setMonitorName(name);
      localStorage.setItem('monitor_name', name);
      if (shouldOpenSetup) setIsSetupOpen(true);
      setIsEditingName(false);
    } catch (err) {
      console.error('Error saving monitor name:', err);
      setMonitorName(name);
      localStorage.setItem('monitor_name', name);
      setIsEditingName(false);
    }
  };

  const handleRemoveSensor = async () => {
    try {
      if (user) {
        const { error } = await supabase.auth.updateUser({
          data: { 
            custom_sheet_id: null,
            raw_sheet_url: null
          }
        });
        if (error) throw error;
      }
      
      localStorage.removeItem('customSheetId');
      localStorage.removeItem('rawSheetUrl');
      setCustomSheetId(null);
      setRawSheetUrl(null);
      setSensors([]);
      setSelectedSensorId(null);
      setError(null);
    } catch (err) {
      console.error('Error removing sensor:', err);
      localStorage.removeItem('customSheetId');
      localStorage.removeItem('rawSheetUrl');
      setCustomSheetId(null);
      setRawSheetUrl(null);
      setSensors([]);
      setSelectedSensorId(null);
    }
  };

  const handleRenameSensor = async (name: string) => {
    try {
      if (user) {
        const { error } = await supabase.auth.updateUser({
          data: { sensor_name: name }
        });
        if (error) throw error;
      }
      
      localStorage.setItem('sensor_name', name);
      setSensorName(name);
      // Immediately update local sensors state to reflect name change
      setSensors(prev => prev.map(s => ({ ...s, name })));
    } catch (err) {
      console.error('Error renaming sensor:', err);
      // Fallback to local storage if supabase fails
      localStorage.setItem('sensor_name', name);
      setSensorName(name);
      setSensors(prev => prev.map(s => ({ ...s, name })));
    }
  };

  const handleAddSensor = async (id: string, rawUrl: string) => {
    setLoading(true);
    try {
      if (user) {
        const { error } = await supabase.auth.updateUser({
          data: { 
            custom_sheet_id: id,
            raw_sheet_url: rawUrl
          }
        });
        if (error) throw error;
      }
      
      localStorage.setItem('customSheetId', id);
      localStorage.setItem('rawSheetUrl', rawUrl);
      setCustomSheetId(id);
      setRawSheetUrl(rawUrl);
      setSelectedSensorId(null); // Reset selection to force auto-select of new sensor
      await loadData(id);
    } catch (err) {
      console.error('Error saving sheet ID:', err);
      localStorage.setItem('customSheetId', id);
      localStorage.setItem('rawSheetUrl', rawUrl);
      setCustomSheetId(id);
      setRawSheetUrl(rawUrl);
      await loadData(id);
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem('monitor_name');
    localStorage.removeItem('customSheetId');
    localStorage.removeItem('sharedSensorId');
    localStorage.removeItem('sharedMonitorName');
    setMonitorName(null);
    setCustomSheetId(null);
    setSharedSensorId(null);
    setSharedMonitorName(null);
    await supabase.auth.signOut();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-maroon-950 flex items-center justify-center">
        <RefreshCw className="text-gold-500 animate-spin" size={32} />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route 
        path="/home" 
        element={
          (user || sharedSensorId) ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onSharedAccess={(combinedCode) => {
              const [id, name] = combinedCode.includes(':') ? combinedCode.split(':') : [combinedCode, ''];
              setSharedSensorId(id);
              setSharedMonitorName(name || 'Guest Monitor');
              localStorage.setItem('sharedSensorId', combinedCode);
              if (name) localStorage.setItem('sharedMonitorName', name);
              navigate('/dashboard');
            }} />
          )
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          (!user && !sharedSensorId) ? (
            <Navigate to="/home" replace />
          ) : (user && !monitorName) ? (
            <div className="min-h-screen bg-maroon-950 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-maroon-900 border border-gold-500/20 rounded-3xl p-8 shadow-2xl"
              >
                <div className="flex flex-col items-center mb-8">
                   <div className="w-20 h-20 bg-gold-500/10 rounded-2xl flex items-center justify-center mb-4">
                     <LayoutDashboard className="text-gold-400" size={40} />
                   </div>
                   <h2 className="text-2xl font-bold text-white">Name Your Monitor</h2>
                   <p className="text-maroon-300 text-sm mt-2 text-center">Give your irrigation system a name before entering the dashboard.</p>
                </div>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const name = (e.target as any).monitorName.value;
                    if (name) handleSetMonitorName(name);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gold-400 ml-1">Monitor Name</label>
                    <input 
                      name="monitorName"
                      required
                      autoFocus
                      placeholder="e.g. Backyard Garden"
                      className="w-full bg-maroon-950/80 border border-gold-500/30 rounded-xl py-3 px-4 text-gold-50 placeholder:text-gold-500/30 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-gold-500 hover:bg-gold-400 text-maroon-950 font-bold py-4 rounded-xl transition-all shadow-lg shadow-gold-500/20"
                  >
                    Set Name & Enter Dashboard
                  </button>
                </form>
              </motion.div>
            </div>
          ) : (
            <div className="min-h-screen bg-maroon-950 text-gold-50 font-sans">
              <SetupModal 
                isOpen={isSetupOpen} 
                onClose={() => setIsSetupOpen(false)} 
                onAddSensor={handleAddSensor}
                user={user} 
                isRequired={false}
                mode={setupMode}
                initialSheetId={rawSheetUrl || ''}
              />
              
              <header className="sticky top-0 z-10 bg-maroon-900/80 backdrop-blur-md border-b border-maroon-800/50">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                  <div className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80" onClick={() => navigate('/dashboard')}>
                    <div className="w-10 h-10 flex items-center justify-center p-1">
              <img 
                src="/liceo.png" 
                alt="Liceo Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/liceo.png';
                }}
              />
            </div>
            <div className="flex flex-col">
              {isEditingName ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (tempName.trim()) handleSetMonitorName(tempName.trim(), false);
                  }}
                  className="flex items-center gap-2"
                >
                  <input 
                    autoFocus
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-maroon-950/50 border border-gold-500/30 rounded px-2 py-0.5 text-sm text-gold-50 focus:outline-none focus:ring-1 focus:ring-gold-500/50 w-32"
                  />
                  <button type="submit" className="text-emerald-400 hover:text-emerald-300">
                    <Check size={16} />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="font-bold text-lg tracking-tight text-gold-50 leading-none">
                    {monitorName || 'LDCU Soil Moisture'}
                  </h1>
                  {user && (
                    <button 
                      onClick={() => {
                        setTempName(monitorName || '');
                        setIsEditingName(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-maroon-400 hover:text-gold-400"
                    >
                      <Edit2 size={12} />
                    </button>
                  )}
                </div>
              )}
              <span className="text-[10px] text-maroon-300 font-bold uppercase tracking-widest mt-1">Detector System</span>
            </div>
          </div>
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={user ? handleSignOut : () => {
                        localStorage.removeItem('sharedSensorId');
                        localStorage.removeItem('sharedMonitorName');
                        setSharedSensorId(null);
                        setSharedMonitorName(null);
                        navigate('/home');
                      }}
                      className="p-2 text-maroon-300 hover:text-red-400 transition-colors flex items-center gap-2"
                      title={user ? "Sign Out" : "Exit Monitor"}
                    >
                      <LogOut size={20} />
                  </button>
                  {user ? (
                    <button 
                      onClick={() => navigate('/profile')}
                      className="w-8 h-8 rounded-full bg-maroon-800 border border-maroon-700 shadow-sm overflow-hidden hover:ring-2 hover:ring-gold-500 transition-all flex items-center justify-center p-0"
                    >
                      <img 
                        src={user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://ui-avatars.com/api/?name=${user.email}&background=fbbf24&color=4c0519`} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer" 
                      />
                    </button>
                  ) : (
                    <div className="px-3 py-1 bg-gold-500/10 border border-gold-500/20 rounded-full flex items-center gap-2">
                       <Signal size={12} className="text-gold-400 animate-pulse" />
                       <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">
                         {sharedMonitorName ? `Monitor: ${sharedMonitorName}` : 'Guest Monitor'}
                       </span>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <Dashboard 
              sensors={sensors}
              selectedSensorId={selectedSensorId}
              setSelectedSensorId={setSelectedSensorId}
              loading={loading}
              error={error}
              lastRefresh={lastRefresh}
              setIsSetupOpen={(open) => {
                setSetupMode('add');
                setIsSetupOpen(open);
              }}
              onRemoveSensor={handleRemoveSensor}
              onEditSensor={() => {
                setSetupMode('edit');
                setIsSetupOpen(true);
              }}
              onRenameSensor={handleRenameSensor}
              user={user}
            />

            <footer className="max-w-5xl mx-auto px-4 py-12 border-t border-maroon-900/50 mt-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2 opacity-50">
                  <div className="w-6 h-6 bg-maroon-800 rounded flex items-center justify-center text-gold-400">
                    <RefreshCw size={12} />
                  </div>
                  <span className="text-xs font-bold tracking-widest uppercase text-maroon-200">Soil Moisture Detector v1.0</span>
                </div>
                <div className="flex gap-8 text-xs font-medium text-maroon-400">
                  <a 
                    href="https://github.com/agent-nau/IoT-Soil-Moisture-Irrigation-Dashboard" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-gold-400 transition-colors"
                  >
                    <Github size={14} />
                    <span>Public Repo</span>
                  </a>
                  <Link to="/privacy" className="hover:text-gold-400 transition-colors">Privacy</Link>
                </div>
              </div>
            </footer>
          </div>
        )
      } 
    />
      <Route 
        path="/profile" 
        element={
          !user ? <Navigate to="/home" /> : (
            <div className="min-h-screen bg-maroon-950 text-gold-50 font-sans">
              <header className="sticky top-0 z-10 bg-maroon-900/80 backdrop-blur-md border-b border-maroon-800/50">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <div className="w-8 h-8 flex items-center justify-center p-1">
                      <img src="/liceo.png" alt="Liceo Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="font-bold text-lg tracking-tight text-gold-50">LDCU Soil Moisture Detector</h1>
                  </div>
                  <button onClick={() => navigate('/dashboard')} className="text-xs font-bold uppercase tracking-widest text-gold-400 hover:text-white transition-colors">
                    Back to Dashboard
                  </button>
                </div>
              </header>

              <main className="max-w-2xl mx-auto px-4 py-12">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-maroon-900/30 border border-gold-500/20 rounded-3xl p-8 shadow-xl backdrop-blur-sm"
                >
                  <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-gold-500 p-1 mb-4">
                      <img 
                        src={user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://ui-avatars.com/api/?name=${user.email}&size=128&background=fbbf24&color=4c0519`} 
                        alt="Profile" 
                        className="w-full h-full rounded-full border-4 border-maroon-900 object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-gold-50">{user.user_metadata?.full_name || user.user_metadata?.name || user.email}</h2>
                    <p className="text-maroon-300 text-sm mt-1 uppercase tracking-widest font-bold">{user.email}</p>
                    <p className="text-maroon-400 text-[10px] mt-2 uppercase tracking-tighter opacity-50 font-bold">LDCU Soil Moisture Detector Account</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-maroon-900/40 rounded-2xl border border-maroon-800/50">
                      <p className="text-xs text-maroon-400 font-bold uppercase tracking-widest mb-1">User ID</p>
                      <p className="text-sm font-mono text-gold-200 truncate">{user.id}</p>
                    </div>
                    <div className="p-4 bg-maroon-900/40 rounded-2xl border border-maroon-800/50">
                      <p className="text-xs text-maroon-400 font-bold uppercase tracking-widest mb-1">Last Login</p>
                      <p className="text-sm text-gold-200">{new Date(user.last_sign_in_at || '').toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-maroon-900/40 rounded-2xl border border-maroon-800/50">
                      <p className="text-xs text-maroon-400 font-bold uppercase tracking-widest mb-1">Status</p>
                      <p className="text-sm text-emerald-400 font-bold">Active Account</p>
                    </div>
                  </div>

                  <button 
                    onClick={handleSignOut}
                    className="w-full mt-8 bg-maroon-800 hover:bg-red-900/40 text-red-200 font-bold py-4 rounded-2xl transition-all border border-red-900/30 hover:border-red-500/50"
                  >
                    Logout from Profile
                  </button>
                </motion.div>
              </main>
            </div>
          )
        } 
      />
      <Route path="/privacy" element={<Privacy />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}


