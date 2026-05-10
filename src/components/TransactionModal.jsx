import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Maximize2, X, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getTransactions, getGoals, getBudgetLimits } from '../utils/storage';
import { aySkoru } from '../utils/healthScore';
import { kisilikTipiBelirle } from '../utils/spendingPersonality';
import { API_URL, apiUrl } from '../utils/api';

const getInitialMessages = () => {
  const userName = localStorage.getItem('butceai_user_name') || '';
  const greeting = userName ? `Merhaba ${userName}! 👋` : 'Merhaba! 👋';
  return [
    { role: 'bot', content: `${greeting} Ben BütçeAI, kişisel finans koçun. Finansal verilerini analiz ederek sana özel tavsiyeler verebilirim. Birlikte bütçeni yönetelim, bana ne sormak istersin?` },
    { role: 'bot', content: 'İşte harcamalarının genel bir özeti:\n\nCHART_DATA:{"type":"pie","title":"Kategori Dağılımı","data":[{"label":"Market","value":4500},{"label":"Yemek","value":2100},{"label":"Ulaşım","value":1200}]}' },
    {
      role: 'bot', actionable: {
        type: 'cancel_subscription',
        title: 'Kullanılmayan Abonelik Tespit Edildi',
        desc: "Aboneliklerinde Exxen'i 3 aydır hiç kullanmıyorsun. İptal edelim mi?",
        btnText: 'Tek Tıkla İptal Et',
        payload: 'Exxen'
      }
    },
    {
      role: 'bot', actionable: {
        type: 'transfer_goal',
        title: 'Tasarruf Fırsatı',
        desc: "Bu ay hedeflenenden 500₺ fazla paran arttı. Bunu 'Tatil Fonu' hedefine aktarayım mı?",
        btnText: 'Hemen Aktar',
        payload: { goal: 'Tatil Fonu', amount: 500 }
      }
    }
  ];
};

const QUICK_QUESTIONS = [
  "Bu ayki genel durumum nasıl?",
  "Hangi aboneliği kessem?",
  "6 aylık birikim planı yap",
  "En büyük 3 tasarruf fırsatım neler?",
  "Geçen aya kıyasla nasılım?",
  "Bu haftanın özeti"
];

