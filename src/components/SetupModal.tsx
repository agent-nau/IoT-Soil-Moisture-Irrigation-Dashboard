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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-rose-900 border border-rose-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-rose-800 flex items-center justify-between bg-rose-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
              <Cpu size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Hardware Setup Guide</h2>
          </div>
          <button onClick={onClose} className="p-2 text-rose-300 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-8 custom-scrollbar">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Wifi size={18} />
              <h3 className="font-bold uppercase tracking-wider text-xs">1. Connectivity</h3>
            </div>
            <p className="text-rose-100 text-sm leading-relaxed">
              Use an ESP32 or ESP8266 microcontroller with a capacitive soil moisture sensor. 
              Capacitive sensors are preferred as they don't corrode over time like resistive ones.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Database size={18} />
              <h3 className="font-bold uppercase tracking-wider text-xs">2. Data Pipeline</h3>
            </div>
            <p className="text-rose-100 text-sm leading-relaxed">
              The easiest way to log data is via <strong>Google Apps Script</strong>. 
              Create a script that receives HTTP POST requests and appends rows to your Google Sheet.
            </p>
            <div className="bg-rose-950/50 p-4 rounded-2xl border border-rose-800/50 font-mono text-[10px] text-rose-200">
              <p>// Google Apps Script snippet</p>
              <p>function doPost(e) &#123;</p>
              <p>&nbsp;&nbsp;var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();</p>
              <p>&nbsp;&nbsp;var data = JSON.parse(e.postData.contents);</p>
              <p>&nbsp;&nbsp;sheet.appendRow([new Date(), data.sensorId, data.value]);</p>
              <p>&nbsp;&nbsp;return ContentService.createTextOutput("Success");</p>
              <p>&#125;</p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Code size={18} />
              <h3 className="font-bold uppercase tracking-wider text-xs">3. Arduino Code</h3>
            </div>
            <p className="text-rose-100 text-sm leading-relaxed">
              Program your ESP32 to wake up every 30 minutes, read the analog value, and send it to your Apps Script URL.
            </p>
          </section>
        </div>

        <div className="p-6 bg-rose-950/50 border-t border-rose-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-rose-950 font-bold rounded-xl transition-all shadow-lg"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
};
