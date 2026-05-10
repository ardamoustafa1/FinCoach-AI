import { useState } from 'react';
import { Bot, ArrowRight, Check } from 'lucide-react';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ name: '', income: '', bank: '' });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleFinish();
  };

  const handleFinish = () => {
    localStorage.setItem('butceai_onboarding_completed', 'true');
    localStorage.setItem('butceai_user_name', data.name);
    localStorage.setItem('butceai_income', data.income);
    localStorage.setItem('butceai_bank', data.bank);
    onComplete(data);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-surface-950/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-surface-850 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full" />

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Bot className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-surface-900 dark:text-white">BütçeAI'a Hoş Geldin</h2>
            <p className="text-sm text-surface-500 mt-2">Seni daha yakından tanımak istiyorum.</p>
          </div>

          <div className="space-y-4">
            {step === 1 && (
              <div className="animate-slide-up">
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-200 mb-2">Adın ne?</label>
                <input 
                  type="text" 
                  value={data.name} 
                  onChange={e => setData({...data, name: e.target.value})} 
                  autoFocus
                  placeholder="Örn: Arda" 
                  className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 focus:ring-2 focus:ring-primary-500 outline-none text-surface-900 dark:text-white transition-all"
                />
              </div>
            )}
            {step === 2 && (
              <div className="animate-slide-up">
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-200 mb-2">Aylık gelirin (₺)</label>
                <input 
                  type="number" 
                  value={data.income} 
                  onChange={e => setData({...data, income: e.target.value})} 
                  autoFocus
                  placeholder="Örn: 25000" 
                  className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 focus:ring-2 focus:ring-primary-500 outline-none text-surface-900 dark:text-white transition-all"
                />
              </div>
            )}
            {step === 3 && (
              <div className="animate-slide-up">
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-200 mb-2">Hangi bankayı kullanıyorsun?</label>
                <input 
                  type="text" 
                  value={data.bank} 
                  onChange={e => setData({...data, bank: e.target.value})} 
                  autoFocus
                  placeholder="Örn: Garanti BBVA" 
                  className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 focus:ring-2 focus:ring-primary-500 outline-none text-surface-900 dark:text-white transition-all"
                />
              </div>
            )}

            <button 
              onClick={handleNext} 
              disabled={(step === 1 && !data.name) || (step === 2 && !data.income) || (step === 3 && !data.bank)}
              className="w-full mt-6 py-3.5 rounded-xl bg-primary-500 text-white font-bold hover:bg-primary-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {step === 3 ? (
                <>Başla <Check className="w-5 h-5" /></>
              ) : (
                <>Devam Et <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </div>

          <div className="flex gap-2 justify-center mt-6">
            <div className={`w-2 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'}`} />
            <div className={`w-2 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'}`} />
            <div className={`w-2 h-2 rounded-full transition-colors ${step >= 3 ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
