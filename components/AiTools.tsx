
import React, { useState, useEffect, useRef } from 'react';
import { generateImage, generateVideo, sendMessageToAI } from '../services/geminiService';
import { BASE_SYSTEM_INSTRUCTION, FORBIDDEN_WORDS } from '../constants';
import MarkdownContent from './MarkdownContent';

type ToolCategory = 'all' | 'spiritual' | 'practical' | 'knowledge' | 'generator' | 'security';

interface Tool {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: ToolCategory;
  isTop?: boolean;
}

const ELEVEN_LABS_KEY = 'sk_230772f5fa5551174ab27582407098f492968d3d5d24d7eb';

const TOOLS: Tool[] = [
  // Security & Logic
  { id: 'panic', name: 'Panic Button', icon: '🚨', description: 'Kontak darurat (Ambulans, Polisi, Pemadam).', category: 'security', isTop: true },
  { id: 'hoax', name: 'Anti-Hoax Checker', icon: '🕵️', description: 'Verifikasi berita & hadits via Google Search.', category: 'security', isTop: true },
  
  // Personal Spirituality
  { id: 'mutabaah', name: "Mutaba'ah Yaumiyah", icon: '✅', description: 'Checklist evaluasi ibadah harian.', category: 'spiritual', isTop: true },
  { id: 'mood', name: 'AI Mood Booster', icon: '🌈', description: 'Cari ayat penenang sesuai kondisi hati.', category: 'spiritual' },
  { id: 'niat', name: 'Koreksi Niat', icon: '💎', description: 'Nasehat agar niat tetap Ikhlas.', category: 'spiritual' },

  // ElevenLabs Tools (TOP)
  { id: 'el_tts', name: 'Text to Speech', icon: '🗣️', description: 'Ubah teks jadi suara manusia nyata.', category: 'generator', isTop: true },
  { id: 'el_sts', name: 'Speech to Speech', icon: '🎙️', description: 'Ubah suara Anda jadi suara lain.', category: 'generator', isTop: true },
  { id: 'el_stt', name: 'Speech to Text', icon: '📝', description: 'Transkrip rekaman audio ke teks.', category: 'practical', isTop: true },
  
  // New Tools
  { id: 'ai_video', name: 'Text to Video', icon: '🎬', description: 'Generate video sinematik dari teks.', category: 'generator' },
  { id: 'ai_syair', name: 'Syair & Puisi', icon: '✍️', description: 'Bait syair & pantun nasehat Islami.', category: 'generator' },
  { id: 'ai_script', name: 'Script Video', icon: '📹', description: 'Naskah dakwah 60 detik (TikTok/Reels).', category: 'generator' },
  { id: 'ai_surat', name: 'Surat Mushola', icon: '📄', description: 'Surat permohonan, undangan & peminjaman.', category: 'practical' },
  { id: 'ai_cv', name: 'Resume Syariah', icon: '💼', description: 'Profil diri berbasis integritas & amanah.', category: 'practical' },
  { id: 'ai_kurban', name: 'Kalkulator Kurban', icon: '🐑', description: 'Simulasi patungan & biaya operasional.', category: 'practical' },

  // Existing Tools
  { id: 'art', name: 'Art Studio', icon: '🎨', description: 'Ciptakan visual mewah dengan AI.', category: 'generator' },
  { id: 'wisdom', name: 'Oase Hikmah', icon: '✨', description: 'Mutiara kebijaksanaan harian.', category: 'spiritual' },
  { id: 'fiqh', name: 'Tanya Fiqih', icon: '📖', description: 'Konsultasi hukum Islam dasar.', category: 'knowledge' },
  { id: 'woman', name: 'Woman Issues', icon: '🧕', description: 'Fiqih wanita, haid, & parenting.', category: 'knowledge' },
  { id: 'muamalah', name: 'E-Muamalah', icon: '🤝', description: 'Panduan transaksi & ekonomi syariah.', category: 'knowledge' },
  { id: 'medical', name: 'Medical Fiqih', icon: '🏥', description: 'Panduan ibadah saat sakit.', category: 'practical' },
  { id: 'traveler', name: 'Traveler Tool', icon: '✈️', description: 'Kalkulator Jamak, Qashar & Kiblat.', category: 'practical' },
  { id: 'tajwid', name: 'Tajwid Bot', icon: '🕌', description: 'Tanya jawab hukum tajwid (Arab).', category: 'knowledge' },
  { id: 'search', name: 'Ayat & Hadits', icon: '🔍', description: 'Cari referensi dalil terkait.', category: 'knowledge' },
  { id: 'ziswaf', name: 'Zakat Calc', icon: '💰', description: 'Hitung Zakat, Infaq, Sadaqah.', category: 'practical' },
  { id: 'warisan', name: 'Kalkulator Waris', icon: '⚖️', description: 'Perhitungan harta pusaka (Farid).', category: 'practical' },
  { id: 'halal', name: 'Halal Checker', icon: '🧪', description: 'Cek status bahan makanan.', category: 'practical' },
  { id: 'khutbah', name: 'Naskah Khutbah', icon: '🎤', description: 'Generator materi dakwah & khutbah.', category: 'generator' },
  { id: 'tasbih', name: 'Tasbih Digital', icon: '📿', description: 'Alat bantu dzikir interaktif.', category: 'spiritual' },
  { id: 'khataman', name: 'Quran Tracker', icon: '📖', description: 'Pantau progres khataman Anda.', category: 'spiritual' },
  { id: 'ucapan', name: 'Generator Ucapan', icon: '💌', description: 'Teks ucapan Aqiqah, Khitan, Nikah, Duka.', category: 'generator' },
  { id: 'caption', name: 'Caption Medsos', icon: '📱', description: 'Caption Islami dengan Ayat & Hadis.', category: 'generator' },
  { id: 'doa', name: 'AI Doa Custom', icon: '🤲', description: 'Susunan doa personal sesuai curhatan.', category: 'spiritual' },
  { id: 'bayi', name: 'Nama Bayi Islami', icon: '👶', description: 'Cari ide nama bayi beserta maknanya.', category: 'generator' },
];

