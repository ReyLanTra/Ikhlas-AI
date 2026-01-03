
import React, { useState, useEffect, useRef } from 'react';
import { ThemeMode, AppSettings, Message, ChatSession, ViewType } from './types';
import { AI_AVATAR, AI_NAME, BASE_SYSTEM_INSTRUCTION, DEFAULT_USER_AVATAR, FORBIDDEN_WORDS } from './constants';
import { sendMessageToAI, generateImage } from './services/geminiService';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';
import MarkdownContent from './components/MarkdownContent';
import AiTools from './components/AiTools';
import AiGames from './components/AiGames';
import SmartReminder from './components/SmartReminder';
import OnboardingModal from './components/OnboardingModal';

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('ikhlas_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    return {
      themeMode: ThemeMode.DARK,
      accentColor: '#d4af37',
      fontFamily: "'Inter', sans-serif",
      fontSize: 16,
      fontColor: '#f8fafc',
      language: 'id',
      hasCompletedOnboarding: false,
      userProfile: {
        name: 'Hamba Allah',
        username: 'pengguna',
        photo: DEFAULT_USER_AVATAR,
        bio: 'Mencari hikmah dalam setiap byte.',
        exp: 0,
        titles: ['Warga Baru Pekunden']
      },
      aiPersonalization: {
        characteristic: 'Bijaksana & Sopan',
        style: 'Modern & Elegan',
        tone: 'Tenang',
        customInstructions: ''
      }
    };
  });

  const [activeView, setActiveView] = useState<ViewType>('chat');
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('ikhlas_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
    return [{ id: '1', title: 'Percakapan Baru', messages: [], createdAt: new Date() }];
  });
  
  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0]?.id || '1');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [isGameLocked, setIsGameLocked] = useState(false);
  
  // Advanced Tutorial State
  const [tutorialStep, setTutorialStep] = useState<number>(0); 

  // State Adab & Hukuman
  const [adabWarningCount, setAdabWarningCount] = useState<number>(() => {
    const saved = localStorage.getItem('ikhlas_adab_count');
    return saved ? parseInt(saved) : 0;
  });
  const [showAdabWarning, setShowAdabWarning] = useState(false);
  const [isBanned, setIsBanned] = useState<boolean>(() => {
    const saved = localStorage.getItem('ikhlas_adab_count');
    return saved ? parseInt(saved) >= 5 : false;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBanned) return;
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowSettings(false);
        setShowAbout(false);
        setIsSidebarOpen(false);
        setShowAdabWarning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBanned]);

  useEffect(() => {
    localStorage.setItem('ikhlas_settings', JSON.stringify(settings));
    document.documentElement.classList.toggle('dark', settings.themeMode === ThemeMode.DARK);
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('ikhlas_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('ikhlas_adab_count', adabWarningCount.toString());
    if (adabWarningCount >= 5) setIsBanned(true);
  }, [adabWarningCount]);

  useEffect(() => {
    if (activeView === 'chat') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession.messages, activeView, isLoading]);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const response = await fetch('https://api.myquran.com/v3/sholat/jadwal/060ad92489947d410d897474079c1477/today?tz=Asia%2FJakarta');
        const data = await response.json();
        if (data.status && data.data && data.data.jadwal) {
          const dateKeys = Object.keys(data.data.jadwal);
          if (dateKeys.length > 0) setPrayerTimes(data.data.jadwal[dateKeys[0]]);
        }
      } catch (error) {
        console.error("Failed to fetch prayer times:", error);
      }
    };
    fetchPrayerTimes();
  }, []);

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleForbiddenWordDetected = () => {
    setAdabWarningCount(prev => prev + 1);
    setShowAdabWarning(true);
  };

  const startTutorial = () => {
    setTutorialStep(1);
    setIsSidebarOpen(true);
  };

  const nextTutorial = () => {
    const stepsCount = 7;
    if (tutorialStep === 1) setTutorialStep(2);
    else if (tutorialStep === 2) setTutorialStep(3);
    else if (tutorialStep === 3) { setTutorialStep(4); setIsSidebarOpen(false); }
    else if (tutorialStep === 4) setTutorialStep(5);
    else if (tutorialStep === 5) setTutorialStep(6);
    else if (tutorialStep === 6) setTutorialStep(7);
    else setTutorialStep(0);
  };

  const handleSend = async () => {
    if (isBanned || !inputValue.trim() || isLoading) return;
    const lowerInput = inputValue.toLowerCase();
    if (FORBIDDEN_WORDS.some(word => lowerInput.includes(word))) {
      handleForbiddenWordDetected();
      setInputValue('');
      return;
    }

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: inputValue, timestamp: new Date() };
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, userMessage] } : s));
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendMessageToAI(inputValue, activeSession.messages.map(m => ({ role: m.role, parts: m.content })));
      const aiMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response.text || "...", timestamp: new Date() };
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, aiMessage] } : s));
    } catch (e: any) {
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: "Maaf, terjadi kendala teknis.", timestamp: new Date(), isError: true };
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMessage] } : s));
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = () => {
    const newSession: ChatSession = { id: Date.now().toString(), title: 'Obrolan Baru', messages: [], createdAt: new Date() };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setActiveView('chat');
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      createNewSession();
      setSessions(prev => prev.filter(s => s.id !== id));
      return;
    }
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) setActiveSessionId(filtered[0].id);
  };

  const renameSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const session = sessions.find(s => s.id === id);
    const newTitle = prompt('Masukkan nama obrolan baru:', session?.title);
    if (newTitle && newTitle.trim()) {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle.trim() } : s));
    }
  };

  const handleNavClick = (view: ViewType) => {
    setActiveView(view);
    setIsSidebarOpen(false);
  };

  const tutorialMessages = [
    "",
    "Sidebar ini adalah pusat kendali Anda. Di sini ada profil, menu navigasi, dan riwayat obrolan.",
    "Menu AI Toolbox berisi berbagai alat canggih seperti Generator Gambar, Video, hingga Kalkulator Zakat.",
    "Arena Hikmah adalah tempat Anda bermain game Islami untuk mengasah wawasan dan mendapatkan EXP.",
    "Ini adalah Area Chat Utama. Di atasnya terdapat Smart Reminder yang akan mengingatkan waktu-waktu penting.",
    "Tuliskan pertanyaan atau bimbingan Anda di kotak input ini. Ingat, selalu jaga adab dalam berbicara.",
    "Klik ikon gear di atas untuk mengubah tampilan dan instruksi AI sesuai keinginan Anda.",
    "Terakhir, menu Tentang Ikhlas.AI berisi informasi lengkap mengenai pembuat aplikasi ini."
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 islamic-pattern transition-all" style={{ fontFamily: settings.fontFamily, fontSize: `${settings.fontSize}px` }}>
      <style>{`.accent-bg { background-color: ${settings.accentColor}; } .tutorial-spotlight { position: relative; z-index: 1001 !important; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.8), 0 0 30px 10px rgba(212, 175, 55, 0.5) !important; pointer-events: none; }`}</style>

      {!settings.hasCompletedOnboarding && (
        <OnboardingModal onComplete={() => { handleUpdateSettings({ hasCompletedOnboarding: true }); startTutorial(); }} />
      )}

      {tutorialStep > 0 && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
          <div className="max-w-sm w-full liquid-glass rounded-[2.5rem] p-8 space-y-6 text-center shadow-2xl relative z-[2001] border-t-4 border-amber-500 animate-in zoom-in fade-in">
            <h3 className="text-xl font-black gold-shimmer uppercase tracking-widest">Tutorial Visual</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{tutorialMessages[tutorialStep]}</p>
            <button onClick={nextTutorial} className="w-full py-4 bg-amber-500 text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
              {tutorialStep < 7 ? 'Lanjut Tutorial' : 'Selesai & Mulai'}
            </button>
          </div>
        </div>
      )}

      {isBanned && (
        <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-6 text-center animate-in fade-in">
          <h1 className="text-4xl md:text-6xl font-black text-red-600 uppercase italic">AKSES DIPUTUS PERMANEN</h1>
        </div>
      )}

      {isSidebarOpen && <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-40 w-80 transform bg-slate-900/95 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${tutorialStep >= 1 && tutorialStep <= 3 ? 'tutorial-spotlight' : ''}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/5 flex items-center gap-4 group cursor-pointer" onClick={() => setShowSettings(true)}>
             <img src={settings.userProfile.photo || DEFAULT_USER_AVATAR} className="w-12 h-12 rounded-xl object-cover border-2 border-amber-500 shadow-xl" alt="User" />
             <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-white truncate">{settings.userProfile.name}</h3>
                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">{settings.userProfile.titles[settings.userProfile.titles.length - 1]}</p>
             </div>
          </div>

          <nav className="p-4 space-y-1">
            <button onClick={() => handleNavClick('chat')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold ${activeView === 'chat' ? 'bg-amber-500 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}>💬 Obrolan</button>
            <button id="toolbox-btn" onClick={() => handleNavClick('tools')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold ${activeView === 'tools' ? 'bg-amber-500 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400'} ${tutorialStep === 2 ? 'tutorial-spotlight' : ''}`}>🛠️ AI Toolbox</button>
            <button id="arena-btn" onClick={() => handleNavClick('games')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold ${activeView === 'games' ? 'bg-amber-500 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400'} ${tutorialStep === 3 ? 'tutorial-spotlight' : ''}`}>🎮 Arena Hikmah</button>
            <button onClick={() => setShowAbout(true)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold hover:bg-white/5 text-slate-400 ${tutorialStep === 7 ? 'tutorial-spotlight' : ''}`}>ℹ Tentang Ikhlas.AI</button>
          </nav>

          <div className="p-4"><button onClick={createNewSession} className="w-full py-3 border-2 border-amber-500/30 text-amber-500 rounded-2xl font-bold hover:bg-amber-500/10 transition-all">+ Obrolan Baru</button></div>

          {prayerTimes && (
            <div className="p-4 mx-4 mb-4 glass-morphism rounded-2xl border border-amber-500/20 shadow-inner">
              <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Jadwal Sholat Hari Ini</h4>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                {[
                  { n: 'Imsak', t: prayerTimes.imsak }, { n: 'Subuh', t: prayerTimes.subuh },
                  { n: 'Terbit', t: prayerTimes.terbit }, { n: 'Dhuha', t: prayerTimes.dhuha },
                  { n: 'Dzuhur', t: prayerTimes.dzuhur }, { n: 'Ashar', t: prayerTimes.ashar },
                  { n: 'Maghrib', t: prayerTimes.maghrib }, { n: 'Isya', t: prayerTimes.isya }
                ].map((p, i) => (
                  <div key={i} className="flex justify-between items-center"><span className="text-[10px] text-slate-500 font-medium">{p.n}</span><span className="text-[11px] text-slate-200 font-bold">{p.t}</span></div>
                ))}
              </div>
              <a href="https://jadwal-sholat-alikhlas.reyzar.my.id/" target="_blank" rel="noopener noreferrer" className="mt-4 block w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] font-bold text-center rounded-xl border border-amber-500/20 transition-all uppercase tracking-widest">Jadwal Sholat Lengkap</a>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 space-y-1 pb-4">
            {sessions.map(s => (
              <div key={s.id} onClick={() => { setActiveSessionId(s.id); setActiveView('chat'); setIsSidebarOpen(false); }} className={`group w-full text-left p-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${activeSessionId === s.id && activeView === 'chat' ? 'bg-white/10 border-l-4 border-amber-500' : 'hover:bg-white/5'}`}>
                <div className="flex-1 truncate text-sm font-medium text-slate-300">{s.title}</div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => renameSession(s.id, e)} className="p-1 hover:text-amber-500 text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                  <button onClick={(e) => deleteSession(s.id, e)} className="p-1 hover:text-red-500 text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/5 text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest">© 2025-2030 | Mushola Al-Ikhlas Pekunden | Reyzar Alansyah Putra</div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
        <header className={`h-20 flex items-center justify-between px-6 border-b border-white/5 glass-morphism sticky top-0 z-30 ${tutorialStep === 6 ? 'tutorial-spotlight' : ''}`}>
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16" /></svg></button>
             <div className="flex items-center gap-3">
                <img src={AI_AVATAR} alt="AI" className="w-10 h-10 rounded-full border-2 border-amber-500 shadow-lg animate-float" />
                <div><h2 className="font-bold text-lg text-white">{activeView === 'chat' ? AI_NAME : activeView === 'tools' ? 'AI Toolbox' : 'Arena Hikmah'}</h2><p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Aktif</p></div>
             </div>
          </div>
          <button onClick={() => setShowSettings(true)} className="p-3 hover:bg-white/5 rounded-2xl text-slate-400 transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg></button>
        </header>

        {activeView === 'tools' ? <div className="flex-1 overflow-y-auto"><AiTools onForbiddenWordDetected={handleForbiddenWordDetected} /></div> : 
         activeView === 'games' ? <div className="flex-1 overflow-y-auto"><AiGames settings={settings} onUpdateSettings={handleUpdateSettings} onSetGameLocked={setIsGameLocked} onForbiddenWordDetected={handleForbiddenWordDetected} /></div> : (
          <div className={`flex-1 flex flex-col min-h-0 glass-chat-area m-2 md:m-4 rounded-[2.5rem] overflow-hidden shadow-2xl relative ${tutorialStep === 4 ? 'tutorial-spotlight' : ''}`}>
            <SmartReminder />
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
              {activeSession.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-700">
                  <h3 className="text-3xl md:text-5xl font-extrabold gold-shimmer drop-shadow-2xl">Selamat Datang, {settings.userProfile.name}</h3>
                  <p className="text-slate-400 max-w-xl text-lg opacity-80">Ikhlas.AI siap memandu Anda menuju kebijaksanaan dan efisiensi.</p>
                </div>
              ) : activeSession.messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2 duration-300`}>
                  <img src={msg.role === 'user' ? (settings.userProfile.photo || DEFAULT_USER_AVATAR) : AI_AVATAR} className="w-10 h-10 rounded-xl shadow-2xl border-2 border-white/5 object-cover" alt="Ava" />
                  <div className={`max-w-[85%] sm:max-w-[75%] space-y-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.role === 'assistant' && <div className="text-[10px] font-black gold-shimmer uppercase tracking-widest mb-1 ml-2 opacity-80">{AI_NAME}</div>}
                    <div className={`p-4 md:p-6 rounded-[2rem] shadow-2xl transition-all ${msg.role === 'user' ? 'accent-bg text-white rounded-tr-none' : 'bg-slate-900/60 backdrop-blur-md text-slate-100 border border-white/10 rounded-tl-none'}`}>
                      <MarkdownContent content={msg.content} />
                      {msg.isError && <div className="mt-6"><a href="https://wa.me/6285800240112" target="_blank" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white text-xs font-black rounded-xl shadow-lg uppercase tracking-widest">Laporkan Masalah</a></div>}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 animate-in slide-in-from-bottom-2 duration-300">
                  <img src={AI_AVATAR} className="w-10 h-10 rounded-xl shadow-lg border-2 border-white/5 object-cover" alt="Thinking" />
                  <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-5 rounded-[1.5rem] rounded-tl-none shadow-xl flex items-center gap-1.5"><div className="w-2 h-2 bg-amber-500 rounded-full typing-dot"></div><div className="w-2 h-2 bg-amber-500 rounded-full typing-dot"></div><div className="w-2 h-2 bg-amber-500 rounded-full typing-dot"></div></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div id="chat-input-area" className={`p-4 md:p-6 bg-slate-900/80 backdrop-blur-2xl border-t border-white/5 ${tutorialStep === 5 ? 'tutorial-spotlight' : ''}`}>
              <div className="max-w-4xl mx-auto flex items-end gap-3 bg-white/5 p-2 rounded-[2rem] border border-white/10 focus-within:ring-2 focus-within:ring-amber-500/30 transition-all">
                <textarea ref={inputRef} disabled={isBanned} rows={1} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())} placeholder="Tanyakan bimbingan..." className="flex-1 bg-transparent py-3 px-4 outline-none resize-none text-white placeholder-slate-500 disabled:cursor-not-allowed" />
                <button onClick={handleSend} disabled={!inputValue.trim() || isLoading || isBanned} className={`p-4 rounded-full text-white shadow-2xl active:scale-95 transition-all accent-bg hover:brightness-110`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
              </div>
            </div>
          </div>
        )}
      </main>

      {showSettings && <SettingsModal settings={settings} onUpdate={handleUpdateSettings} onClose={() => setShowSettings(false)} />}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
};

export default App;
