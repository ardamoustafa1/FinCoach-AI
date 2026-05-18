import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Bot, User, Sparkles, Zap, Share2, Maximize2, X, Search, Loader2, Database, CheckCircle2, HeartPulse, BarChart2 } from 'lucide-react';
// sanitize() HTML encoding yapar; chat input için trimInput() kullanılıyor (bkz. KRİTİK-05)

import ReactMarkdown from 'react-markdown';
import useStore from '../store/useStore';
import { aySkoru } from '../utils/healthScore';
import { kisilikTipiBelirle } from '../utils/spendingPersonality';
import { computeEmotionMetrics, buildCheckinPrompt, buildWeeklyReportPrompt, getRiskLevel } from '../utils/emotionCoach';
import { API_URL, authFetch } from '../utils/api';
import { useToast } from '../hooks/useToast';
import { calculateCosineSimilarity } from '../utils/semanticSearch';
import ChatChart from '../components/chat/ChatChart';
import AgentSimulation from '../components/chat/AgentSimulation';
import EmotionCheckinModal from '../components/chat/EmotionCheckinModal';

import { P } from '../styles/palette';

/**
 * Chat için güvenli giriş temizleme:
 * - HTML entity encoding YAPMAZ (sanitize'dan farklı) — çünkü Gemini promptuna
 *   &amp; gibi encoded string'ler giderse halusinasyon riski artar.
 * - React JSX render'i zaten XSS'e karşı korur (dangerouslySetInnerHTML kullanılmıyor).
 */
function trimInput(text) {
  if (!text || typeof text !== 'string') return '';
  return text.trim().replace(/\s+/g, ' ');
}


const getInitialMessages = () => {
  const userName = useStore.getState().userProfile?.name || '';
  const greeting = userName ? `Merhaba ${userName}! 👋` : 'Merhaba! 👋';
  return [
    { role: 'bot', content: `${greeting} Ben FinCoach AI, kişisel finans koçun. Finansal verilerini analiz ederek sana özel tavsiyeler verebilirim. Birlikte bütçeni yönetelim, bana ne sormak istersin?` },
    { role: 'bot', content: 'İşte harcamalarının genel bir özeti:\n\nCHART_DATA:{"type":"pie","title":"Kategori Dağılımı","data":[{"label":"Market","value":4500},{"label":"Yemek","value":2100},{"label":"Ulaşım","value":1200}]}' }
  ];
};

const QUICK_QUESTIONS = [
  "Beni özetle! (Finansal Sarmal Kartımı Çıkar 🃏)",
  "Finansal İkizim kim? Başkalarına göre nasılım? 👥",
  "Netflix iptali için demo ajan akışını göster 🤖",
  "Şu ürünü alsam bütçemi sarsar mı? 🛍️ https://www.trendyol.com/apple/airpods-4-nesil",
  "Bu harcama alışkanlığıyla 5 yıl sonraki hayatım 🔮",
];