interface AiToolsProps {
  onForbiddenWordDetected: () => void;
}

const AiTools: React.FC<AiToolsProps> = ({ onForbiddenWordDetected }) => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [category, setCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State khusus Panic Button
  const [panicConfirmed, setPanicConfirmed] = useState(false);
  const [confirmCall, setConfirmCall] = useState<{ name: string; link: string } | null>(null);

  const [mutabaah, setMutabaah] = useState(() => {
    const saved = localStorage.getItem('ikhlas_mutabaah');
    return saved ? JSON.parse(saved) : { salat5: false, sedekah: false, quran: false, dzikir: false };
  });

  const [khatamProgress, setKhatamProgress] = useState(() => {
    const saved = localStorage.getItem('ikhlas_khatam');
    return saved ? JSON.parse(saved) : { juz: 1, surah: 'Al-Fatiha', page: 1 };
  });

  const [tasbihCount, setTasbihCount] = useState(() => {
    const saved = localStorage.getItem('ikhlas_tasbih');
    return saved ? parseInt(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('ikhlas_mutabaah', JSON.stringify(mutabaah));
  }, [mutabaah]);

  useEffect(() => {
    localStorage.setItem('ikhlas_khatam', JSON.stringify(khatamProgress));
  }, [khatamProgress]);

  useEffect(() => {
    localStorage.setItem('ikhlas_tasbih', tasbihCount.toString());
  }, [tasbihCount]);

  const filteredTools = TOOLS.filter(t => 
    (category === 'all' || t.category === category) &&
    (t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const containsForbiddenWords = (text: string) => {
    const lowerText = text.toLowerCase();
    return FORBIDDEN_WORDS.some(word => {
      const regex = new RegExp(`(\\s|^|[^a-zA-Z0-9])${word}(\\s|$|[^a-zA-Z0-9])`, 'i');
      return regex.test(lowerText);
    });
  };

  const handleToolAction = async (prompt: string) => {
    if (containsForbiddenWords(prompt)) {
      onForbiddenWordDetected();
      setInput('');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      if (selectedTool === 'art') {
        const url = await generateImage(prompt);
        setResult({ type: 'image', url });
      } else if (selectedTool === 'ai_video') {
        const url = await generateVideo(prompt);
        setResult({ type: 'video', url });
      } else if (selectedTool?.startsWith('el_')) {
        await handleElevenLabsAction(selectedTool, prompt);
      } else {
        const useSearch = selectedTool === 'hoax';
        const response = await sendMessageToAI(prompt, [], BASE_SYSTEM_INSTRUCTION, useSearch);
        setResult({ type: 'text', content: response.text || "Terjadi kesalahan dalam memproses cahaya hikmah." });
      }
    } catch (e) {
      setResult({ type: 'text', content: "Maaf, koneksi batin digital terputus. Mohon coba lagi." });
    }
    setLoading(false);
  };

  const handleElevenLabsAction = async (id: string, prompt: string) => {
    const headers = { 'xi-api-key': ELEVEN_LABS_KEY };
    try {
      if (id === 'el_tts') {
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: prompt, model_id: 'eleven_multilingual_v2' })
        });
        const blob = await response.blob();
        setResult({ type: 'audio', url: URL.createObjectURL(blob) });
      } else if (id === 'el_stt' && file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('model_id', 'scribe_v1');
        const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
          method: 'POST',
          headers: headers,
          body: formData
        });
        const data = await response.json();
        setResult({ type: 'text', content: `### Hasil Transkripsi\n\n${data.text}` });
      } else if (id === 'el_sts' && file) {
        const formData = new FormData();
        formData.append('audio', file);
        const response = await fetch('https://api.elevenlabs.io/v1/speech-to-speech/21m00Tcm4TlvDq8ikWAM', {
          method: 'POST',
          headers: headers,
          body: formData
        });
        const blob = await response.blob();
        setResult({ type: 'audio', url: URL.createObjectURL(blob) });
      } else {
        setResult({ type: 'text', content: "Mohon unggah file audio terlebih dahulu." });
      }
    } catch (err) {
      console.error(err);
      setResult({ type: 'text', content: "Gagal memproses audio via ElevenLabs." });
    }
  };

  const renderToolView = () => {
    if (!selectedTool) return null;
    const tool = TOOLS.find(t => t.id === selectedTool);
    const isAudioInputRequired = ['el_sts', 'el_stt'].includes(selectedTool);
    
    return (
      <div className="animate-in fade-in slide-in-from-right-10 duration-500 space-y-6 relative">
        <button onClick={() => { setSelectedTool(null); setResult(null); setInput(''); setFile(null); setPanicConfirmed(false); }} className="flex items-center gap-2 text-amber-500 font-bold mb-4 hover:translate-x-[-4px] transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg> Kembali ke Dashboard
        </button>

        <div className="flex items-center gap-4 mb-8">
          <span className="text-5xl animate-float">{tool?.icon}</span>
          <div>
            <h2 className="text-3xl font-bold gold-shimmer">{tool?.name}</h2>
            <p className="text-slate-400">{tool?.description}</p>
          </div>
        </div>

        <div className="glass-morphism rounded-[2rem] p-6 md:p-10 border border-white/10 shadow-2xl space-y-6">
          {selectedTool === 'panic' ? (
            <div className="py-6">
              {!panicConfirmed ? (
                <div className="text-center space-y-6 bg-red-950/20 p-8 rounded-[2rem] border border-red-500/30 animate-in zoom-in duration-300">
                  <span className="text-7xl block mb-4">🛑</span>
                  <h3 className="text-2xl font-black text-red-500 uppercase tracking-tighter">PERINGATAN KERAS</h3>
                  <p className="text-slate-300 text-sm leading-relaxed max-w-md mx-auto">
                    Fitur ini hanya untuk keadaan <strong>DARURAT NYATA</strong>. Mempermainkan layanan darurat adalah pelanggaran adab yang serius dan dapat berkonsekuensi hukum. 
                  </p>
                  <button 
                    onClick={() => setPanicConfirmed(true)} 
                    className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all shadow-xl active:scale-95"
                  >
                    SAYA MENGERTI & BENAR DALAM DARURAT
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-500">
                  <button onClick={() => setConfirmCall({ name: 'Ambulans', link: 'tel:118' })} className="flex flex-col items-center gap-4 p-8 bg-red-500/10 border border-red-500/30 rounded-3xl hover:bg-red-500/20 transition-all group">
                      <span className="text-4xl group-hover:scale-125 transition-transform">🚑</span>
                      <span className="font-bold text-red-500 uppercase tracking-widest">Ambulans (118)</span>
                  </button>
                  <button onClick={() => setConfirmCall({ name: 'Pemadam Kebakaran', link: 'tel:113' })} className="flex flex-col items-center gap-4 p-8 bg-orange-500/10 border border-orange-500/30 rounded-3xl hover:bg-orange-500/20 transition-all group">
                      <span className="text-4xl group-hover:scale-125 transition-transform">🚒</span>
                      <span className="font-bold text-orange-500 uppercase tracking-widest">Pemadam (113)</span>
                  </button>
                  <button onClick={() => setConfirmCall({ name: 'Polisi', link: 'tel:110' })} className="flex flex-col items-center gap-4 p-8 bg-blue-500/10 border border-blue-500/30 rounded-3xl hover:bg-blue-500/20 transition-all group">
                      <span className="text-4xl group-hover:scale-125 transition-transform">👮</span>
                      <span className="font-bold text-blue-500 uppercase tracking-widest">Polisi (110)</span>
                  </button>
                </div>
              )}

              {/* Modal Konfirmasi Telepon */}
              {confirmCall && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
                  <div className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] max-w-sm w-full text-center space-y-6 shadow-2xl border-t-4 border-t-red-500">
                    <h4 className="text-xl font-bold text-white">Hubungi {confirmCall.name}?</h4>
                    <p className="text-slate-400 text-sm">Pastikan Anda benar-benar membutuhkan bantuan darurat saat ini.</p>
                    <div className="flex gap-3">
                      <button onClick={() => setConfirmCall(null)} className="flex-1 py-3 bg-white/5 text-slate-400 rounded-xl font-bold hover:bg-white/10">Batal</button>
                      <a href={confirmCall.link} onClick={() => setConfirmCall(null)} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg">HUBUNGI SEKARANG</a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : selectedTool === 'mutabaah' ? (
            <div className="space-y-4 py-4">
               {[
                 { id: 'salat5', label: 'Sudah Salat 5 Waktu Tepat Waktu?' },
                 { id: 'sedekah', label: 'Sudah Sedekah Hari Ini?' },
                 { id: 'quran', label: 'Sudah Membaca Al-Quran Hari Ini?' },
                 { id: 'dzikir', label: 'Sudah Dzikir Pagi/Petang?' }
               ].map(item => (
                 <div key={item.id} onClick={() => setMutabaah({...mutabaah, [item.id]: !mutabaah[item.id]})} className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${mutabaah[item.id] ? 'bg-amber-500/20 border-amber-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <span className={`font-bold ${mutabaah[item.id] ? 'text-amber-500' : 'text-slate-400'}`}>{item.label}</span>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${mutabaah[item.id] ? 'bg-amber-500 border-amber-500' : 'border-slate-600'}`}>
                       {mutabaah[item.id] && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                    </div>
                 </div>
               ))}
               <p className="text-[10px] text-center text-slate-500 italic mt-4">"Evaluasi diri adalah jalan menuju Ikhlas."</p>
            </div>
          ) : selectedTool === 'tasbih' ? (
            <div className="flex flex-col items-center justify-center space-y-8 py-10">
              <div onClick={() => setTasbihCount(prev => prev + 1)} className="w-48 h-48 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center cursor-pointer shadow-2xl active:scale-95 transition-all ring-8 ring-amber-500/20">
                <span className="text-6xl font-black text-white">{tasbihCount}</span>
              </div>
              <button onClick={() => setTasbihCount(0)} className="px-6 py-2 bg-white/5 text-slate-400 rounded-full border border-white/10">Reset</button>
            </div>
          ) : (
            <>
              {isAudioInputRequired && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Upload Audio (MP3/WAV)</label>
                  <div onClick={() => fileInputRef.current?.click()} className="w-full p-8 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all">
                    <span className="text-3xl mb-2">📁</span>
                    <p className="text-sm text-slate-400">{file ? file.name : 'Klik untuk pilih file audio'}</p>
                    <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] || null)}/>
                  </div>
                </div>
              )}
              
              {!isAudioInputRequired || selectedTool === 'el_sts' ? (
                <textarea 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={getPlaceholder(selectedTool)}
                  className="w-full h-32 md:h-40 p-6 bg-white/5 rounded-[2rem] border border-white/10 text-white outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                />
              ) : null}

              <button 
                onClick={() => handleToolAction(getPrompt(selectedTool, input))}
                disabled={loading || (!input && !isAudioInputRequired) || (isAudioInputRequired && !file)}
                className="w-full py-4 bg-amber-500 text-white font-bold rounded-2xl shadow-xl disabled:opacity-50 hover:brightness-110 transition-all flex justify-center items-center gap-2"
              >
                {loading ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> : 'Eksekusi Fitur'}
              </button>
            </>
          )}

          {result && (
            <div className="mt-8 p-6 bg-slate-900/80 rounded-[2rem] border border-white/10 animate-in zoom-in-95 duration-500 overflow-x-auto">
              {result.type === 'image' ? (
                <img src={result.url} className="w-full rounded-2xl shadow-2xl" alt="Hasil Art" />
              ) : result.type === 'video' ? (
                <video src={result.url} controls className="w-full rounded-2xl shadow-2xl" />
              ) : result.type === 'audio' ? (
                <audio src={result.url} controls className="w-full" />
              ) : (
                <MarkdownContent content={result.content} />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const getPlaceholder = (id: string) => {
    switch(id) {
      case 'mood': return "Cth: Saya sedang merasa sedih karena gagal ujian...";
      case 'niat': return "Cth: Saya mau sedekah ke mushola supaya dipuji tetangga...";
      case 'hoax': return "Tempelkan potongan berita atau hadits yang meragukan di sini...";
      case 'el_tts': return "Masukkan teks yang ingin diubah jadi suara...";
      case 'ai_video': return "Deskripsikan video yang ingin dibuat...";
      default: return "Masukkan pertanyaan atau tema di sini...";
    }
  };

  const getPrompt = (id: string, text: string) => {
    switch(id) {
      case 'mood': return `Berdasarkan kondisi hati user: "${text}", carikan satu ayat Al-Quran yang paling relevan untuk menenangkan hati. Jelaskan maknanya secara lembut.`;
      case 'niat': return `User bertanya tentang niatnya melakukan: "${text}". Berikan nasehat singkat dan bijaksana agar niat tetap Ikhlas karena Allah.`;
      case 'hoax': return `Periksa apakah informasi/hadits ini hoax atau bukan: "${text}". Gunakan Google Search untuk verifikasi dan berikan kesimpulan yang jelas berdasarkan sumber terpercaya.`;
      case 'ai_syair': return `Buatkan bait-bait syair atau pantun nasehat Islami tentang: ${text}.`;
      case 'ai_script': return `Buatkan draf naskah video pendek dakwah bertema: ${text}.`;
      default: return text;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32 h-full overflow-y-auto scroll-smooth">
      {selectedTool ? renderToolView() : (
        <div className="space-y-12">
          <div className="text-center space-y-4 animate-in fade-in duration-700">
            <h1 className="text-4xl md:text-6xl font-black gold-shimmer drop-shadow-2xl">AI Toolbox Ikhlas</h1>
            <p className="text-slate-400 text-lg">Asisten pintar untuk setiap aspek kehidupan Islami Anda.</p>
            <div className="max-w-2xl mx-auto pt-8 flex flex-col md:flex-row gap-4">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari fitur..." className="w-full py-4 px-6 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/50 text-white transition-all" />
              <select value={category} onChange={e => setCategory(e.target.value as ToolCategory)} className="bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none cursor-pointer">
                <option value="all">Semua</option>
                <option value="security">Keamanan</option>
                <option value="spiritual">Spiritual</option>
                <option value="practical">Praktikal</option>
                <option value="generator">Generator</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredTools.map((tool, idx) => (
              <button key={tool.id} style={{ animationDelay: `${idx * 50}ms` }} onClick={() => setSelectedTool(tool.id)} className={`group p-6 md:p-8 glass-morphism rounded-[2.5rem] border transition-all text-left flex flex-col gap-4 hover:translate-y-[-10px] hover:shadow-2xl relative animate-in fade-in slide-in-from-bottom-5 duration-700 ${tool.isTop ? 'border-amber-500/40 bg-amber-500/5 animate-border-glow' : 'border-white/5 hover:border-amber-500/50'}`}>
                {tool.isTop && <div className="absolute -top-2 -right-2 px-3 py-1 bg-amber-500 text-white text-[10px] font-black rounded-full animate-bounce">TOP</div>}
                <span className="text-4xl md:text-5xl group-hover:scale-125 transition-transform duration-500 animate-float">{tool.icon}</span>
                <div>
                  <h3 className="font-bold text-sm md:text-base text-white group-hover:text-amber-500 transition-colors">{tool.name}</h3>
                  <p className="text-slate-500 text-[10px] md:text-xs line-clamp-2">{tool.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiTools;
