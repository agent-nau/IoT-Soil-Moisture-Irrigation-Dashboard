import React, { useState } from 'react';
import { supabase, supabaseConfigured } from '../supabase';
import { Droplets, Lock, Mail, ArrowRight, Loader2, Github, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onSharedAccess?: (combinedCode: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onSharedAccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareCode, setShareCode] = useState('');

  // Clear URL error parameters on load
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorMsg = params.get('error_description') || params.get('error');
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg.replace(/\+/g, ' ')));
      // Clean the URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);


  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: import.meta.env.VITE_SITE_URL || window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during Google login');
      setLoading(false);
    }
  };


  const handleShareCodeAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareCode.trim()) {
      setError('Please enter a valid share code');
      return;
    }
    
    if (onSharedAccess) {
      onSharedAccess(shareCode.trim());
    }
  };

  return (
    <div className="min-h-screen bg-maroon-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-maroon-800/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(120,53,15,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(120,53,15,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative"
      >
        {/* Main card */}
        <div className="bg-gradient-to-br from-maroon-900 via-maroon-800 to-maroon-900 border border-gold-500/30 rounded-3xl p-8 shadow-2xl shadow-black/50">
          <div className="flex flex-col items-center mb-8">
            <div className="w-28 h-28 rounded-2xl flex items-center justify-center mb-4 overflow-hidden">
              <img 
                src="/liceo.png" 
                alt="Liceo Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-3xl font-bold text-gold-400 tracking-tight">LDCU Irrigation System</h1>
            <p className="text-gold-200/70 text-sm mt-1">Soil Moisture Detection System</p>
          </div>

          <div className="space-y-6">
            {!supabaseConfigured && (
              <div className="p-3 bg-gold-900/30 border border-gold-500/30 rounded-xl text-gold-200 text-sm text-center">
                ⚠️ Supabase not configured. Add <code className="font-mono text-gold-400">VITE_SUPABASE_URL</code> and <code className="font-mono text-gold-400">VITE_SUPABASE_ANON_KEY</code> to your <code className="font-mono text-gold-400">.env</code> file.
              </div>
            )}

            {localStorage.getItem('sharedSensorId') && (
              <button
                type="button"
                onClick={() => onSharedAccess && onSharedAccess(localStorage.getItem('sharedSensorId')!)}
                className="w-full bg-gold-500/5 hover:bg-gold-500/10 text-gold-400 font-bold py-4 rounded-xl border border-gold-500/20 transition-all flex items-center justify-center gap-2 group"
              >
                <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
                <span>Continue as Guest</span>
              </button>
            )}

            <form onSubmit={handleShareCodeAccess} className="space-y-4">
              <div className="flex items-center gap-2 text-gold-400 text-[10px] font-bold uppercase tracking-widest ml-1">
                <Lock size={12} />
                <span>Monitor with Code</span>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gold-500 rounded-xl blur opacity-0 group-focus-within:opacity-10 transition-opacity"></div>
                <input
                  type="text"
                  required
                  value={shareCode}
                  onChange={(e) => setShareCode(e.target.value)}
                  className="w-full bg-maroon-950/50 border border-gold-500/30 rounded-xl py-3 px-4 text-gold-50 placeholder:text-gold-500/20 focus:outline-none focus:ring-1 focus:ring-gold-500/30 transition-all font-sans text-sm"
                  placeholder="Enter share code here"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-950/30 border border-red-800/30 rounded-xl text-red-200 text-xs text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 hover:text-white font-bold rounded-xl border border-gold-500/20 transition-all flex items-center justify-center gap-2"
              >
                Monitor Sensor
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gold-500/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-gold-500/40">
                <span className="bg-maroon-900 px-2">Owner Access</span>
              </div>
            </div>

            <button
              type="button"
              disabled={loading || !supabaseConfigured}
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-gold-50 disabled:opacity-50 text-gray-900 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/20 hover:shadow-gold-500/20 hover:scale-[1.01] border border-transparent hover:border-gold-300"
              title="Sign in with Google"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span className="text-sm font-bold">Log in with Google</span>
            </button>
          </div>
          
          <p className="text-[10px] text-center text-maroon-300/50 px-4 mt-6">
            By signing in, you agree to the Liceo Moisture Detection System terms of service and privacy policy.
          </p>
        </div>
        
        {/* Footer content */}
        <div className="flex flex-col items-center gap-3 mt-8">
          <a 
            href="https://github.com/agent-nau/IoT-Soil-Moisture-Irrigation-Dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-maroon-400/70 hover:text-gold-400 transition-colors text-xs font-medium"
          >
            <Github size={14} />
            <span>Public Project</span>
          </a>
          <p className="text-center text-maroon-400/40 text-[10px] uppercase tracking-widest font-bold">
            © 2026 Liceo Moisture Monitor
          </p>
        </div>
      </motion.div>
    </div>
  );
};
