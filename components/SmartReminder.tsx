
import React, { useState, useEffect } from 'react';

const SmartReminder: React.FC = () => {
  const [reminder, setReminder] = useState<{ msg: string; icon: string; type: 'info' | 'warn' | 'fasting' } | null>(null);

  useEffect(() => {
    const calculateReminders = () => {
      const now = new Date();
      const hours = now.getHours();
      const mins = now.getMinutes();
      const day = now.getDay(); // 0: Sunday, 1: Monday, ... 3: Wednesday, 4: Thursday

      // 1. Zawal / Forbidden Prayer Time (Matahari tepat di atas kepala)
      // Estimasi Zawal antara 11:45 - 12:15 WIB
      if (hours === 11 && mins >= 45 && mins <= 59) {
        setReminder({
          msg: "Waktu Larangan Salat (Zawal): Matahari tepat di atas kepala. Hindari salat sunnah mutlak hingga masuk waktu Dzuhur.",
          icon: "☀️",
          type: "warn"
        });
        return;
      }

      // 2. Sunnah Fasting Reminder (H-1)
      if (day === 0) { // Sunday
        setReminder({
          msg: "Besok adalah hari Senin. Mari siapkan diri untuk Puasa Sunnah Senin besok.",
          icon: "🌙",
          type: "fasting"
        });
        return;
      }
      if (day === 3) { // Wednesday
        setReminder({
          msg: "Besok adalah hari Kamis. Mari siapkan diri untuk Puasa Sunnah Kamis besok.",
          icon: "🌙",
          type: "fasting"
        });
        return;
      }

      // 3. Countdown Ramadan (Estimated March 1, 2025)
      const ramadanDate = new Date('2025-03-01');
      const diffRamadan = ramadanDate.getTime() - now.getTime();
      const daysToRamadan = Math.ceil(diffRamadan / (1000 * 60 * 60 * 24));

      if (daysToRamadan > 0 && daysToRamadan <= 100) {
        setReminder({
          msg: `${daysToRamadan} Hari Menuju Ramadan 2025. Mari perkuat niat dan persiapkan batin.`,
          icon: "🕌",
          type: "info"
        });
        return;
      }

      setReminder(null);
    };

    calculateReminders();
    const interval = setInterval(calculateReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  if (!reminder) return null;

  return (
    <div className={`p-4 mx-4 mt-4 rounded-3xl border flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 shadow-lg ${
      reminder.type === 'warn' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
      reminder.type === 'fasting' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
      'bg-amber-500/10 border-amber-500/30 text-amber-400'
    }`}>
      <span className="text-2xl animate-bounce">{reminder.icon}</span>
      <p className="text-xs font-bold leading-relaxed flex-1">{reminder.msg}</p>
    </div>
  );
};

export default SmartReminder;
