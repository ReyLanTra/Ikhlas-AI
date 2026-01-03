
import React, { useState } from 'react';
import LegalModal from './LegalModal';

interface OnboardingModalProps {
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [legalType, setLegalType] = useState<'cookies' | 'privacy' | 'terms' | 'security' | null>(null);
  const [agreed, setAgreed] = useState(false);

  const steps = [
    {
      title: "Ikhlas.AI",
      subtitle: "Hikmah dalam Setiap Bit",
      icon: "🕌",
      content: "Selamat datang di perpaduan spiritualitas dan kecerdasan buatan masa depan. Ikhlas.AI hadir sebagai pembimbing cerdas dari Mushola Al-Ikhlas Pekunden."
    },
    {
      title: "Teknologi Mewah",
      subtitle: "Navigasi Antarmuka",
      icon: "💎",
      content: "Nikmati antarmuka Liquid Glass yang didesain untuk kenyamanan batin dan produktivitas tinggi. Akses Toolbox dan Arena Hikmah melalui bilah navigasi."
    },
    {
      title: "Adab Digital",
      subtitle: "Interaksi Berkah",
      icon: "📜",
      content: "Ikhlas.AI memantau setiap input dengan filter kesopanan. Pelanggaran adab akan berujung pada pemutusan akses permanen. Jagalah lisan Anda."
    },
    {
      title: "Mulai Perjalanan",
      subtitle: "Siap Berdiskusi",
      icon: "✨",
      content: "Mari mulai perjalanan mencari rida-Nya dan pengetahuan yang bermanfaat. Kami akan memberikan tutorial singkat setelah Anda masuk."
    }
  ];

  const totalSteps = steps.length;

  return (
    <div className="fixed inset-0 z-[1500] bg-slate-950/60 backdrop-blur-3xl flex items-center justify-center p-4">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

      <div className="max-w-xl w-full liquid-glass rounded-[3.5rem] p-10 md:p-14 space-y-10 animate-in zoom-in fade-in duration-700 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-500/20 shadow-2xl">
            <span className="text-5xl animate-float">{steps[step - 1].icon}</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/80">{steps[step - 1].subtitle}</p>
          <h2 className="text-4xl font-black gold-shimmer">{steps[step - 1].title}</h2>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 min-h-[160px] flex items-center justify-center">
          <p className="text-slate-300 text-center leading-relaxed font-medium text-lg">
            {steps[step - 1].content}
          </p>
        </div>

        {step === totalSteps && (
          <div className="space-y-6 pt-4 animate-in fade-in duration-1000">
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <button onClick={() => setLegalType('cookies')} className="p-3 bg-white/5 rounded-xl hover:text-amber-500 transition-colors border border-white/5">Cookie</button>
              <button onClick={() => setLegalType('privacy')} className="p-3 bg-white/5 rounded-xl hover:text-amber-500 transition-colors border border-white/5">Privacy</button>
              <button onClick={() => setLegalType('terms')} className="p-3 bg-white/5 rounded-xl hover:text-amber-500 transition-colors border border-white/5">Terms</button>
              <button onClick={() => setLegalType('security')} className="p-3 bg-white/5 rounded-xl hover:text-amber-500 transition-colors border border-white/5">Security</button>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer group bg-white/5 p-4 rounded-2xl border border-white/5">
              <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="w-5 h-5 accent-amber-500" />
              <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">Saya menyetujui seluruh adab dan kebijakan di atas.</span>
            </label>
          </div>
        )}

        <div className="flex gap-4">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 py-5 bg-white/5 text-slate-400 font-bold rounded-2xl hover:bg-white/10 transition-all border border-white/5">Kembali</button>
          )}
          <button 
            onClick={() => step < totalSteps ? setStep(step + 1) : agreed && onComplete()} 
            disabled={step === totalSteps && !agreed}
            className={`flex-[2] py-5 bg-amber-500 text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest active:scale-95 disabled:opacity-30`}
          >
            {step < totalSteps ? 'Lanjutkan' : 'Mulai Sekarang'}
          </button>
        </div>

        <div className="flex justify-center gap-3">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step === i + 1 ? 'w-10 bg-amber-500 shadow-[0_0_10px_rgba(212,175,55,0.8)]' : 'w-2 bg-slate-800'}`} />
          ))}
        </div>
      </div>
      {legalType && <LegalModal type={legalType} onClose={() => setLegalType(null)} />}
    </div>
  );
};

export default OnboardingModal;
