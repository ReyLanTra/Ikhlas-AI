
// Fix: Use 'any' for timerRef to avoid NodeJS.Timeout namespace error in browser environment
import React, { useState, useEffect, useRef } from 'react';
import { AppSettings } from '../types';
import { sendMessageToAI } from '../services/geminiService';
import { FORBIDDEN_WORDS } from '../constants';
import MarkdownContent from './MarkdownContent';

interface AiGamesProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onSetGameLocked?: (locked: boolean) => void;
  onForbiddenWordDetected: () => void;
}

type Difficulty = 'Mubtadi' | 'Mutawassit' | 'Mahir';

interface GameDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  isDuel?: boolean;
}

const GAMES: GameDef[] = [
  // Single Player Games
  { id: 'ayat', name: 'Tebak Ayat', icon: '📖', desc: 'Ujilah hafalan Anda dengan menebak surah dari potongan ayat suci.' },
  { id: 'mystery', name: 'Siapa Aku?', icon: '🕵️', desc: 'Pecahkan misteri sosok Nabi & Rasul melalui petunjuk-petunjuk khusus.' },
  { id: 'rush', name: 'Quiz Rush', icon: '⚡', desc: 'Cerdas Cermat kilat 10 soal untuk menguji kecepatan berpikir Anda.' },
  { id: 'typing', name: 'Fast Typing Doa', icon: '⌨️', desc: 'Latih kecepatan mengetik doa harian dan dzikir ma\'tsurat.' },
  { id: 'sirah', name: 'Detektif Sirah', icon: '🔍', desc: 'Temukan fakta menarik di balik sejarah perjuangan umat Islam.' },
  { id: 'malaikat', name: 'Tugas Malaikat', icon: '👼', desc: 'Kenali 10 Malaikat Allah beserta tugas-tugas mulia yang mereka emban.' },
  { id: 'asmaul', name: 'Asmaul Husna', icon: '✨', desc: 'Hafalkan dan pahami makna dari nama-nama indah Allah SWT.' },
  { id: 'wudhu', name: 'Urutan Wudhu', icon: '💧', desc: 'Sempurnakan ibadah dengan mengurutkan tata cara bersuci dengan benar.' },
  { id: 'adab_quiz', name: 'Labirin Adab', icon: '🤝', desc: 'Belajar akhlak mulia melalui simulasi situasi sehari-hari.' },
  { id: 'hijaiyah', name: 'Tebak Hijaiyah', icon: '🖊️', desc: 'Perdalam makhrojul huruf dengan mengenali simbol huruf Hijaiyah.' },
  { id: 'warisan_m', name: 'Waris Mini', icon: '⚖️', desc: 'Belajar dasar-dasar ilmu faraid dalam pembagian harta waris.' },
  { id: 'halal_hunt', name: 'Cari Kata Halal', icon: '🧩', desc: 'Temukan istilah-istilah Islami yang tersembunyi dalam kotak huruf.' },
  
  // Duel Modes (Battle VS AI)
  { id: 'shiritori', name: 'Duel Sambung Kata', icon: '🤝', desc: 'Adu kosa kata Islam dengan Ikhlas.AI dalam mode Shiritori.', isDuel: true },
  { id: 'h-battle', name: 'Hangman Battle', icon: '⚔️', desc: 'Duel tebak kata rahasia sebelum nyawa Anda habis.', isDuel: true },
  { id: 'w-rush', name: 'Word Rush Duel', icon: '🏃', desc: 'Siapa yang tercepat menjawab definisi istilah agama?', isDuel: true },
  { id: 'tajwid_d', name: 'Tajwid Master', icon: '🎤', desc: 'Uji pemahaman hukum tajwid Anda langsung melawan kecerdasan AI.', isDuel: true },
  { id: 'history_d', name: 'Sejarah Battle', icon: '🏹', desc: 'Duel wawasan sejarah Islam tingkat tinggi vs Ikhlas.AI.', isDuel: true }
];

