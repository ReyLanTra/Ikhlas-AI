
import React from 'react';

type LegalType = 'cookies' | 'privacy' | 'terms' | 'security';

interface LegalModalProps {
  type: LegalType;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const content = {
    cookies: {
      title: "Cookie Preferences",
      body: "Ikhlas.AI menggunakan cookie lokal (localStorage) untuk menyimpan preferensi tema, profil Anda, dan riwayat obrolan secara lokal di perangkat Anda. Kami tidak melacak data Anda untuk keperluan iklan pihak ketiga."
    },
    privacy: {
      title: "Privacy Policy",
      body: "Data pribadi Anda, termasuk nama dan foto profil, disimpan secara lokal di browser Anda. Kami berkomunikasi dengan Gemini API untuk memproses permintaan Anda, namun kami berkomitmen untuk tidak menyimpan data obrolan di server kami secara permanen."
    },
    terms: {
      title: "Terms of Use",
      body: "Dengan menggunakan Ikhlas.AI, Anda setuju untuk menjaga kesopanan dan tidak menggunakan platform ini untuk menyebarkan kebencian, konten ilegal, atau spam. Fitur filter kata kasar kami akan memantau aktivitas untuk menjaga adab digital."
    },
    security: {
      title: "Report Security Issues",
      body: "Keamanan adalah prioritas kami. Jika Anda menemukan kerentanan pada platform Ikhlas.AI, mohon hubungi tim pengembang melalui WhatsApp atau Media Sosial yang tertera di menu 'Tentang Ikhlas.AI'."
    }
  };

  const active = content[type];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-8 flex flex-col gap-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold gold-shimmer">{active.title}</h2>
          <div className="h-0.5 w-16 bg-amber-500 mx-auto rounded-full"></div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed text-center">
          {active.body}
        </p>
        <button 
          onClick={onClose}
          className="w-full py-4 bg-amber-500 text-white font-bold rounded-2xl hover:brightness-110 transition-all active:scale-95"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
};

export default LegalModal;
