import { useState } from 'react';
import { Lock, ShieldCheck, Activity, ShieldAlert, Cpu, CheckCircle2, Mic, Code, Send, Check } from 'lucide-react';
import PageHeader from '../components/PageHeader';

import { P } from '../styles/palette';
const MOCK_TRANSCRIPT = "Can'a akşam yemeği için 1000 TL gönder, ama sadece yarın akşama kadar bana o projeyi teslim ederse parayı serbest bırak.";

export default function EscrowPage() {
  const [activeTab, setActiveTab] = useState('voice'); // 'voice' or 'emergency'
  
  // Emergency State
  const [unlockStatus, setUnlockStatus] = useState('idle');

  const handleUnlock = () => {
    setUnlockStatus('requesting');
    setTimeout(() => {
      setUnlockStatus('verifying');
      setTimeout(() => {
        setUnlockStatus('rejected');
      }, 4000);
    }, 2000);
  };

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [nlpStep, setNlpStep] = useState(0); // 0: idle, 1: listening, 2: parsing, 3: parsed, 4: generating_solidity, 5: deployed
  const [parsedData, setParsedData] = useState(null);

  const startListening = () => {
    setTranscript('');
    setParsedData(null);
    setNlpStep(1);
    setIsListening(true);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.interimResults = true;
      recognition.onresult = (e) => {
        setTranscript(e.results[0][0].transcript);
      };
      recognition.onend = () => {
        setIsListening(false);
        simulateNLPProcessing(transcript || MOCK_TRANSCRIPT);
      };
      recognition.start();
    } else {
      // Fallback for browsers without Web Speech API
      let text = '';
      let i = 0;
      const interval = setInterval(() => {
        text += MOCK_TRANSCRIPT[i];
        setTranscript(text);
        i++;
        if (i >= MOCK_TRANSCRIPT.length) {
          clearInterval(interval);
          setIsListening(false);
          simulateNLPProcessing(MOCK_TRANSCRIPT);
        }
      }, 30); // 30ms typing speed
    }
  };

  const simulateNLPProcessing = (finalText) => {
    if (!finalText) finalText = MOCK_TRANSCRIPT;
    setTranscript(finalText);
    setNlpStep(2);
    setTimeout(() => {
      setParsedData({
        to: 'Can',
        amount: '1.000 ₺',
        reason: 'Akşam yemeği',
        condition: 'Projeyi teslim etmesi',
        deadline: 'Yarın Akşam (24 Saat)'
      });
      setNlpStep(3);
    }, 2500);
  };

  const deployContract = () => {
    setNlpStep(4);
    setTimeout(() => {
      setNlpStep(5);
    }, 4000);
  };

  return (
    <>
      <style>{`
        .matrix-bg {
          background-image: radial-gradient(rgba(124, 58, 237, 0.1) 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .shake-animation { animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake { 0%, 100% {transform: translateX(0);} 10%, 30%, 50%, 70%, 90% {transform: translateX(-10px);} 20%, 40%, 60%, 80% {transform: translateX(10px);} }
        
        @keyframes pulseMic { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        @keyframes codeScroll { from { transform: translateY(0); } to { transform: translateY(-50%); } }
      `}</style>

      <div className="pt-24 pb-32 px-6 max-w-4xl mx-auto matrix-bg" style={{ minHeight: '100vh' }}>
        
        <PageHeader
          icon={<Cpu size={24} />}
          color={P.purple}
          title="Blockchain Güvenlik Ağı"
          subtitle="Doğal dil işleme (NLP) ile konuşarak akıllı sözleşmeler oluşturun veya acil durum fonunuzu güvence altına alın."
          badge="Smart Contract"
        >
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: 4, borderRadius: 12, border: `1px solid ${P.border}`, width: 'fit-content' }}>
            <button onClick={() => setActiveTab('voice')} style={{ padding: '8px 20px', borderRadius: 10, background: activeTab === 'voice' ? P.purple : 'transparent', color: activeTab === 'voice' ? '#fff' : P.text2, fontSize: 13, fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
              Şartlı Transfer
            </button>
            <button onClick={() => setActiveTab('emergency')} style={{ padding: '8px 20px', borderRadius: 10, background: activeTab === 'emergency' ? P.amber : 'transparent', color: activeTab === 'emergency' ? '#fff' : P.text2, fontSize: 13, fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
              Acil Durum Fonu
            </button>
          </div>
        </PageHeader>

        {activeTab === 'emergency' && (
          <div className="animate-enter" style={{ background: P.bg0, border: `1px solid ${P.border}`, borderRadius: 32, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>
            <div style={{ padding: '40px', textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', height: 1, background: `linear-gradient(90deg, transparent, ${P.amber}, transparent)` }} />
              
              <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(245,158,11,0.1)', border: `2px solid rgba(245,158,11,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                 <Lock size={36} color={P.amber} />
              </div>

              <p style={{ fontSize: 13, color: P.text3, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>KİLİTLİ BAKİYE</p>
              <h2 style={{ fontSize: 56, fontWeight: 900, color: P.text1, letterSpacing: '-0.03em', margin: '0 0 8px' }}>120.000 ₺</h2>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 8, border: `1px solid ${P.border}` }}>
                <span style={{ fontSize: 11, color: P.text3, fontFamily: 'monospace' }}>0x8aA9...3F9c</span>
                <ShieldCheck size={14} color={P.green} />
              </div>
            </div>

            <div style={{ background: P.bg2, padding: 40, borderTop: `1px solid ${P.border}` }}>
              {unlockStatus === 'idle' && (
                 <div style={{ textAlign: 'center' }}>
                   <p style={{ fontSize: 14, color: P.text2, marginBottom: 24 }}>Bu fon sadece sağlık veya kaza gibi ekstrem acil durumlar için ayrılmıştır.</p>
                   <button onClick={handleUnlock} style={{ padding: '18px 40px', borderRadius: 16, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', fontSize: 16, fontWeight: 900, border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(245,158,11,0.3)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                     Kilidi Aç ve Para Çek
                   </button>
                 </div>
              )}

              {unlockStatus !== 'idle' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="animate-enter" style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(59,130,246,0.1)', padding: 20, borderRadius: 16, border: `1px solid rgba(59,130,246,0.2)` }}>
                     <div style={{ width: 40, height: 40, borderRadius: '50%', background: P.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={20} color="#fff" /></div>
                     <div>
                       <p style={{ fontSize: 15, fontWeight: 800, color: P.text1, margin: 0 }}>Para Çekme Talebi Alındı</p>
                       <p style={{ fontSize: 13, color: P.text2, margin: '4px 0 0' }}>Akıllı Sözleşmeye (Smart Contract) talep iletildi.</p>
                     </div>
                     <CheckCircle2 size={24} color={P.blue} style={{ marginLeft: 'auto' }} />
                  </div>

                  {unlockStatus === 'verifying' || unlockStatus === 'rejected' ? (
                    <div className="animate-enter" style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(124,58,237,0.1)', padding: 20, borderRadius: 16, border: `1px solid rgba(124,58,237,0.2)` }}>
                       <div style={{ width: 40, height: 40, borderRadius: '50%', background: P.purple, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {unlockStatus === 'verifying' ? <div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Cpu size={20} color="#fff" />}
                       </div>
                       <div>
                         <p style={{ fontSize: 15, fontWeight: 800, color: P.text1, margin: 0 }}>Oracle API Doğrulaması</p>
                         <p style={{ fontSize: 13, color: P.text2, margin: '4px 0 0' }}>E-Devlet & Hastane verileri taranıyor...</p>
                       </div>
                       {unlockStatus === 'rejected' && <CheckCircle2 size={24} color={P.purple} style={{ marginLeft: 'auto' }} />}
                    </div>
                  ) : null}

                  {unlockStatus === 'rejected' && (
                    <div className={`animate-enter shake-animation`} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, background: 'rgba(239,68,68,0.1)', padding: 24, borderRadius: 16, border: `1px solid rgba(239,68,68,0.4)` }}>
                       <div style={{ width: 40, height: 40, borderRadius: '50%', background: P.red, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ShieldAlert size={20} color="#fff" /></div>
                       <div>
                         <p style={{ fontSize: 16, fontWeight: 900, color: P.red, margin: '0 0 8px' }}>ERİŞİM REDDEDİLDİ (SMART CONTRACT BLOKESİ)</p>
                         <p style={{ fontSize: 14, color: P.text1, margin: 0, lineHeight: 1.6 }}>
                           Oracle ağları veri tabanlarında adınıza kayıtlı bir <strong>acil durum raporu bulamadı.</strong> İradenizi korumak adına para sözleşmede kilitli kalacaktır.
                         </p>
                         <button onClick={() => setUnlockStatus('idle')} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 8, background: P.bg0, border: `1px solid ${P.border}`, color: P.text1, fontWeight: 700, cursor: 'pointer' }}>Geri Dön</button>
                       </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="animate-enter" style={{ background: P.bg0, border: `1px solid ${P.border}`, borderRadius: 32, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>
            <div style={{ padding: '40px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', height: 1, background: `linear-gradient(90deg, transparent, ${P.purple}, transparent)` }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
                <button 
                  onClick={startListening}
                  disabled={nlpStep > 0 && nlpStep < 6}
                  style={{ 
                    width: 100, height: 100, borderRadius: '50%', 
                    background: isListening ? 'rgba(239,68,68,0.1)' : 'linear-gradient(135deg, #7c3aed, #ec4899)', 
                    border: isListening ? `2px solid ${P.red}` : 'none', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    margin: '0 auto 24px', cursor: (nlpStep > 0 && nlpStep < 6) ? 'not-allowed' : 'pointer',
                    boxShadow: isListening ? 'none' : '0 16px 40px rgba(124,58,237,0.4)',
                    animation: isListening ? 'pulseMic 1.5s infinite' : 'none',
                    transition: 'all 0.3s'
                  }}
                >
                   <Mic size={40} color={isListening ? P.red : '#fff'} />
                </button>
                <p style={{ fontSize: 16, fontWeight: 800, color: P.text1, margin: '0 0 8px' }}>
                  {nlpStep === 0 && 'Sesli Komut Verin'}
                  {nlpStep === 1 && 'Dinleniyor...'}
                  {nlpStep === 2 && 'Doğal Dil İşleniyor (NLP)...'}
                  {nlpStep >= 3 && 'Komut Analiz Edildi'}
                </p>
                <p style={{ fontSize: 13, color: P.text3, maxWidth: 400, textAlign: 'center', margin: 0 }}>
                  Örn: "Can'a akşam yemeği için 1000 TL gönder, ama projeyi teslim ederse parayı serbest bırak."
                </p>
              </div>

              {transcript && (
                <div className="animate-enter" style={{ background: P.bg2, padding: 20, borderRadius: 16, border: `1px solid rgba(124,58,237,0.2)`, marginBottom: 24, textAlign: 'center' }}>
                  <p style={{ fontSize: 18, color: '#fff', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>"{transcript}"</p>
                </div>
              )}

              {nlpStep >= 2 && (
                <div className="animate-enter" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                  {[{label: 'Alıcı', value: parsedData?.to || '...', color: P.blue},
                    {label: 'Tutar', value: parsedData?.amount || '...', color: P.green},
                    {label: 'Şart (Condition)', value: parsedData?.condition || '...', color: P.amber},
                    {label: 'Süre (Deadline)', value: parsedData?.deadline || '...', color: P.red}
                  ].map((item, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16, border: `1px solid ${P.border}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: P.text3, textTransform: 'uppercase' }}>{item.label}</span>
                      {nlpStep === 2 ? (
                         <div style={{ height: 20, width: '60%', background: 'rgba(255,255,255,0.05)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
                      ) : (
                         <span style={{ fontSize: 16, fontWeight: 900, color: item.color }}>{item.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {nlpStep === 3 && (
                <button onClick={deployContract} className="animate-enter" style={{ width: '100%', padding: '18px', borderRadius: 16, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontSize: 16, fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 32px rgba(16,185,129,0.3)' }}>
                  <Code size={20} /> Smart Contract Üret ve Ağa Yükle
                </button>
              )}

              {nlpStep >= 4 && (
                <div className="animate-enter" style={{ background: '#0a0a0a', borderRadius: 16, border: `1px solid ${P.green}`, overflow: 'hidden' }}>
                  <div style={{ background: 'rgba(16,185,129,0.1)', padding: '12px 20px', borderBottom: `1px solid rgba(16,185,129,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                       <Code size={16} color={P.green} />
                       <span style={{ fontSize: 13, fontWeight: 800, color: P.green }}>Solidity Compiler v0.8.20</span>
                     </div>
                     {nlpStep === 4 ? <span style={{ fontSize: 12, color: P.green, animation: 'pulse 1.5s infinite' }}>Deploying to Ethereum...</span> : <span style={{ fontSize: 12, color: P.green, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={14} /> Deployed successfully</span>}
                  </div>
                  <div style={{ padding: 20, height: 160, overflow: 'hidden', position: 'relative' }}>
                    <pre style={{ margin: 0, color: '#10b981', fontSize: 12, fontFamily: 'monospace', lineHeight: 1.6, animation: nlpStep === 4 ? 'codeScroll 10s linear infinite' : 'none', opacity: 0.8 }}>
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ConditionalEscrow {
    address public payer;
    address public payee;
    uint public amount;
    string public condition;
    uint public deadline;

    constructor(address _payee, string memory _condition, uint _duration) payable {
        payer = msg.sender;
        payee = _payee;
        amount = msg.value;
        condition = _condition;
        deadline = block.timestamp + _duration;
    }

    function verifyConditionAndRelease() public {
        require(block.timestamp <= deadline, "Deadline passed");
        // Oracle verification logic goes here...
        payable(payee).transfer(amount);
    }
    
    function refund() public {
        require(block.timestamp > deadline, "Not expired yet");
        payable(payer).transfer(amount);
    }
}`}
                    </pre>
                    {nlpStep === 4 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(transparent, #0a0a0a)' }} />}
                  </div>
                </div>
              )}

              {nlpStep === 5 && (
                <div className="animate-enter" style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(16,185,129,0.1)', padding: 20, borderRadius: 16, border: `1px solid rgba(16,185,129,0.3)`, marginTop: 24 }}>
                   <div style={{ width: 48, height: 48, borderRadius: '50%', background: P.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Send size={20} color="#fff" style={{ marginLeft: -2 }} /></div>
                   <div>
                     <p style={{ fontSize: 16, fontWeight: 900, color: P.green, margin: '0 0 4px' }}>Fon Kilitlendi ve Ağa Yüklendi!</p>
                     <p style={{ fontSize: 14, color: P.text2, margin: 0 }}>Can adlı kişiye 1.000 ₺ gönderildi. Ancak "Projeyi teslim etmesi" şartı gerçekleşene kadar para Smart Contract kasasında bekleyecektir.</p>
                   </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </>
  );
}