// ─── Yardımcı: Kullanıcı bağlamını topla ────────────────────────
function getUserContext() {
  try {
    const txs = getTransactions();
    const goals = getGoals();
    const limits = getBudgetLimits();
    const { toplam: totalScore } = aySkoru(txs, [], 2025, 5, limits);
    const { ad: personalityTitle } = kisilikTipiBelirle(txs);

    // Sadece bu ayki harcamaları topla (basitçe son 30 gün diyebiliriz)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTxs = txs.filter(t => new Date(t.tarih) >= thirtyDaysAgo);

    const aylikOzet = recentTxs.reduce((acc, tx) => {
      const isGider = tx.tur === 'gider' || (!tx.tur && Number(tx.tutar) < 0);
      if (isGider) {
        acc[tx.kategori] = (acc[tx.kategori] || 0) + Math.abs(Number(tx.tutar));
      }
      return acc;
    }, {});

    return {
      aylikOzet,
      limitler: limits,
      hedefler: goals.map(g => ({ ad: g.name, hedef: g.targetAmount, mevcut: g.currentAmount })),
      skor: totalScore,
      kisilik: personalityTitle
    };
  } catch (e) {
    console.error('Kullanıcı bağlamı alınamadı:', e);
    return {};
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState(getInitialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalChart, setModalChart] = useState(null); // { type, title, data }
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleAction = (action) => {
    setMessages(prev => [...prev, { role: 'user', content: action.btnText }]);
    setIsLoading(true);

    setTimeout(() => {
      let botResponse = '';
      if (action.type === 'cancel_subscription') {
        botResponse = `✅ **${action.payload}** aboneliğin başarıyla iptal edildi! (Simülasyon)\n\nArtık aylık bütçende ekstra yerin var. Bu tutarı birikim hedefine aktarabiliriz.`;
      } else if (action.type === 'transfer_goal') {
        botResponse = `✅ **${action.payload.amount}₺** başarıyla '${action.payload.goal}' hedefine aktarıldı! (Simülasyon)\n\nHedefine bir adım daha yaklaştın. Harika gidiyorsun! 🎉`;
      }
      setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSend = async (text = input) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const userContext = getUserContext();

      const response = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          userContext
        }),
      });

      if (!response.ok) throw new Error('API yanıt vermedi.');

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: `Üzgünüm, şu an bağlantı kuramıyorum. Backend servisinin (${API_URL}) çalıştığından emin misin?`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto w-full animate-fade-in-up">

      {/* ── ÜST BAŞLIK ── */}
      <div className="page-hero p-4 md:p-5 flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary-600 dark:text-primary-300">AI cockpit</p>
          <h1 className="text-xl md:text-2xl font-black text-surface-950 dark:text-white flex items-center gap-2">
            AI Finansal Koçun
            <Sparkles className="w-5 h-5 text-warn-500" />
          </h1>
          <p className="text-sm text-surface-700 dark:text-surface-200">Kişiselleştirilmiş içgörüler ve tavsiyeler</p>
        </div>
      </div>

      {/* ── MESAJLAR ALANI ── */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-6 pr-2 scrollbar-thin scrollbar-thumb-surface-200 dark:scrollbar-thumb-surface-700">
        {messages.map((msg, i) => {
          // Parse chart data if exists
          let text = msg.content;
          let chartData = null;

          if (msg.role === 'bot' && typeof text === 'string') {
            const match = text.match(/CHART_DATA:(\{.*\})/);
            if (match) {
              try {
                chartData = JSON.parse(match[1]);
                text = text.replace(match[0], '').trim();
              } catch (e) {
                console.error("Chart parse error:", e);
              }
            }
          }

          return (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'bot'
                  ? 'bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-primary-500/20'
                  : 'bg-surface-200 dark:bg-surface-700'
                }`}>
                {msg.role === 'bot'
                  ? <Bot className="w-5 h-5 text-primary-500" />
                  : <User className="w-5 h-5 text-surface-700 dark:text-surface-200" />}
              </div>

              {/* Balon */}
              <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'bot'
                  ? 'bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white rounded-tl-sm'
                  : 'bg-primary-500 text-white rounded-tr-sm shadow-primary-500/20'
                }`}>
                {msg.role === 'bot' ? (
                  msg.actionable ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="font-bold text-surface-900 dark:text-white">{msg.actionable.title}</span>
                      </div>
                      <p className="text-sm text-surface-700 dark:text-surface-200 mb-3">{msg.actionable.desc}</p>
                      <button
                        onClick={() => handleAction(msg.actionable)}
                        className="w-full py-2.5 rounded-xl bg-surface-900 dark:bg-white text-white dark:text-surface-900 text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                      >
                        {msg.actionable.btnText}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 w-full">
                      <div className="prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0 max-w-none">
                        <ReactMarkdown>{text}</ReactMarkdown>
                      </div>
                      {chartData && (
                        <div className="relative w-full rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 p-3 mt-2">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-surface-900 dark:text-white">{chartData.title || 'Grafik'}</h4>
                            <button
                              onClick={() => setModalChart(chartData)}
                              className="p-1 rounded-md hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors text-surface-500"
                              title="Büyüt"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="h-[200px] w-full mt-2">
                            <ChatChart chartData={chartData} />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Yazıyor Animasyonu */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-primary-500/20 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-primary-500" />
            </div>
            <div className="px-4 py-4 rounded-2xl bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-700 rounded-tl-sm shadow-sm flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary-500/50 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary-500/50 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary-500/50 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── ALT KONTROLLER ── */}
      <div className="mt-4 flex flex-col gap-3">
        {/* Hazır Sorular (Yatay Scroll) */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none snap-x">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="snap-start shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium 
                bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-200
                hover:bg-primary-500/10 hover:text-primary-500 dark:hover:bg-primary-500/15
                border border-surface-200/50 dark:border-surface-700/50
                transition-colors disabled:opacity-50 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Alanı */}
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Mesajınızı yazın... (Göndermek için Enter)"
            className="w-full px-4 py-3.5 pr-14 rounded-2xl bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none shadow-sm disabled:opacity-50"
            rows="2"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="absolute right-2.5 bottom-2.5 p-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 disabled:bg-surface-200 dark:disabled:bg-surface-700 disabled:text-surface-400 transition-all shadow-md cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── CHART MODAL ── */}
      {modalChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setModalChart(null)}>
          <div className="w-full max-w-3xl bg-white dark:bg-surface-850 rounded-2xl shadow-2xl p-6 border border-surface-200 dark:border-surface-700 relative">
            <button
              onClick={() => setModalChart(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-6 pr-10">{modalChart.title || 'Grafik Detayı'}</h3>
            <div className="w-full h-[400px]">
              <ChatChart chartData={modalChart} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Yardımcı Grafik Bileşeni ─────────────────────────────────
const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#06b6d4'];

function ChatChart({ chartData }) {
  if (!chartData || !chartData.data || chartData.data.length === 0) {
    return <div className="text-sm text-surface-500">Grafik verisi bulunamadı.</div>;
  }

  const { type, data } = chartData;

  // Pie chart expects data to have 'name' instead of 'label' for Recharts tooltips
  const pieData = type === 'pie' ? data.map(d => ({ name: d.label, value: d.value })) : data;

  switch (type) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.2} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(val) => `₺${val}`} />
            <RechartsTooltip
              cursor={{ fill: 'rgba(99,102,241,0.05)' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              formatter={(value) => [`₺${value}`, 'Tutar']}
            />
            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      );
    case 'line':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.2} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(val) => `₺${val}`} />
            <RechartsTooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              formatter={(value) => [`₺${value}`, 'Tutar']}
            />
            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="80%"
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              formatter={(value) => [`₺${value}`, 'Tutar']}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      );
    default:
      return <div className="text-sm text-surface-500">Desteklenmeyen grafik tipi: {type}</div>;
  }
}