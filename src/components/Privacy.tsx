import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, ArrowLeft, Lock, Eye, FileText, Globe } from 'lucide-react';

export const Privacy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-maroon-950 text-gold-50 font-sans">
      <header className="sticky top-0 z-10 bg-maroon-900/80 backdrop-blur-md border-b border-maroon-800/50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 flex items-center justify-center p-1">
              <img src="/liceo.png" alt="Liceo Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-gold-50">Liceo Moisture</h1>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gold-500/10 border border-gold-500/20 mb-4 text-gold-400">
              <Shield size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Privacy Policy</h1>
            <p className="text-maroon-300 max-w-2xl mx-auto text-lg">
              Your data security and privacy are our top priorities at Liceo Moisture Detection System.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-maroon-900/30 border border-gold-500/10 rounded-3xl backdrop-blur-sm">
              <div className="text-gold-400 mb-4"><Lock size={24} /></div>
              <h3 className="text-xl font-bold text-white mb-2">Data Protection</h3>
              <p className="text-maroon-200 text-sm leading-relaxed">
                We use industry-standard encryption to protect your account information and sensor data. Your credentials are never stored in plain text and are managed securely via Supabase.
              </p>
            </div>
            <div className="p-8 bg-maroon-900/30 border border-gold-500/10 rounded-3xl backdrop-blur-sm">
              <div className="text-gold-400 mb-4"><Eye size={24} /></div>
              <h3 className="text-xl font-bold text-white mb-2">Data Collection</h3>
              <p className="text-maroon-200 text-sm leading-relaxed">
                The only data we collect is your email for authentication and the moisture levels recorded by your sensors. We do not track your location or personal habits.
              </p>
            </div>
            <div className="p-8 bg-maroon-900/30 border border-gold-500/10 rounded-3xl backdrop-blur-sm">
              <div className="text-gold-400 mb-4"><Globe size={24} /></div>
              <h3 className="text-xl font-bold text-white mb-2">Third-Party Services</h3>
              <p className="text-maroon-200 text-sm leading-relaxed">
                We integrate with Google Sheets to display your sensor data. This application only reads the specific sheet you provide and does not access your other Google Drive files.
              </p>
            </div>
            <div className="p-8 bg-maroon-900/30 border border-gold-500/10 rounded-3xl backdrop-blur-sm">
              <div className="text-gold-400 mb-4"><FileText size={24} /></div>
              <h3 className="text-xl font-bold text-white mb-2">Terms of Use</h3>
              <p className="text-maroon-200 text-sm leading-relaxed">
                By using this system, you agree to use it responsibly for monitoring soil conditions. We are not liable for any crop or plant loss due to system maintenance or data delays.
              </p>
            </div>
          </div>

          <div className="p-10 bg-gradient-to-br from-maroon-900/40 to-maroon-800/20 border border-gold-500/20 rounded-[2.5rem] relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-4">Request Your Data</h2>
              <p className="text-maroon-200 mb-6">
                You have the right to request a copy of all data associated with your account or to have your account permanently deleted from our system at any time.
              </p>
              <a 
                href="mailto:megwhite1223@gmail.com"
                className="inline-block px-6 py-3 bg-gold-500 hover:bg-gold-400 text-maroon-950 font-bold rounded-xl transition-all shadow-lg shadow-gold-500/20"
              >
                Contact Developer
              </a>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          </div>
        </motion.div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-12 border-t border-maroon-900/50 mt-12 text-center text-xs text-maroon-400 font-bold uppercase tracking-widest">
        © 2026 LDCU Soil Moisture Detection System • Secure & Private
      </footer>
    </div>
  );
};