function getUserContext() {
  try {
    const txs = useStore.getState().transactions;
    const goals = useStore.getState().goals;
    const limits = useStore.getState().budgetLimits;
    const now = new Date();
    const { toplam: totalScore } = aySkoru(txs, [], now.getFullYear(), now.getMonth() + 1, limits);
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
      const profil = useStore.getState().behavioralProfile;
      const goalLabels = { tasarruf: 'Tasarruf artırmak', takip: 'Harcamaları takip etmek', birikim: 'Birikim hedefi koymak' };
      kullaniciBilgisi = {
        hedefTipi: goalLabels[profil.goal] || profil.goal || 'Belirtilmedi',
        aylikGelir: profil.income ? `₺${Number(profil.income).toLocaleString('tr-TR')}` : 'Belirtilmedi',
        banka: profil.bank || 'Belirtilmedi',
        kullaniciAdi: useStore.getState().userProfile.name || 'Kullanıcı',
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

function extractTaggedPayload(text, tag) {
  const marker = `${tag}:`;
  const markerIndex = text.indexOf(marker);
  if (markerIndex === -1) return { text, payload: null };

  const start = text.indexOf('{', markerIndex + marker.length);
  if (start === -1) return { text, payload: null };

  const stack = ['}'];
  let inString = false;
  let escaped = false;
  for (let i = start + 1; i < text.length; i += 1) {
    const char = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === '{') stack.push('}');
    if (char === '[') stack.push(']');
    if (char === stack[stack.length - 1]) stack.pop();
    if (!stack.length) {
      try {
        return {
          text: `${text.slice(0, markerIndex)}${text.slice(i + 1)}`.trim(),
          payload: JSON.parse(text.slice(start, i + 1)),
        };
      } catch {
        return { text: text.slice(0, markerIndex).trim(), payload: null };
      }
    }
  }

  return { text, payload: null };
}

export default function ChatPage() {
  const location = useLocation();
  const toast = useToast();
  const [messages, setMessages] = useState(getInitialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ragStep, setRagStep] = useState(0);
  const [ragMatches, setRagMatches] = useState([]);
  const [modalChart, setModalChart] = useState(null);
  const [showEmotionCheckin, setShowEmotionCheckin] = useState(false);
  const messagesEndRef = useRef(null);
  const emotionLogs = useStore(state => state.emotionLogs) || [];
  const addEmotionLog = useStore(state => state.addEmotionLog);

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

  const handleEmotionCheckin = useCallback((log) => {
    setShowEmotionCheckin(false);
    const saved = addEmotionLog(log);
    const last30 = emotionLogs.slice(0, 30);
    const metrics = computeEmotionMetrics(last30);
    const prompt = buildCheckinPrompt(saved, metrics, last30);
    const riskLevel = getRiskLevel(log.arousal, log.valence);
    const riskTag = riskLevel === 'high' ? '⚠️ Yüksek Risk' : riskLevel === 'medium' ? '⚡ Orta Risk' : '✅ Düşük Risk';
    const userMsg = `[Duygu Check-in — ${riskTag}]\nDuygu: ${log.valence} | Arousal: ${log.arousal}/10 | ${log.amount}₺ ${log.category}`;
    // Fonksiyonel güncelleme: messages bağımlılığı kaldırıldı (UYARI-05)
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);
    setRagStep(0);
    authFetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], userContext: {} }),
    }).then(async r => {
      if (!r.ok) throw new Error((await r.json().catch(()=>({}))).error || 'Sunucu hatası');
      return r.json();
    }).then(data => {
      setMessages(prev => [...prev, { role: 'bot', content: data.response ?? 'Şu an yanıt alınamadı.' }]);
    }).catch(() => {
      setMessages(prev => [...prev, { role: 'bot', content: 'Duygu koçuna bağlanılamadı.' }]);
    }).finally(() => { setIsLoading(false); setRagStep(0); });
  }, [emotionLogs, addEmotionLog]);


  const handleWeeklyReport = useCallback(() => {
    const last7 = emotionLogs.slice(0, 20).filter(l => {
      const d = new Date(l.createdAt);
      const week = new Date(); week.setDate(week.getDate() - 7);
      return d >= week;
    });
    if (last7.length < 2) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Haftalık rapor için en az 2 duygu check-in\'i gerekiyor. Önce birkaç check-in yap.' }]);
      return;
    }
    const metrics = computeEmotionMetrics(last7);
    const prompt = buildWeeklyReportPrompt(last7, metrics);
    setMessages(prev => [...prev, { role: 'user', content: '[Haftalık Duygu Raporu istendi]' }]);
    setIsLoading(true);
    authFetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], userContext: {} }),
    }).then(async r => {
      if (!r.ok) throw new Error((await r.json().catch(()=>({}))).error || 'Sunucu hatası');
      return r.json();
    }).then(data => {
      setMessages(prev => [...prev, { role: 'bot', content: data.response ?? 'Rapor alınamadı.' }]);
    }).catch(() => {
      setMessages(prev => [...prev, { role: 'bot', content: 'Rapor oluşturulamadı.' }]);
    }).finally(() => { setIsLoading(false); });
  }, [emotionLogs]);

  const handleSend = useCallback(async (text = input) => {
    const cleanInput = trimInput(text); // HTML entity encode etmeden temizle (KRİTİK-05)
    if (!cleanInput || isLoading) return;

    // Real client-side Cosine Similarity semantic search (limited to 200 recent txs for performance)
    const txs = useStore.getState().transactions || [];
    const recentTxs = txs.slice(-200);
    const semanticMatches = calculateCosineSimilarity(cleanInput, recentTxs);
    setRagMatches(semanticMatches);

    const userMsg = { role: 'user', content: cleanInput };
    // Fonksiyonel güncelleme: messages bağımlılığı kaldırıldı (UYARI-05)
    let snapshotMessages;
    setMessages(prev => {
      snapshotMessages = [...prev, userMsg];
      return snapshotMessages;
    });
    setInput('');
    setIsLoading(true);
    setRagStep(0);
    try {
      const userContext = getUserContext();
      userContext.ragContext = semanticMatches.map(m =>
        `[Cosine Similarity: %${Math.round(m.similarity * 100)}] Tarih: ${m.tx.tarih}, Mağaza: ${m.tx.magaza || 'Belirtilmedi'}, Kategori: ${m.tx.kategori}, Tutar: ${Math.abs(m.tx.tutar)} TL (${m.tx.tur === 'gelir' ? 'Gelir' : 'Gider'}) - Açıklama: ${m.tx.aciklama || ''}`
      ).join('\n');

      const response = await authFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: snapshotMessages || [userMsg], userContext }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Sunucu hatası oluştu.');

      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: error.message.includes('Hata:') || error.message.includes('⚠️')
          ? error.message
          : `Üzgünüm, şu an bağlantı kuramıyorum. Backend servisinin (${API_URL}) çalıştığından emin misin?\n\nDetay: ${error.message}`
      }]);
    } finally { setIsLoading(false); setRagStep(0); }
  }, [input, isLoading]);


  useEffect(() => {
    let t1, t2, t3;
    if (isLoading) {
      t1 = setTimeout(() => setRagStep(1), 600);
      t2 = setTimeout(() => setRagStep(2), 1500);
      t3 = setTimeout(() => setRagStep(3), 2500);
    }
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isLoading]);

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
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>Sana özel analizler ve güvenli demo görev akışları</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Duygu Koçu Butonları */}
              <button
                onClick={() => setShowEmotionCheckin(true)}
                title="Duygu Check-in"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                  borderRadius: 12, border: '1px solid rgba(236,72,153,0.35)',
                  background: 'rgba(236,72,153,0.08)', color: '#f9a8d4',
                  fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(236,72,153,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(236,72,153,0.08)'; }}
              >
                <HeartPulse size={14} /> Check-in
              </button>
              <button
                onClick={handleWeeklyReport}
                title="Haftalık Duygu Raporu"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                  borderRadius: 12, border: '1px solid rgba(124,58,237,0.35)',
                  background: 'rgba(124,58,237,0.08)', color: '#c4b5fd',
                  fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; }}
              >
                <BarChart2 size={14} /> Haftalık Rapor
              </button>
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, padding: '10px 16px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} color="#c4b5fd" />
                <span style={{ fontSize: 13, fontWeight: 800, color: '#e2e8f0', letterSpacing: '0.02em' }}>Gemini 2.5 Flash</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── EMOTION CHECKIN MODAL ── */}
        {showEmotionCheckin && (
          <EmotionCheckinModal
            onClose={() => setShowEmotionCheckin(false)}
            onSubmit={handleEmotionCheckin}
          />
        )}

        {/* ── MESSAGES ── */}
        <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 4 }}>
          {messages.map((msg, i) => {
            let text = msg.content;
            let chartData = null;
            let simulationData = null;
            let wrappedData = null;
            let agentData = null;
            if (msg.role === 'bot' && typeof text === 'string') {
              let extracted = extractTaggedPayload(text, 'CHART_DATA');
              text = extracted.text;
              chartData = extracted.payload;

              extracted = extractTaggedPayload(text, 'SIMULATION');
              text = extracted.text;
              simulationData = extracted.payload;

              extracted = extractTaggedPayload(text, 'WRAPPED_CARD');
              text = extracted.text;
              wrappedData = extracted.payload;

              extracted = extractTaggedPayload(text, 'AGENT_ACTION');
              text = extracted.text;
              agentData = extracted.payload;
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

                      {/* Subtle Legal Guardrail Disclaimer */}
                      <div style={{
                        fontSize: 10,
                        color: 'rgba(255, 255, 255, 0.28)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        paddingTop: 8,
                        marginTop: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        <span>⚠️ <em>Eğitsel Amaçlı Analiz: Yatırım veya finansal danışmanlık kapsamında değildir.</em></span>
                      </div>
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
                width: 40, height: 40, borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.2))',
                border: '1px solid rgba(124,58,237,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Bot size={20} color={P.purpleLight} />
              </div>
              <div style={{
                padding: '16px 20px', borderRadius: '8px 24px 24px 24px',
                background: 'rgba(0,0,0,0.4)', border: `1px solid rgba(124,58,237,0.25)`,
                minWidth: 320, display: 'flex', flexDirection: 'column', gap: 12,
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                   <Database size={14} color={P.green} />
                   <span style={{ fontSize: 11, fontWeight: 900, color: P.green, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Yerel RAG Demo Araması</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {ragStep >= 1 ? <CheckCircle2 size={14} color={P.green} /> : <Loader2 size={14} color={P.purple} style={{ animation: 'spin 1s linear infinite' }} />}
                    <span style={{ fontSize: 13, color: ragStep >= 1 ? '#fff' : P.text2, fontWeight: ragStep >= 1 ? 600 : 400 }}>
                      Embedding çıkarılıyor (Cosine Similarity)...
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 24, borderLeft: `1px dashed ${P.border}`, margin: '2px 0 2px 6px', opacity: ragStep >= 2 ? 1 : 0.4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {ragStep >= 2 ? <CheckCircle2 size={14} color={P.green} /> : ragStep === 1 ? <Search size={14} color={P.blue} style={{ animation: 'spin 1s linear infinite' }} /> : <div style={{ width: 14 }} />}
                      <span style={{ fontSize: 13, color: ragStep >= 2 ? '#fff' : ragStep === 1 ? P.blue : P.text3, fontWeight: ragStep >= 2 ? 600 : 400 }}>
                        Yerel cosine similarity eşleşmeleri:
                      </span>
                    </div>
                    {ragStep >= 2 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                        {ragMatches.length === 0 ? (
                          <div style={{ fontSize: 12, color: P.text3, fontStyle: 'italic' }}>Eşleşen semantik işlem bulunamadı.</div>
                        ) : (
                          ragMatches.map((m, idx) => (
                            <div key={idx} style={{ fontSize: 12, color: P.green, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 800, background: `${P.green}20`, padding: '2px 6px', borderRadius: 4 }}>%{Math.round(m.similarity * 100)} Eşleşme</span>
                              <span style={{ color: '#e2e8f0' }}>{m.tx.magaza || m.tx.aciklama || 'İşlem'}</span>
                              <span style={{ color: P.text3 }}>({m.tx.tutar} TL)</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: ragStep >= 3 ? 1 : 0.4 }}>
                    {ragStep >= 3 ? <Loader2 size={14} color={P.amber} style={{ animation: 'spin 1s linear infinite' }} /> : <div style={{ width: 14 }} />}
                    <span style={{ fontSize: 13, color: ragStep >= 3 ? P.amber : P.text3, fontWeight: ragStep >= 3 ? 600 : 400 }}>
                      RAG bağlamı Gemini 2.5 promptuna eklendi.
                    </span>
                  </div>
                </div>
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
