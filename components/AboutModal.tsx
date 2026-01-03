
import React, { useState, useEffect } from 'react';
import MarkdownContent from './MarkdownContent';

interface AboutModalProps {
  onClose: () => void;
}

const TypingText: React.FC<{ text: string; delay?: number; onComplete?: () => void }> = ({ text, delay = 50, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[index]);
        setIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, delay, onComplete]);

  return <span>{displayedText}</span>;
};

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  const [showFullMessage, setShowFullMessage] = useState(false);

  const bioInfo = [
    { label: "Nama", value: "Reyzar Alansyah Putra" },
    { label: "Umur", value: "15 Tahun" },
    { label: "Tanggal Lahir", value: "18 April 2010" },
    { label: "Tempat Lahir", value: "TEGAL" },
    { label: "Pendidikan", value: "Pelajar SMK Bhakti Praja" },
    { label: "Jurusan", value: "Desain Komunikasi Visual" },
    { label: "Alamat", value: "Pekunden, Pakulaut, Kec. Margasari, Kab Tegal" },
    { label: "Alamat Rinci", value: "RT 3 RW 5, Jln. Kakak Tua, No. 24" },
    { label: "Media Sosial", value: "https://medsos.reyzar.my.id", isLink: true },
    { label: "WhatsApp", value: "https://wa.me/6285800240112", isLink: true }
  ];

  // Memastikan pesan muncul meskipun ada elemen link di akhir daftar bio
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFullMessage(true);
    }, 2500); // Muncul otomatis setelah 2.5 detik jika animasi typing selesai/terlewati
    return () => clearTimeout(timer);
  }, []);

  const creatorMessage = `"**Assalamualaikum Warahmatullahi Wabarakatuh.**"

Jujur, alasan saya menciptakan **Ikhlas.AI** adalah karena saya ingin membuktikan bahwa teknologi tinggi itu bukan cuma milik perusahaan besar atau gedung pencakar langit, tapi juga bisa lahir dari teras mushola kita. Inilah alasan mengapa saya menciptakan **Ikhlas.AI**:


### 1. Agar Ibadah Kita Jadi Lebih Gampang (Praktis)

Zaman sekarang orang inginnya serba cepat. Saya ingin jamaah nggak perlu bingung lagi cari tahu jarak minimal salat jamak, cara hitung warisan yang adil, atau sekadar cari niat zakat fitrah. Semuanya saya kumpulkan jadi satu di **Ikhlas.AI**. Satu tempat, semua beres.


### 2. Menjadikan Mushola Pusat Ilmu Tanpa Henti

Mushola kita punya keterbatasan fisik dan waktu, tapi ilmu agama tidak. Dengan fitur **Chatbot Pintar** dan **Knowledge Base**, saya ingin siapa pun bisa belajar fiqih, sejarah Nabi, hingga tajwid kapan saja bahkan di jam 2 pagi sekalipun. Ikhlas.AI adalah 'perpustakaan hidup' yang selalu sedia di saku bapak dan ibu.


### 3. Mengajak Anak Muda Kembali ke Akar (Gamifikasi Dakwah)

Saya gelisah melihat anak-anak muda kita lebih asyik dengan game yang nggak ada isinya. Maka, saya ciptakan **Mini Games** dan **Battle Duel**. Saya ingin anak-anak Pekunden bangga main *Tebak Ayat* atau *Duel Sambung Kata* lawan AI. Saya ingin mereka merasa kalau belajar agama itu asyik, kompetitif, dan 'keren'.


### 4. Melayani Kebutuhan Khusus yang Sering Terlupakan

Melalui fitur seperti **Woman Issues Center**, **Medical Fiqih**, hingga **Traveler Tool**, saya ingin memastikan bahwa semua jamaah, baik itu ibu-ibu, warga yang sedang sakit, maupun warga yang sedang dalam perjalanan tetap mendapatkan bimbingan ibadah yang tepat sesuai kondisi mereka.


### 5. Membangun Kebanggaan Warga Pekunden

Saya ingin warga Pekunden punya sesuatu yang bisa dibanggakan. Bahwa dari lingkungan kita, lahir sebuah sistem cerdas yang menyimpan data secara rapi (SQL Lite/JSON) dan dikelola secara modern. Ini adalah langkah kecil saya untuk membawa Mushola Al-Ikhlas melompat jauh ke depan.

---

**Intinya:**

**Ikhlas.AI** diciptakan bukan untuk menggantikan peran Ustaz atau pengurus, tapi untuk menjadi 'asisten setia' yang membantu kita semua menjadi hamba yang lebih baik, lebih pintar, dan lebih dekat dengan tuntunan syariat.

Semoga apa yang saya bangun ini menjadi amal jariyah dan membawa keberkahan bagi kita semua di Pekunden.

"**Wassalamualaikum Warahmatullahi Wabarakatuh.**"

**© 2025-2030 | Mushola Al-Ikhlas Pekunden | Reyzar Alansyah Putra**`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative max-h-[90vh]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-200 to-amber-500"></div>
        
        <div className="overflow-y-auto p-8 space-y-8 scroll-smooth">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold gold-shimmer">Pencipta Ikhlas.AI</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Profil Kreator & Pengembang</p>
          </div>

          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-amber-500/10 border border-amber-500/30 shadow-2xl">
                <img 
                  src="https://i.ibb.co.com/4RtCqr3t/d908c538278a6a86b739c3699c5ff1c0-1.jpg" 
                  alt="Reyzar Alansyah Putra" 
                  className="w-full h-full object-cover transition-transform hover:scale-110 duration-500"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-xl shadow-lg border-2 border-slate-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className="w-full space-y-4 bg-white/5 p-6 rounded-[2rem] border border-white/5">
              {bioInfo.map((info: any, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm gap-4">
                  <span className="text-slate-500 font-medium whitespace-nowrap">{info.label}</span>
                  <span className="text-slate-200 font-bold text-right truncate">
                    {info.isLink ? (
                      <a href={info.value} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">
                        {info.value.replace('https://', '')}
                      </a>
                    ) : (
                      <TypingText 
                        text={info.value} 
                        delay={20} 
                        onComplete={idx === 7 ? () => setShowFullMessage(true) : undefined}
                      />
                    )}
                  </span>
                </div>
              ))}
            </div>

            {showFullMessage && (
              <div className="w-full space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                <div className="p-1 bg-amber-500/10 rounded-full flex items-center justify-center">
                   <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-500/30"></div>
                   <span className="px-4 text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Pesan Dari Pembuat</span>
                   <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-500/30"></div>
                </div>
                
                <div className="prose prose-invert max-w-none bg-slate-800/50 p-6 rounded-[2.5rem] border border-white/5 shadow-inner">
                   <MarkdownContent content={creatorMessage} className="text-slate-300 text-sm leading-relaxed" />
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={onClose} 
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95 sticky bottom-0 z-10"
          >
            Tutup Informasi
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
