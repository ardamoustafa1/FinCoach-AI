import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';

const initialMessages = [
  { role: 'bot', text: 'Merhaba! 👋 Ben BütçeAI, kişisel finans koçunuz. Bütçenizi yönetmenize, tasarruf hedeflerinize ulaşmanıza ve finansal kararlarınızı iyileştirmenize yardımcı olabilirim. Size nasıl yardımcı olabilirim?' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        role: 'bot',
        text: 'Bu özellik yakında aktif olacak! Şu an demo modundayım. Gerçek AI entegrasyonu için API anahtarı gereklidir. 🚀',
      }]);
    }, 800);
  };

  return (
    <div className="animate-fade-in-up flex flex-col h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">AI Finans Koçu 🤖</h1>
        <p className="text-surface-700 dark:text-surface-200 mt-1">Yapay zeka destekli kişisel finans danışmanınız</p>
      </div>
      <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'bot' ? 'bg-primary-500/10 text-primary-500' : 'bg-accent-500/10 text-accent-500'}`}>
              {msg.role === 'bot' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'bot' ? 'glass-card text-surface-900 dark:text-white' : 'bg-primary-500 text-white'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Mesajınızı yazın..."
          className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-700 dark:placeholder-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
        />
        <button onClick={handleSend} className="px-5 py-3 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/25 cursor-pointer">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