const AiGames: React.FC<AiGamesProps> = ({ settings, onUpdateSettings, onSetGameLocked, onForbiddenWordDetected }) => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('Mubtadi');
  const [loading, setLoading] = useState(false);
  const [gameContent, setGameContent] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ msg: string; type: 'win' | 'lose' | 'neutral' } | null>(null);
  const [timer, setTimer] = useState<number>(0);
  
  const timerRef = useRef<any>(null);

  const [leaderboard, setLeaderboard] = useState<any[]>(() => {
    const saved = localStorage.getItem('ikhlas_leaderboard');
    return saved ? JSON.parse(saved) : [
      { name: 'Ustadz Digital', score: 5000 },
      { name: 'Santri Pekunden', score: 4200 },
      { name: 'Pejuang Subuh', score: 3800 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ikhlas_leaderboard', JSON.stringify(leaderboard));
  }, [leaderboard]);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startTimer = (seconds: number, onEnd: () => void) => {
    stopTimer();
    setTimer(seconds);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          stopTimer();
          onEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const containsForbiddenWords = (text: string) => {
    const lowerText = text.toLowerCase();
    return FORBIDDEN_WORDS.some(word => {
      const regex = new RegExp(`(\\s|^|[^a-zA-Z0-9])${word}(\\s|$|[^a-zA-Z0-9])`, 'i');
      return regex.test(lowerText);
    });
  };

  const addExp = (amount: number) => {
    const newExp = settings.userProfile.exp + amount;
    
    // Logika update Role Title berdasarkan EXP
    let titles = [...settings.userProfile.titles];
    if (newExp >= 500 && !titles.includes('Santri Teladan')) titles.push('Santri Teladan');
    if (newExp >= 1500 && !titles.includes('Khadimul Ilmi')) titles.push('Khadimul Ilmi');
    if (newExp >= 3000 && !titles.includes('Pakar Fiqih Pekunden')) titles.push('Pakar Fiqih Pekunden');

    onUpdateSettings({ userProfile: { ...settings.userProfile, exp: newExp, titles } });

    setLeaderboard(prev => {
      const existing = prev.find(p => p.name === settings.userProfile.name);
      if (existing) {
        return prev.map(p => p.name === settings.userProfile.name ? { ...p, score: p.score + amount } : p)
          .sort((a, b) => b.score - a.score);
      }
      return [...prev, { name: settings.userProfile.name, score: amount }].sort((a, b) => b.score - a.score);
    });
  };

  const startGame = async (id: string) => {
    setLoading(true);
    setFeedback(null);
    setUserAnswer('');
    stopTimer();
    if (onSetGameLocked) onSetGameLocked(true);

    try {
      let prompt = `Berikan tantangan game ${id} bertema Islam dengan tingkat kesulitan ${difficulty}. `;
      if (id === 'shiritori') prompt = `Mari main Duel Sambung Kata Islami. Mulai dengan satu kata benda Islam. Tingkat: ${difficulty}.`;
      if (id === 'malaikat') prompt = `Sebutkan satu nama malaikat atau tugasnya, dan minta saya menebak pasangannya. Tingkat: ${difficulty}.`;
      
      const res = await sendMessageToAI(prompt);
      setGameContent({ prompt: res.text, type: id });

      if (GAMES.find(g => g.id === id)?.isDuel) {
        startTimer(20, () => {
          setFeedback({ msg: "Waktu habis! Ikhlas.AI memenangkan duel ini.", type: 'lose' });
          if (onSetGameLocked) onSetGameLocked(false);
        });
      }
    } catch (e) {
      console.error(e);
      if (onSetGameLocked) onSetGameLocked(false);
    }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    if (containsForbiddenWords(userAnswer)) {
      onForbiddenWordDetected();
      setUserAnswer('');
      return;
    }

    setLoading(true);
    stopTimer();

    try {
      const checkPrompt = `Tantangan: "${gameContent.prompt}". Jawaban User: "${userAnswer}". Apakah benar? Jawab 'YA' atau 'TIDAK' di baris pertama, lalu penjelasan singkat di baris kedua.`;
      const res = await sendMessageToAI(checkPrompt);
      const isCorrect = res.text?.toUpperCase().includes('YA');

      if (isCorrect) {
        setFeedback({ msg: "Masya Allah, benar! Anda mendapatkan pahala ilmu (EXP).", type: 'win' });
        addExp(difficulty === 'Mahir' ? 200 : difficulty === 'Mutawassit' ? 100 : 50);
      } else {
        setFeedback({ msg: "Sayang sekali, jawaban kurang tepat. Teruslah belajar!", type: 'lose' });
      }
      if (onSetGameLocked) onSetGameLocked(false);
    } catch (e) {
      console.error(e);
      if (onSetGameLocked) onSetGameLocked(false);
    }
    setLoading(false);
  };

  const renderGameMenu = () => (
    <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-12 pb-32">
      <div className="text-center space-y-4 animate-in fade-in zoom-in duration-700">
        <h1 className="text-5xl font-black gold-shimmer drop-shadow-2xl">Arena Hikmah</h1>
        <p className="text-slate-400">Pusat Ketangkasan & Kecerdasan Jamaah Mushola Pekunden.</p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-6">
          <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
            {(['Mubtadi', 'Mutawassit', 'Mahir'] as Difficulty[]).map(d => (
              <button key={d} onClick={() => setDifficulty(d)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${difficulty === d ? 'bg-amber-500 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:text-white'}`}>{d}</button>
            ))}
          </div>
          <div className="glass-morphism px-6 py-2 rounded-full text-xs font-bold text-amber-500 uppercase tracking-widest border border-amber-500/20">
            EXP: {settings.userProfile.exp} | Gelar: {settings.userProfile.titles[settings.userProfile.titles.length - 1]}
          </div>
        </div>
      </div>

      <div className="space-y-16">
        {/* Mode Single Player (ATAS) */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-white/50 uppercase tracking-tighter">Mode Single Player</h2>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {GAMES.filter(g => !g.isDuel).map((game, idx) => (
              <button key={game.id} onClick={() => { setActiveGame(game.id); startGame(game.id); }} className="group glass-morphism p-6 rounded-[2rem] border border-white/5 hover:border-amber-500/50 transition-all text-left flex flex-col gap-3 shadow-lg hover:-translate-y-2 hover:bg-white/[0.02]">
                <span className="text-4xl group-hover:scale-125 transition-transform duration-500">{game.icon}</span>
                <div>
                   <h3 className="font-bold text-base text-white group-hover:text-amber-500">{game.name}</h3>
                   <p className="text-slate-500 text-[11px] leading-relaxed mt-1 line-clamp-3 italic opacity-70">
                     {game.desc}
                   </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Duel Battle Section (BAWAH) */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Duel Battle (Jamaah vs AI)</h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-amber-500 to-transparent rounded-full opacity-20"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAMES.filter(g => g.isDuel).map((game, idx) => (
              <button key={game.id} onClick={() => { setActiveGame(game.id); startGame(game.id); }} className="group relative bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] border border-amber-500/10 hover:border-amber-500/50 transition-all text-left flex items-center gap-6 shadow-2xl animate-in zoom-in duration-500">
                <span className="text-5xl group-hover:scale-125 transition-transform">{game.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-500">{game.name}</h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed opacity-60">{game.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Leaderboard */}
        <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">🏆 Peringkat Warga Pekunden</h3>
          <div className="space-y-3">
            {leaderboard.slice(0, 5).map((p, i) => (
              <div key={i} className={`flex items-center justify-between p-4 rounded-2xl ${i === 0 ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-white/5'}`}>
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-500'}`}>{i + 1}</span>
                  <span className="font-bold text-slate-200">{p.name}</span>
                </div>
                <span className="font-black text-amber-500">{p.score} <span className="text-[10px] text-slate-500">PTS</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGameView = () => {
    const game = GAMES.find(g => g.id === activeGame);
    return (
      <div className="p-6 md:p-12 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8">
        <button onClick={() => { setActiveGame(null); stopTimer(); if (onSetGameLocked) onSetGameLocked(false); }} className="text-amber-500 font-bold mb-8 flex items-center gap-2 hover:-translate-x-2 transition-transform">← Kembali ke Arena</button>
        <div className={`glass-morphism rounded-[3rem] p-8 md:p-12 border border-white/10 shadow-2xl space-y-8 text-center relative transition-all ${feedback?.type === 'win' ? 'shadow-[0_0_60px_rgba(16,185,129,0.2)]' : feedback?.type === 'lose' ? 'animate-shake shadow-[0_0_60px_rgba(239,68,68,0.2)]' : ''}`}>
          {timer > 0 && <div className="absolute top-0 left-0 h-1 bg-amber-500 transition-all duration-1000" style={{ width: `${(timer / 20) * 100}%` }} />}
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-6">
              <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : gameContent ? (
            <>
              <div className="text-7xl mb-2 animate-float">{game?.icon}</div>
              <h2 className="text-3xl font-black gold-shimmer">{game?.name}</h2>
              <div className="p-8 bg-slate-900/80 rounded-[2.5rem] border border-white/5 text-left leading-relaxed shadow-inner">
                <MarkdownContent content={gameContent.prompt} />
              </div>
              {feedback ? (
                <div className={`p-8 rounded-[2rem] border-2 animate-in zoom-in-95 duration-500 ${feedback.type === 'win' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
                  <p className="font-black text-2xl mb-6">{feedback.msg}</p>
                  <button onClick={() => startGame(activeGame!)} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black shadow-xl uppercase tracking-widest">Coba Lagi!</button>
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-bottom-4">
                  <textarea autoFocus value={userAnswer} onChange={e => setUserAnswer(e.target.value)} placeholder="Tuliskan jawaban Anda..." className="w-full p-6 bg-white/5 border border-white/10 rounded-[2rem] text-center outline-none focus:ring-4 focus:ring-amber-500/20 text-xl font-medium min-h-[120px]" onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), submitAnswer())}/>
                  <button onClick={submitAnswer} disabled={!userAnswer.trim()} className="w-full py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black rounded-[2rem] shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest">Kirim Jawaban</button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    );
  };

  return <div className="h-full scroll-smooth bg-slate-950/50">{activeGame ? renderGameView() : renderGameMenu()}</div>;
};

export default AiGames;
