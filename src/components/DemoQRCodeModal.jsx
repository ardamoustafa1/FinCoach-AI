import { QRCodeSVG } from 'qrcode.react';
import { X, ExternalLink } from 'lucide-react';

export default function DemoQRCodeModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-white dark:bg-surface-850 rounded-3xl shadow-2xl p-8 md:p-12 text-center animate-slide-up border border-surface-200 dark:border-surface-700 relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-black text-surface-900 dark:text-white mb-2">Canlı Demo</h2>
        <p className="text-surface-700 dark:text-surface-200 mb-8">Uygulamayı kendi telefonunuzda denemek için kameranızla tarayın.</p>

        <div className="inline-block p-6 bg-white rounded-3xl shadow-xl shadow-surface-950/5 mx-auto">
          <QRCodeSVG value="https://butceai.vercel.app" size={280} level="H" />
        </div>
        
        <a 
          href="https://butceai.vercel.app" 
          target="_blank" 
          rel="noreferrer"
          className="mt-8 flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 font-bold hover:underline"
        >
          butceai.vercel.app <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
