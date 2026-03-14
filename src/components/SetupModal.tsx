import React from 'react';
import { X, Plus, Cpu, Wifi, Database, Code } from 'lucide-react';
import { motion } from 'motion/react';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSensor?: (sheetId: string) => void;
  user: any;
  isRequired?: boolean;
}

export const SetupModal: React.FC<SetupModalProps> = ({ isOpen, onClose, onAddSensor, user, isRequired }) => {
  const [sheetUrl, setSheetUrl] = React.useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-maroon-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-maroon-900 border border-maroon-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-maroon-800 flex items-center justify-between bg-maroon-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold-500/20 rounded-xl text-gold-400">
              <Plus size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Add New Sensor</h2>
          </div>
          {!isRequired && (
            <button onClick={onClose} className="p-2 text-maroon-300 hover:text-white transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (sheetUrl && onAddSensor) {
              // Extract ID if full URL is pasted
              const matches = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
              const id = matches ? matches[1] : sheetUrl;
              onAddSensor(id);
              setSheetUrl('');
              onClose();
            }
          }}
          className="p-6 space-y-6"
        >
          <div className="space-y-4">

            <div className="space-y-3 pt-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gold-400 ml-1">Google Sheet CSV Link</label>
              <motion.div 
                whileHover={{ scale: 1.005 }}
                whileFocus={{ scale: 1.005 }}
                className="relative group cursor-text"
              >
                <div className="absolute inset-0 bg-gold-400/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <input 
                    required
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="Paste your https://docs.google.com/.../pub?output=csv"
                    className="w-full bg-maroon-950/80 border border-gold-500/30 rounded-xl py-4 px-5 text-gold-50 placeholder:text-gold-500/10 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 transition-all text-sm shadow-inner"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-30 group-focus-within:opacity-100 transition-opacity">
                    <Database size={14} className="text-gold-400" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-maroon-800">
            <div className="flex items-center gap-2 text-gold-400">
              <Code size={16} />
              <h3 className="font-bold uppercase tracking-wider text-[10px]">Setup Instructions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-maroon-950/40 p-3 rounded-xl border border-maroon-800/50">
                  <span className="text-white text-[10px] font-bold block mb-1">1. Publish to Web</span>
                  <p className="text-[10px] text-maroon-300">Go to File &gt; Share &gt; Publish to web. Change "Web Page" to "Comma-separated values (.csv)".</p>
               </div>
               <div className="bg-maroon-950/40 p-3 rounded-xl border border-maroon-800/50">
                  <span className="text-white text-[10px] font-bold block mb-1">2. Copy CSV URL</span>
                  <p className="text-[10px] text-maroon-300">Copy the URL ending in <code className="text-gold-400">output=csv</code> and paste it above.</p>
               </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 gap-3">
            {!isRequired && (
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-maroon-300 hover:text-white font-bold transition-colors"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit"
              className="px-8 py-3 bg-gold-500 hover:bg-gold-400 text-maroon-950 font-bold rounded-xl transition-all shadow-lg shadow-gold-500/20 flex items-center gap-2"
            >
              <Plus size={18} />
              Connect Sensor
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
