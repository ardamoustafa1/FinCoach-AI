import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Bot, User, Sparkles, Maximize2, X, Zap, Share2, Loader2, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getTransactions, getGoals, getBudgetLimits } from '../utils/storage';
import { aySkoru } from '../utils/healthScore';
import { kisilikTipiBelirle } from '../utils/spendingPersonality';
import { API_URL, authFetch } from '../utils/api';
import { useToast } from '../hooks/useToast';

/* ─── Palette ─── */
const P = {
  purple: '#7C3AED',
  purpleLight: '#A78BFA',
  purpleDim: 'rgba(124,58,237,0.15)',
  green: '#10B981',
  red: '#EF4444',
  amber: '#F59E0B',
  bg0: 'var(--bg-main)',
  bg1: 'var(--bg-sidebar)',
  bg2: 'var(--bg-surface)',
  bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)',
  borderHover: 'var(--border-hover)',
  text1: 'var(--text-primary)',
  text2: 'var(--text-secondary)',
  text3: 'var(--text-muted)',
};

const PIE_COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#06B6D4'];

const getInitialMessages = () => {
  const userName = localStorage.getItem('fincoach_user_name') || '';
  const greeting = userName ? `Merhaba ${userName}! 👋` : 'Merhaba! 👋';
  return [
    { role: 'bot', content: `${greeting} Ben FinCoach AI, kişisel finans koçun. Finansal verilerini analiz ederek sana özel tavsiyeler verebilirim. Birlikte bütçeni yönetelim, bana ne sormak istersin?` },
    { role: 'bot', content: 'İşte harcamalarının genel bir özeti:\n\nCHART_DATA:{"type":"pie","title":"Kategori Dağılımı","data":[{"label":"Market","value":4500},{"label":"Yemek","value":2100},{"label":"Ulaşım","value":1200}]}' }
  ];
};

const QUICK_QUESTIONS = [
  "Beni özetle! (Finansal Sarmal Kartımı Çıkar 🃏)",
  "Finansal İkizim kim? Başkalarına göre nasılım? 👥",
  "Netflix'i iptal et (Otonom Ajan) 🤖",
  "Şu ürünü alsam bütçemi sarsar mı? 🛍️ https://www.trendyol.com/apple/airpods-4-nesil",
  "Bu harcama alışkanlığıyla 5 yıl sonraki hayatım 🔮",
];

function getUserContext() {
  try {
    const txs = getTransactions();
    const goals = getGoals();
    const limits = getBudgetLimits();
    const { toplam: totalScore } = aySkoru(txs, [], 2025, 5, limits);
    const { ad: personalityTitle } = kisilikTipiBelirle(txs);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTxs = txs.filter(t => new Date(t.tarih) >= thirtyDaysAgo);
    const aylikOzet = recentTxs.reduce((acc, tx) => {
      const isGider = tx.tur === 'gider' || (!tx.tur && Number(tx.tutar) < 0);
      if (isGider) { acc[tx.kategori] = (acc[tx.kategori] || 0) + Math.abs(Number(tx.tutar)); }
      return acc;
    }, {});

    // Onboarding profili — hedef, gelir, banka
    let kullaniciBilgisi = {};
    try {
      const profil = JSON.parse(localStorage.getItem('fincoach_profile') || '{}');
      const goalLabels = { tasarruf: 'Tasarruf artırmak', takip: 'Harcamaları takip etmek', birikim: 'Birikim hedefi koymak' };
      kullaniciBilgisi = {
        hedefTipi: goalLabels[profil.goal] || profil.goal || 'Belirtilmedi',
        aylikGelir: profil.income ? `₺${Number(profil.income).toLocaleString('tr-TR')}` : 'Belirtilmedi',
        banka: profil.bank || 'Belirtilmedi',
        kullaniciAdi: localStorage.getItem('fincoach_user_name') || 'Kullanıcı',
      };
    } catch {
      kullaniciBilgisi = {};
    }

    return {
      aylikOzet, limitler: limits,
      hedefler: goals.map(g => ({ ad: g.name, hedef: g.targetAmount, mevcut: g.currentAmount })),
      skor: totalScore, kisilik: personalityTitle,
      roastMode: localStorage.getItem('fincoach_roast_mode') === 'true',
      kullaniciBilgisi,
    };
  } catch { return {}; }
}


