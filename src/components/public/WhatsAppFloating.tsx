import React from 'react';
import { MessageCircle } from 'lucide-react';
import { cleanWhatsAppNumber } from '../../lib/utils';

export const WhatsAppFloating: React.FC<{ phone: string; storeName: string }> = ({
  phone,
  storeName,
}) => {
  const url = `https://wa.me/${cleanWhatsAppNumber(phone)}?text=${encodeURIComponent(
    `Halo admin ${storeName}, saya mau tanya estimasi harga jual HP rusak saya.`
  )}`;

  return (
    <aside aria-label="Konsultasi WhatsApp" className="fixed bottom-6 right-6 z-40 print:hidden flex flex-col items-end gap-2 group">
      <div className="hidden sm:block bg-slate-900 text-white text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Konsultasi via WhatsApp
      </div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all ring-4 ring-emerald-500/20"
        aria-label="Chat WhatsApp Admin"
      >
        <MessageCircle className="w-7 h-7 fill-white" />
      </a>
    </aside>
  );
};
