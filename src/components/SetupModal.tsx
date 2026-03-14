import React from 'react';
import { X, Cpu, Wifi, Database, Code } from 'lucide-react';
import { motion } from 'motion/react';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ isOpen, onClose }) => {
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
              <Cpu size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Hardware Setup Guide</h2>
          </div>
          <button onClick={onClose} className="p-2 text-maroon-300 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-8 custom-scrollbar">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gold-400">
              <Wifi size={18} />
              <h3 className="font-bold uppercase tracking-wider text-xs">1. Connectivity</h3>
            </div>
            <p className="text-maroon-100 text-sm leading-relaxed">
              Use an ESP32 or ESP8266 microcontroller with a capacitive soil moisture sensor. 
              Capacitive sensors are preferred as they don't corrode over time like resistive ones.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gold-400">
              <Database size={18} />
              <h3 className="font-bold uppercase tracking-wider text-xs">2. Database Options</h3>
            </div>
            <p className="text-maroon-100 text-sm leading-relaxed">
              You can log data to either <strong>Google Sheets</strong> or <strong>Supabase Database</strong>.
            </p>
            
            <div className="space-y-2">
              <h4 className="text-white text-xs font-bold">Option A: Supabase (Recommended)</h4>
              <p className="text-maroon-200 text-xs">Run this SQL in your Supabase SQL Editor:</p>
              <div className="bg-maroon-950/50 p-4 rounded-2xl border border-maroon-800/50 font-mono text-[10px] text-maroon-200">
                <p>CREATE TABLE sensor_readings (</p>
                <p>&nbsp;&nbsp;id UUID DEFAULT gen_random_uuid() PRIMARY KEY,</p>
                <p>&nbsp;&nbsp;timestamp TIMESTAMPTZ DEFAULT now(),</p>
                <p>&nbsp;&nbsp;sensor_id TEXT DEFAULT 'default',</p>
                <p>&nbsp;&nbsp;value FLOAT8 NOT NULL</p>
                <p>);</p>
                <p>-- Enable RLS and add policies for public reading</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-white text-xs font-bold">Option B: Google Sheets</h4>
              <div className="bg-maroon-950/50 p-4 rounded-2xl border border-maroon-800/50 font-mono text-[10px] text-maroon-200">
                <p>// Google Apps Script snippet</p>
                <p>function doPost(e) &#123;</p>
                <p>&nbsp;&nbsp;var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();</p>
                <p>&nbsp;&nbsp;var data = JSON.parse(e.postData.contents);</p>
                <p>&nbsp;&nbsp;sheet.appendRow([new Date(), data.sensorId, data.value]);</p>
                <p>&#125;</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gold-400">
              <Code size={18} />
              <h3 className="font-bold uppercase tracking-wider text-xs">3. Arduino Code</h3>
            </div>
            <p className="text-maroon-100 text-sm leading-relaxed">
              Program your ESP32 to wake up every 30 minutes, read the analog value, and send it to your Apps Script URL.
            </p>
          </section>
        </div>

        <div className="p-6 bg-maroon-950/50 border-t border-maroon-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gold-500 hover:bg-gold-400 text-maroon-950 font-bold rounded-xl transition-all shadow-lg"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
};
