
import React, { useState, useRef } from 'react';
import { AppSettings, ThemeMode, LANGUAGES, FONTS, UserProfile, AiPersonalization } from '../types';
import LegalModal from './LegalModal';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdate: (newSettings: Partial<AppSettings>) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'profile' | 'ai'>('profile');
  const [legalType, setLegalType] = useState<'cookies' | 'privacy' | 'terms' | 'security' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfile = (field: keyof UserProfile, value: string) => {
    // Sanitize username
    if (field === 'username') {
      value = value.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    onUpdate({ userProfile: { ...settings.userProfile, [field]: value } });
  };

  const updateAi = (field: keyof AiPersonalization, value: string) => {
    onUpdate({ aiPersonalization: { ...settings.aiPersonalization, [field]: value } });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file terlalu besar. Maksimal 2MB agar profil tetap lancar.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          // Resize image for storage efficiency to prevent localstorage blank screen bug
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            updateProfile('photo', dataUrl);
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-2xl font-bold gold-shimmer">Pusat Kendali Ikhlas.AI</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Atur identitas dan preferensi cerdas Anda</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
          {[
            { id: 'profile', label: 'Profil Saya' },
            { id: 'ai', label: 'Personalisasi AI' },
            { id: 'appearance', label: 'Tampilan' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === tab.id ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {activeTab === 'profile' && (
            <section className="space-y-6 animate-in slide-in-from-left-4">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img 
                    src={settings.userProfile.photo} 
                    alt="User" 
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl bg-slate-100 transition-opacity group-hover:opacity-75"
                    onError={(e) => { (e.target as any).src = 'https://i.ibb.co/pv7Zm0pY/default-avatar.png'; }}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-amber-500 p-2 rounded-lg text-white shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".png,.jpg,.jpeg,.svg" 
                    onChange={handleFileUpload}
                  />
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Nama Lengkap</label>
                      <input 
                        type="text" 
                        value={settings.userProfile.name}
                        onChange={(e) => updateProfile('name', e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 dark:text-white"
                        placeholder="Nama Anda"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Username</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-slate-400">@</span>
                        <input 
                          type="text" 
                          value={settings.userProfile.username}
                          onChange={(e) => updateProfile('username', e.target.value)}
                          className="w-full p-3 pl-8 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 dark:text-white"
                          placeholder="username"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Link Foto Profil (Opsional)</label>
                    <input 
                      type="text" 
                      value={settings.userProfile.photo.startsWith('data:') ? 'Terunggah dari lokal' : settings.userProfile.photo}
                      onChange={(e) => !e.target.value.includes('Terunggah') && updateProfile('photo', e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 dark:text-white text-sm"
                      placeholder="https://link-ke-foto-anda.jpg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Bio / Deskripsi</label>
                    <textarea 
                      value={settings.userProfile.bio}
                      onChange={(e) => updateProfile('bio', e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 dark:text-white h-24 resize-none"
                      placeholder="Ceritakan sedikit tentang Anda..."
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'ai' && (
            <section className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Karakteristik AI</label>
                    <input 
                      type="text" 
                      value={settings.aiPersonalization.characteristic}
                      onChange={(e) => updateAi('characteristic', e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 dark:text-white"
                      placeholder="Cth: Bijaksana, Teman Dekat, Tutor Sabar"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Gaya Dasar</label>
                    <select 
                      value={settings.aiPersonalization.style}
                      onChange={(e) => updateAi('style', e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none dark:text-white"
                    >
                      <option value="Modern & Elegan">Modern & Elegan</option>
                      <option value="Kasual & Akrab">Kasual & Akrab</option>
                      <option value="Formal & Akademis">Formal & Akademis</option>
                      <option value="Sastra & Puitis">Sastra & Puitis</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nada Bicara</label>
                  <input 
                    type="text" 
                    value={settings.aiPersonalization.tone}
                    onChange={(e) => updateAi('tone', e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 dark:text-white"
                    placeholder="Cth: Tenang, Bersemangat, Lembut"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Instruksi Khusus (System Prompt)</label>
                  <textarea 
                    value={settings.aiPersonalization.customInstructions}
                    onChange={(e) => updateAi('customInstructions', e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 dark:text-white h-32 resize-none"
                    placeholder="Masukkan aturan khusus untuk AI (Cth: Selalu gunakan Bahasa Indonesia yang baku...)"
                  />
                </div>
              </div>
            </section>
          )}

          {activeTab === 'appearance' && (
            <section className="space-y-8 animate-in zoom-in-95 duration-200">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-500">Mode Tema</label>
                   <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                     <button onClick={() => onUpdate({ themeMode: ThemeMode.LIGHT })} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${settings.themeMode === ThemeMode.LIGHT ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Terang</button>
                     <button onClick={() => onUpdate({ themeMode: ThemeMode.DARK })} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${settings.themeMode === ThemeMode.DARK ? 'bg-slate-700 text-white shadow' : 'text-slate-500'}`}>Gelap</button>
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-500">Bahasa Aplikasi</label>
                   <select 
                     value={settings.language} 
                     onChange={(e) => onUpdate({ language: e.target.value })} 
                     className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/50 dark:text-white"
                   >
                     {LANGUAGES.map(lang => (
                       <option key={lang.code} value={lang.code}>{lang.name}</option>
                     ))}
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-500">Warna Aksen</label>
                   <input type="color" value={settings.accentColor} onChange={(e) => onUpdate({ accentColor: e.target.value })} className="w-full h-10 rounded-xl cursor-pointer bg-transparent border-0" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-500">Gaya Font</label>
                   <select value={settings.fontFamily} onChange={(e) => onUpdate({ fontFamily: e.target.value })} className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/50 dark:text-white">
                     {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-500">Ukuran Teks ({settings.fontSize}px)</label>
                   <input type="range" min="12" max="24" value={settings.fontSize} onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })} className="w-full accent-amber-500" />
                 </div>
               </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-6">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            <button onClick={() => setLegalType('cookies')} className="hover:text-amber-500 transition-colors">Cookie Preferences</button>
            <button onClick={() => setLegalType('privacy')} className="hover:text-amber-500 transition-colors">Privacy Policy</button>
            <button onClick={() => setLegalType('terms')} className="hover:text-amber-500 transition-colors">Terms of Use</button>
            <button onClick={() => setLegalType('security')} className="hover:text-amber-500 transition-colors">Report Security Issues</button>
          </div>
          <button onClick={onClose} className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-xl transition-transform active:scale-95">Simpan Konfigurasi</button>
        </div>
      </div>
      {legalType && <LegalModal type={legalType} onClose={() => setLegalType(null)} />}
    </div>
  );
};

export default SettingsModal;