export default function ChatPage() {
  const location = useLocation();
  const toast = useToast();
  const [messages, setMessages] = useState(getInitialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalChart, setModalChart] = useState(null);
  const messagesEndRef = useRef(null);

  const initialMsgHandled = useRef(false);

  const shareWrappedCard = async (wrappedData) => {
    const text = `Ben bir ${wrappedData.title}! En büyük günahım: ${wrappedData.worst_habit}. ${wrappedData.roast_text} #FinCoach AI`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'FinCoach AI Sarmalım', text });
        toast.success('Paylaşım hazırlandı.');
        return;
      }
      await navigator.clipboard.writeText(text);
      toast.success('Paylaşım metni kopyalandı.');
    } catch (error) {
      if (error?.name !== 'AbortError') toast.error('Paylaşım hazırlanamadı.');
    }
  };

  const handleSend = useCallback(async (text = input) => {
    if (!text.trim() || isLoading) return;
    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    try {
      const userContext = getUserContext();
      const response = await authFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: newMessages, userContext }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Sunucu hatası oluştu.');
      }
      
      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: error.message.includes('Hata:') || error.message.includes('⚠️') 
          ? error.message 
          : `Üzgünüm, şu an bağlantı kuramıyorum. Backend servisinin (${API_URL}) çalıştığından emin misin?\n\nDetay: ${error.message}`
      }]);
    } finally { setIsLoading(false); }
  }, [input, isLoading, messages]);

  useEffect(() => {
    if (location.state?.message && !initialMsgHandled.current) {
      initialMsgHandled.current = true;
      handleSend(location.state.message);
    }
  }, [location.state, handleSend]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      <style>{`
        @keyframes ping { 0% { transform: scale(1); opacity: 0.8; } 75%, 100% { transform: scale(2); opacity: 0; } }
        @keyframes bounce-dot { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.4); border-radius: 999px; }
        .quick-btn:hover { background: rgba(124,58,237,0.18) !important; border-color: rgba(124,58,237,0.4) !important; color: #a78bfa !important; }
        .send-btn:hover:not(:disabled) { opacity: 0.88; transform: scale(1.04); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .chat-input:focus { border-color: rgba(124,58,237,0.5) !important; background: rgba(124,58,237,0.06) !important; outline: none; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)', maxWidth: 900, margin: '0 auto', width: '100%' }}>

        {/* ── HEADER ── */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%)',
          border: `1px solid rgba(255,255,255,0.08)`,
          borderRadius: 24,
          padding: '24px 32px',
          marginBottom: 20,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(20px)'
        }}>
          {/* Top glowing line & Background glows */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(16,185,129,0.5), transparent)' }} />
          <div style={{ position: 'absolute', top: -50, right: 0, width: 200, height: 200, background: 'rgba(124,58,237,0.15)', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -50, left: 0, width: 200, height: 200, background: 'rgba(59,130,246,0.1)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 32px rgba(124,58,237,0.5)',
              flexShrink: 0, border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Bot size={28} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c4b5fd' }}>AI Cockpit</span>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: P.green, display: 'inline-block', animation: 'ping 1.5s ease-out infinite', opacity: 0.8, boxShadow: '0 0 10px #10b981' }} />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '-0.02em', margin: '0 0 2px' }}>
                AI Finansal Koçun
                <Sparkles size={20} color={P.amber} />
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>Sana özel analizler ve otonom görevler</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, padding: '10px 16px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
              <Zap size={16} color="#c4b5fd" />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.02em' }}>Gemini 1.5 Pro</span>
            </div>
          </div>
        </div>

        {/* ── MESSAGES ── */}
        <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 4 }}>
          {messages.map((msg, i) => {
            let text = msg.content;
            let chartData = null;
            let simulationData = null;
            let wrappedData = null;
            let agentData = null;
            if (msg.role === 'bot' && typeof text === 'string') {
              // Regex: Find tag and capture everything until the LAST closing brace
              const chartMatch = text.match(/CHART_DATA:(\{[\s\S]*\})/);
              if (chartMatch) {
                try {
                  // Greedily finding the JSON block
                  const jsonBlock = chartMatch[1];
                  chartData = JSON.parse(jsonBlock);
                  text = text.replace(/CHART_DATA:\{[\s\S]*\}/, '').trim();
                } catch (error) {
                  console.error("Chart parse error:", error);
                }
              }

              const simMatch = text.match(/SIMULATION:(\{[\s\S]*\})/);
              if (simMatch) {
                try {
                  simulationData = JSON.parse(simMatch[1]);
                  text = text.replace(/SIMULATION:\{[\s\S]*\}/, '').trim();
                } catch (error) {
                  console.error("Simulation parse error:", error);
                }
              }

              const wrappedMatch = text.match(/WRAPPED_CARD:(\{[\s\S]*\})/);
              if (wrappedMatch) {
                try {
                  wrappedData = JSON.parse(wrappedMatch[1]);
                  text = text.replace(/WRAPPED_CARD:\{[\s\S]*\}/, '').trim();
                } catch (error) {
                  console.error("Wrapped card parse error:", error);
                }
              }

              const agentMatch = text.match(/AGENT_ACTION:(\{[\s\S]*\})/);
              if (agentMatch) {
                try {
                  agentData = JSON.parse(agentMatch[1]);
                  text = text.replace(/AGENT_ACTION:\{[\s\S]*\}/, '').trim();
                } catch (error) {
                  console.error("Agent action parse error:", error);
                }
              }
            }
            const isBot = msg.role === 'bot';
            return (
              <div key={i} style={{ display: 'flex', gap: 12, flexDirection: isBot ? 'row' : 'row-reverse' }}>
                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: 14, flexShrink: 0,
                  background: isBot ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.15))' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isBot ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isBot ? '0 0 20px rgba(124,58,237,0.2)' : 'none',
                  marginTop: 4
                }}>
                  {isBot ? <Bot size={20} color="#c4b5fd" /> : <User size={20} color="var(--text-secondary)" />}
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: '78%',
                  padding: '16px 20px',
                  borderRadius: isBot ? '8px 24px 24px 24px' : '24px 8px 24px 24px',
                  background: isBot ? 'rgba(255,255,255,0.03)' : 'linear-gradient(135deg, #7c3aed, #ec4899)',
                  border: isBot ? `1px solid rgba(255,255,255,0.08)` : '1px solid rgba(255,255,255,0.15)',
                  color: isBot ? '#e2e8f0' : '#ffffff',
                  fontSize: 15,
                  lineHeight: 1.6,
                  backdropFilter: isBot ? 'blur(12px)' : 'none',
                  boxShadow: isBot ? '0 8px 32px rgba(0,0,0,0.2)' : '0 12px 32px rgba(124,58,237,0.4)',
                }}>
                  {isBot ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ color: P.text1 }}>
                        <ReactMarkdown>{text}</ReactMarkdown>
                      </div>
                      
                      {simulationData && (
                        <div style={{
                          marginTop: 12, padding: 20, borderRadius: 16,
                          background: simulationData.status === 'rich' ? 'linear-gradient(135deg, #10B98122, #05966944)' : 'linear-gradient(135deg, #EF444422, #B91C1C44)',
                          border: `1px solid ${simulationData.status === 'rich' ? P.green : P.red}50`,
                          display: 'flex', flexDirection: 'column', gap: 14,
                          boxShadow: `0 8px 32px ${simulationData.status === 'rich' ? P.green : P.red}20`,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontSize: 32 }}>{simulationData.status === 'rich' ? '🏡🚀' : '📦🛒'}</div>
                            <div>
                              <h4 style={{ fontSize: 15, fontWeight: 800, color: simulationData.status === 'rich' ? P.green : P.red, letterSpacing: '-0.01em', margin: 0 }}>
                                5 Yıl Sonraki Hayatın
                              </h4>
                              <p style={{ fontSize: 12, color: P.text2, margin: 0 }}>Yapay Zeka Projeksiyonu</p>
                            </div>
                          </div>
                          <p style={{ fontSize: 14, color: P.text1, lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                            "{simulationData.story}"
                          </p>
                        </div>
                      )}

                      {wrappedData && (
                        <div style={{
                          marginTop: 12, borderRadius: 24, padding: 1,
                          background: 'linear-gradient(135deg, #FF1493, #7C3AED, #3B82F6)',
                          boxShadow: '0 12px 40px rgba(124,58,237,0.4)',
                          maxWidth: 320, position: 'relative', overflow: 'hidden'
                        }}>
                          <div style={{
                            background: P.bg1, borderRadius: 23, padding: '32px 24px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                            position: 'relative', overflow: 'hidden'
                          }}>
                            {/* Texture & Glow */}
                            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.2) 0%, transparent 60%)' }} />
                            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 6, lineHeight: 1.2, zIndex: 1 }}>{wrappedData.title}</h2>
                            <p style={{ fontSize: 12, color: P.purpleLight, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24, zIndex: 1 }}>FinCoach AI 2026</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', zIndex: 1 }}>
                              <div style={{ background: P.bg2, padding: '16px', borderRadius: 16, border: `1px solid ${P.border}` }}>
                                <p style={{ fontSize: 11, color: P.text3, marginBottom: 4 }}>TOPLAM HARCAMA</p>
                                <p style={{ fontSize: 22, fontWeight: 800, color: P.text1 }}>{wrappedData.total_spent}</p>
                              </div>
                              <div style={{ background: P.bg2, padding: '16px', borderRadius: 16, border: `1px solid ${P.border}` }}>
                                <p style={{ fontSize: 11, color: P.text3, marginBottom: 4 }}>EN BÜYÜK GÜNAHIN</p>
                                <p style={{ fontSize: 18, fontWeight: 800, color: P.red }}>{wrappedData.worst_habit}</p>
                              </div>
                            </div>

                            <p style={{ fontSize: 15, color: '#fff', fontStyle: 'italic', marginTop: 24, marginBottom: 28, lineHeight: 1.6, zIndex: 1 }}>"{wrappedData.roast_text}"</p>
                            
                            <button 
                              onClick={() => shareWrappedCard(wrappedData)}
                              style={{
                                width: '100%', padding: '14px 0', borderRadius: 14,
                                background: 'linear-gradient(135deg, #FF1493, #7C3AED)',
                                color: '#fff', fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 1,
                                boxShadow: '0 4px 16px rgba(124,58,237,0.3)'
                              }}
                            >
                              <Share2 size={16} /> Paylaş
                            </button>
                          </div>
                        </div>
                      )}

                      {agentData && (
                        <AgentSimulation provider={agentData.provider} />
                      )}

                      {chartData && (
                        <div style={{ borderRadius: 20, background: 'rgba(0,0,0,0.25)', border: `1px solid rgba(255,255,255,0.06)`, padding: 20, marginTop: 8, boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '0.02em', margin: 0 }}>{chartData.title || 'Grafik Analizi'}</h4>
                            <button onClick={() => setModalChart(chartData)} style={{
                              width: 32, height: 32, borderRadius: 10,
                              background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', color: '#c4b5fd', transition: 'all 0.2s'
                            }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                              <Maximize2 size={15} />
                            </button>
                          </div>
                          <div style={{ height: 220 }}>
                            <ChatChart chartData={chartData} />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading dots */}
          {isLoading && (
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.2))',
                border: '1px solid rgba(124,58,237,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Bot size={18} color={P.purpleLight} />
              </div>
              <div style={{
                padding: '14px 18px', borderRadius: '4px 18px 18px 18px',
                background: P.bg2, border: `1px solid ${P.border}`,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {[0, 150, 300].map((delay, di) => (
                  <div key={di} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: P.purpleLight,
                    animation: `bounce-dot 1.2s ease-in-out ${delay}ms infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── CONTROLS ── */}
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Quick Questions */}
          <div style={{ display: 'flex', overflowX: 'auto', gap: 10, paddingBottom: 8 }}>
            {QUICK_QUESTIONS.map((q, idx) => (
              <button key={idx} onClick={() => handleSend(q)} disabled={isLoading} className="quick-btn" style={{
                flexShrink: 0,
                padding: '10px 18px', borderRadius: 999,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid rgba(255,255,255,0.08)`,
                color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', whiteSpace: 'nowrap',
                opacity: isLoading ? 0.5 : 1,
                backdropFilter: 'blur(10px)',
              }}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ position: 'relative' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Mesajınızı yazın... (Göndermek için Enter)"
              rows={2}
              className="chat-input"
              style={{
                width: '100%', padding: '18px 60px 18px 24px',
                borderRadius: 24,
                background: 'rgba(0,0,0,0.3)', border: `1px solid rgba(255,255,255,0.1)`,
                color: '#fff', fontSize: 15,
                resize: 'none', fontFamily: 'inherit',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isLoading ? 0.6 : 1,
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(20px)',
                lineHeight: 1.5
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="send-btn"
              style={{
                position: 'absolute', right: 12, bottom: 12,
                width: 44, height: 44, borderRadius: 16,
                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(124,58,237,0.5)',
              }}
            >
              <Send size={18} color="#fff" style={{ transform: 'translateX(-1px)' }} />
            </button>
          </div>
        </div>

        {/* ── CHART MODAL ── */}
        {modalChart && (
          <div onClick={(e) => e.target === e.currentTarget && setModalChart(null)} style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
          }}>
            <div style={{
              width: '100%', maxWidth: 720,
              background: 'linear-gradient(160deg, #1a1030 0%, #0e0c1a 100%)',
              border: '1px solid rgba(124,58,237,0.35)',
              borderRadius: 24, padding: 32,
              boxShadow: '0 40px 120px rgba(0,0,0,0.8)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, letterSpacing: '-0.01em' }}>{modalChart.title || 'Grafik Detayı'}</h3>
                <button onClick={() => setModalChart(null)} style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: P.text2,
                }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ height: 400 }}>
                <ChatChart chartData={modalChart} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Chart Component ─── */
function ChatChart({ chartData }) {
  if (!chartData || !chartData.data || chartData.data.length === 0) {
    return <div style={{ textAlign: 'center', color: '#64748b', fontSize: 13, paddingTop: 40 }}>Grafik verisi bulunamadı.</div>;
  }
  const { type, data } = chartData;
  const pieData = type === 'pie' ? data.map(d => ({ name: d.label, value: d.value })) : data;
  const tickStyle = { fill: '#64748B', fontSize: 11 };

  switch (type) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="label" tick={tickStyle} tickLine={false} axisLine={false} />
            <YAxis tick={tickStyle} tickLine={false} axisLine={false} tickFormatter={v => `₺${v}`} />
            <RechartsTooltip contentStyle={{ background: '#1C2038', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F1F5F9' }} formatter={v => [`₺${v}`, 'Tutar']} />
            <Bar dataKey="value" fill="#7C3AED" radius={[6, 6, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      );
    case 'line':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="label" tick={tickStyle} tickLine={false} axisLine={false} />
            <YAxis tick={tickStyle} tickLine={false} axisLine={false} tickFormatter={v => `₺${v}`} />
            <RechartsTooltip contentStyle={{ background: '#1C2038', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F1F5F9' }} formatter={v => [`₺${v}`, 'Tutar']} />
            <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius="45%" outerRadius="75%" paddingAngle={4} dataKey="value" stroke="none">
              {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <RechartsTooltip contentStyle={{ background: '#1C2038', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F1F5F9' }} formatter={v => [`₺${v}`, 'Tutar']} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
          </PieChart>
        </ResponsiveContainer>
      );
    default:
      return <div style={{ textAlign: 'center', color: '#64748b', fontSize: 13 }}>Desteklenmeyen grafik tipi: {type}</div>;
  }
}

/* ─── Agent Simulation Component ─── */
function AgentSimulation({ provider }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let t1 = setTimeout(() => setStep(1), 1500); 
    let t2 = setTimeout(() => setStep(2), 3500); 
    let t3 = setTimeout(() => setStep(3), 5500); 
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{ marginTop: 12, background: '#0D0F1E', borderRadius: 16, border: '1px solid rgba(124,58,237,0.3)', padding: 16, overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Bot size={18} color="#A78BFA" />
        <span style={{ fontSize: 13, fontWeight: 800, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Otonom Ajan Devrede</span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
           {step >= 1 ? <CheckCircle2 size={18} color="#10B981" /> : <Loader2 size={18} color="#64748B" style={{ animation: 'spin 1s linear infinite' }} />}
           <span style={{ fontSize: 13, color: step >= 1 ? '#F1F5F9' : '#64748B', fontWeight: 600 }}>Headless tarayıcı başlatıldı ({provider})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
           {step >= 2 ? <CheckCircle2 size={18} color="#10B981" /> : step === 1 ? <Loader2 size={18} color="#3B82F6" style={{ animation: 'spin 1s linear infinite' }} /> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />}
           <span style={{ fontSize: 13, color: step >= 2 ? '#F1F5F9' : step === 1 ? '#3B82F6' : '#64748B', fontWeight: 600 }}>Abonelik iptal formu otonom dolduruluyor...</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
           {step >= 3 ? <CheckCircle2 size={18} color="#10B981" /> : step === 2 ? <Loader2 size={18} color="#F59E0B" style={{ animation: 'spin 1s linear infinite' }} /> : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />}
           <span style={{ fontSize: 13, color: step >= 3 ? '#10B981' : step === 2 ? '#F59E0B' : '#64748B', fontWeight: step >= 3 ? 800 : 600 }}>{step >= 3 ? 'Abonelik başarıyla iptal edildi!' : 'Onay bekleniyor...'}</span>
        </div>
      </div>
      {step >= 3 && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at center, rgba(16,185,129,0.15) 0%, transparent 70%)', animation: 'ping 1.5s ease-out' }} />}
    </div>
  );
}
