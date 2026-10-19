import React, { useRef } from 'react';
import {
  X,
  Printer,
  Download,
  QrCode,
  ShieldCheck,
  MapPin,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Business } from '../../types';

interface QrStickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
}

export const QrStickerModal: React.FC<QrStickerModalProps> = ({
  isOpen,
  onClose,
  business,
}) => {
  const stickerRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !business) return null;

  const handlePrint = () => {
    window.print();
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    `https://bwana.africa/biz/${business.id}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl my-8 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-stone-950 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold font-display text-white">
              Printable Storefront QR Sticker
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Sticker Preview */}
        <div className="p-6 flex flex-col items-center justify-center bg-stone-100 dark:bg-stone-950">
          <div
            ref={stickerRef}
            className="w-full max-w-[300px] bg-stone-950 text-white rounded-2xl p-6 border-4 border-amber-500 shadow-2xl flex flex-col items-center text-center space-y-4"
          >
            {/* Header Badge */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 tracking-wider uppercase">
              <span className="text-amber-400">★</span>
              <span>FIND US ON BWANA</span>
              <span className="text-amber-400">★</span>
            </div>

            {/* Shop Name */}
            <div>
              <h2 className="text-lg font-extrabold font-display text-white leading-tight">
                {business.name}
              </h2>
              <div className="text-[11px] text-stone-400 mt-0.5 flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{business.area}, {business.city}</span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-xl shadow-inner">
              <img
                src={qrImageUrl}
                alt={`QR code for ${business.name}`}
                className="w-44 h-44 object-contain"
              />
            </div>

            {/* Call to Action */}
            <div className="space-y-1">
              <p className="text-[11px] text-stone-300 font-semibold">
                Scan with phone camera or WhatsApp
              </p>
              <p className="text-[10px] text-stone-400">
                View catalog, prices, reviews & pay with MoMo
              </p>
            </div>

            {/* Verified seal */}
            <div className="w-full pt-3 border-t border-stone-800 flex items-center justify-between text-[10px] font-mono text-stone-400">
              <span className="text-amber-400 font-bold">BWANA VERIFIED</span>
              <span>ID: {business.id.slice(0, 8)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
          <span className="text-[11px] text-stone-500">
            Stick on shop counter, door, or window
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sticker</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
