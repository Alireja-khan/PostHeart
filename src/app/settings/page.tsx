'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Heart, Shield, RotateCcw, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const [userName, setUserName] = useState('Sarah');
  const [partnerName, setPartnerName] = useState('Alex');
  const [accentColor, setAccentColor] = useState('rust');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings saved successfully (simulated).');
  };

  const handleResetBoard = () => {
    if (confirm('Are you sure you want to clear your Couple Board? This will delete all sticky notes and polaroids permanently.')) {
      localStorage.removeItem('dear_you_corkboard_items');
      alert('Couple Board has been reset to defaults.');
      window.location.reload();
    }
  };

  return (
    <div className="w-full min-h-full bg-[#f9f8f6] p-8 lg:p-12 overflow-y-auto no-scrollbar">
      
      {/* Page Header */}
      <div className="mb-10 max-w-2xl mx-auto">
        <span className="text-[10px] tracking-widest text-[#707070] uppercase font-semibold">Preferences</span>
        <h1 className="font-serif text-4xl font-bold text-[#1a1a1a] mt-1">Settings</h1>
        <p className="text-sm text-[#707070] mt-2">
          Personalize your private letter-writing space and manage shared configurations.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Form Container */}
        <form onSubmit={handleSave} className="bg-white border border-[#e6e4df] rounded-lg p-6 lg:p-8 card-shadow space-y-6">
          
          {/* Profile Section */}
          <div>
            <div className="flex items-center gap-2 border-b border-[#e6e4df]/60 pb-3 mb-4">
              <User size={16} className="text-[#c2410c]" />
              <h2 className="font-serif text-lg font-bold text-[#1a1a1a]">Names & Identity</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-serif uppercase tracking-wider text-[#707070] font-semibold mb-2">
                  Your Name
                </label>
                <input 
                  type="text" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-[#fdfbf7] border border-[#e6e4df] rounded-lg p-2.5 text-[#1a1a1a] font-serif text-sm focus:outline-none focus:border-[#1a1a1a]"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-serif uppercase tracking-wider text-[#707070] font-semibold mb-2">
                  Partner's Name
                </label>
                <input 
                  type="text" 
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full bg-[#fdfbf7] border border-[#e6e4df] rounded-lg p-2.5 text-[#1a1a1a] font-serif text-sm focus:outline-none focus:border-[#1a1a1a]"
                />
              </div>
            </div>
          </div>

          {/* Theme Section */}
          <div>
            <div className="flex items-center gap-2 border-b border-[#e6e4df]/60 pb-3 mb-4">
              <Heart size={16} className="text-[#344e41]" />
              <h2 className="font-serif text-lg font-bold text-[#1a1a1a]">Theme Customization</h2>
            </div>
            
            <div>
              <label className="block text-[10px] font-serif uppercase tracking-wider text-[#707070] font-semibold mb-2">
                Primary Accent Color
              </label>
              <div className="flex gap-4">
                {[
                  { id: 'rust', name: 'Terracotta Rust', color: '#c2410c' },
                  { id: 'sage', name: 'Sage Green', color: '#344e41' },
                  { id: 'charcoal', name: 'Charcoal Gray', color: '#1a1a1a' }
                ].map((accent) => (
                  <button
                    key={accent.id}
                    type="button"
                    onClick={() => setAccentColor(accent.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-serif transition-all ${
                      accentColor === accent.id 
                        ? 'border-[#1a1a1a] bg-[#fdfbf7] text-[#1a1a1a] font-bold shadow-xs' 
                        : 'border-[#e6e4df] bg-white text-[#707070] hover:border-[#1a1a1a]'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent.color }}></span>
                    <span>{accent.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy & Settings */}
          <div>
            <div className="flex items-center gap-2 border-b border-[#e6e4df]/60 pb-3 mb-4">
              <Shield size={16} className="text-[#707070]" />
              <h2 className="font-serif text-lg font-bold text-[#1a1a1a]">Privacy & Sync</h2>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif text-sm font-semibold text-[#1a1a1a]">Enable Delivery Notifications</h4>
                <p className="text-xs text-[#707070] mt-0.5">Receive audio alerts when a new letter arrives in your mailbox.</p>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative border ${
                  notificationsEnabled ? 'bg-[#344e41] border-[#344e41]' : 'bg-stone-100 border-[#e6e4df]'
                }`}
              >
                <motion.div 
                  layout
                  className="w-4 z-10 h-4 bg-white rounded-full absolute left-1 top-0.5 shadow-xs"
                  animate={{ x: notificationsEnabled ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e6e4df]/60 flex justify-end">
            <button
              type="submit"
              className="bg-[#1a1a1a] hover:bg-[#333] text-white px-6 py-2.5 rounded-lg font-serif text-xs uppercase tracking-widest transition-colors font-bold shadow-sm"
            >
              Save Preferences
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="bg-[#fffcfb] border border-red-200 rounded-lg p-6 card-shadow space-y-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle size={18} />
            <h2 className="font-serif text-lg font-bold">Danger Zone</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-serif text-sm font-semibold text-[#1a1a1a]">Reset Shared Couple Board</h4>
              <p className="text-xs text-[#707070] mt-0.5">This clears all custom polaroids, stickers, washi tape, and notes from localStorage.</p>
            </div>
            
            <button
              type="button"
              onClick={handleResetBoard}
              className="flex items-center justify-center gap-1.5 px-4 py-2 border border-red-200 hover:border-red-600 rounded-lg text-xs font-serif text-red-600 hover:bg-red-50 transition-colors font-bold shadow-xs whitespace-nowrap"
            >
              <RotateCcw size={14} />
              <span>Reset Board</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
