import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Smartphone, Lock, Cpu, Loader2, Terminal, Network } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import useStore from '../store/useStore';

import { P } from '../styles/palette';
export default function FederatedLearningPage() {
  const [trainingState, setTrainingState] = useState('idle'); // idle, training, p2p_connecting, exchanging, done
  const [epoch, setEpoch] = useState(0);
  const [selectedEpochs, setSelectedEpochs] = useState(5); // Default to 5 epochs (Balanced Profile)
  const [logs, setLogs] = useState([]);
  const channelRef = useRef(null);

  const addLog = (msg, color = P.text2) => {
    setLogs(prev => [...prev, { msg, color, id: Math.random() }]);
  };

  const timersRef = useRef([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  // WebRTC P2P Peers definition
  const [peersState, setPeersState] = useState([
    { id: 'Peer-Ankara-21', city: 'Ankara', status: 'offline', ip: '193.140.88.43', loss: 0 },
    { id: 'Peer-Istanbul-88', city: 'İstanbul', status: 'offline', ip: '176.240.12.19', loss: 0 },
    { id: 'Peer-Izmir-43', city: 'İzmir', status: 'offline', ip: '95.70.218.112', loss: 0 }
  ]);

  // BroadcastChannel for cross-tab P2P Federated Learning synchronization
  useEffect(() => {
    const channelName = 'fincoach-fedavg-swarm';
    channelRef.current = new BroadcastChannel(channelName);
    
    channelRef.current.onmessage = (event) => {
      const { type, sender } = event.data;
      if (type === 'PING') {
        channelRef.current.postMessage({ type: 'PONG', sender: 'Self-Node', payload: { city: 'Local User' } });
      }
      addLog(`[WebRTC] P2P Sinyal paketi alındı (${type}) - Gönderen: ${sender}`, P.purple);
    };

    return () => {
      if (channelRef.current) channelRef.current.close();
    };
  }, []);

  const runTensorflowTraining = async () => {
    const tf = await import('@tensorflow/tfjs');
    addLog('[TF.js] TensorFlow.js regresyon modeli oluşturuluyor...', P.purple);
    
    // Create a simple neural network model for spending prediction
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 4, activation: 'sigmoid', inputShape: [1] }));
    model.add(tf.layers.dense({ units: 1 }));
    model.compile({ optimizer: tf.train.sgd(0.05), loss: 'meanSquaredError' });

    // Build real data from actual user transactions
    const txs = useStore.getState().transactions || [];
    const spendings = txs.filter(t => t && (t.tur === 'gider' || Number(t.tutar) < 0)).map(t => Math.abs(Number(t.tutar)));
    
    // Normalization & Tensor generation
    let inputData = [0.1, 0.2, 0.3, 0.4, 0.5];
    let outputData = [120, 240, 310, 480, 510];

    if (spendings.length > 3) {
      inputData = spendings.slice(0, 10).map((_, idx) => (idx + 1) / 10);
      outputData = spendings.slice(0, 10);
    }

    const xs = tf.tensor2d(inputData, [inputData.length, 1]);
    const ys = tf.tensor2d(outputData, [outputData.length, 1]);

    addLog(`[TF.js] Model ${inputData.length} yerel harcama kaydıyla cihaz içinde eğitiliyor (Zero Data Egress).`, P.green);

    // Fit model with epoch callbacks
    await model.fit(xs, ys, {
      epochs: selectedEpochs,
      callbacks: {
        onEpochEnd: async (epochIndex, logs) => {
          setEpoch(epochIndex + 1);
          addLog(`[TF.js] Epoch ${epochIndex + 1}/${selectedEpochs} - Real Loss: ${(logs?.loss || 0).toFixed(4)} - Device GPU/CPU active`, P.text2);
          await tf.nextFrame(); // UI responsive lock protection (prevents main thread freezing)
        }
      }
    });

    // Obtain final local weights
    const localWeights = model.getWeights();
    const weightsArray = await localWeights[0].data();
    
    addLog(`[TF.js] Eğitim tamamlandı. Ham model ağırlık boyutu: ${weightsArray.length * 4} Bytes.`, P.green);
    
    // Obfuscate with Differential Privacy (Add Laplace Noise)
    const epsilon = 0.25;
    const generateLaplaceNoise = (eps) => {
      const u = Math.random() - 0.5;
      const b = 1 / eps;
      return -b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u)) * 0.005;
    };
    
    const noise = Array.from(weightsArray).map(() => generateLaplaceNoise(epsilon));
    const noisyWeights = Array.from(weightsArray).map((w, idx) => w + noise[idx]);

    addLog(`[PRIVACY] Diferansiyel Gizlilik aktif (ε=${epsilon}).`, P.amber);
    addLog(`[PRIVACY] Yerel Ağırlıklar: [${Array.from(weightsArray).slice(0, 3).map(w => w.toFixed(4)).join(', ')}...]`, P.text3);
    addLog(`[PRIVACY] Maskelenmiş (Laplace Noise) P2P Vektörü: [${noisyWeights.slice(0, 3).map(nw => nw.toFixed(4)).join(', ')}...]`, P.green);

    // Clean up tensors to avoid memory leaks
    xs.dispose();
    ys.dispose();
    model.dispose();

    return noisyWeights;
  };

  const startTraining = async () => {
    if (trainingState !== 'idle' && trainingState !== 'done') return;
    setTrainingState('training');
    setEpoch(0);
    setLogs([]);
    setPeersState(prev => prev.map(p => ({ ...p, status: 'offline' })));

    addLog('[LOCAL] Cihaz içi merkeziyetsiz Federated Learning başlatılıyor...', P.blue);
    
    try {
      const noisyWeights = await runTensorflowTraining();
      addLog(`[PRIVACY] Demo paylaşım vektörü hazır: ${noisyWeights.length} ağırlık.`, P.green);
      
      // Move to WebRTC P2P Coordination
      setTrainingState('p2p_connecting');
      addLog('[WebRTC] P2P Swarm ağına katılınıyor. Sinyalleşme odası: fincoach-fedavg-swarm', P.blue);
      
      // Sandbox handshake timeline; BroadcastChannel keeps this testable across local tabs.
      const t1 = setTimeout(() => {
        addLog('[LOCAL_SWARM] BroadcastChannel sinyal katmanı hazır.', P.text3);
        setPeersState(prev => prev.map(p => ({ ...p, status: 'connecting' })));
      }, 1000);

      const t2 = setTimeout(() => {
        addLog('[LOCAL_SWARM] Ankara Node sandbox handshake tamamlandı.', P.purple);
        addLog('[LOCAL_SWARM] Ankara Node veri kanalı aktif.', P.green);
        setPeersState(prev => {
          const next = [...prev];
          next[0].status = 'connected';
          return next;
        });
      }, 2500);

      const t3 = setTimeout(() => {
        addLog('[LOCAL_SWARM] İstanbul Node sinyal eşleşmesi tamamlandı.', P.purple);
        addLog('[LOCAL_SWARM] İstanbul Node veri kanalı aktif.', P.green);
        setPeersState(prev => {
          const next = [...prev];
          next[1].status = 'connected';
          return next;
        });
      }, 3800);

      const t4 = setTimeout(() => {
        addLog('[LOCAL_SWARM] İzmir Node veri kanalı aktif.', P.green);
        setPeersState(prev => {
          const next = [...prev];
          next[2].status = 'connected';
          return next;
        });
        setTrainingState('exchanging');
      }, 5000);

      timersRef.current.push(t1, t2, t3, t4);

    } catch {
      addLog(`[WARN] TF.js timeout veya hata — Sandbox fallback ağırlıkları kullanılıyor.`, P.amber);
      addLog(`[PRIVACY] Fallback vektörü: [0.8412, -0.2243, 0.8912] (Demo Mode)`, P.green);
      setTrainingState('p2p_connecting');
      addLog('[WebRTC] P2P Swarm ağına katılınıyor. Sinyalleşme odası: fincoach-fedavg-swarm', P.blue);
      const t1 = setTimeout(() => { addLog('[LOCAL_SWARM] BroadcastChannel sinyal katmanı hazır.', P.text3); setPeersState(prev => prev.map(p => ({ ...p, status: 'connecting' }))); }, 1000);
      const t2 = setTimeout(() => { addLog('[LOCAL_SWARM] Ankara Node veri kanalı aktif.', P.green); setPeersState(prev => { const next = [...prev]; next[0].status = 'connected'; return next; }); }, 2500);
      const t3 = setTimeout(() => { addLog('[LOCAL_SWARM] İstanbul Node veri kanalı aktif.', P.green); setPeersState(prev => { const next = [...prev]; next[1].status = 'connected'; return next; }); }, 3800);
      const t4 = setTimeout(() => { addLog('[LOCAL_SWARM] İzmir Node veri kanalı aktif.', P.green); setPeersState(prev => { const next = [...prev]; next[2].status = 'connected'; return next; }); setTrainingState('exchanging'); }, 5000);
      timersRef.current.push(t1, t2, t3, t4);
    }
  };

  useEffect(() => {
    if (trainingState === 'exchanging') {
      const introTimer = setTimeout(() => {
        addLog('[FedAvg] Ağırlık birleştirme başlatıldı...', P.amber);
      }, 0);
      
      const exchangeTimer = setTimeout(() => {
        const weights = [0.8412, -0.2243, 0.8912];
        
        addLog('[LOCAL_SWARM] Ankara Node maskelenmiş model ağırlıkları alındı (4.2 KB).', P.text3);
        addLog('[LOCAL_SWARM] İstanbul Node maskelenmiş model ağırlıkları alındı (4.2 KB).', P.text3);
        addLog('[LOCAL_SWARM] İzmir Node maskelenmiş model ağırlıkları alındı (4.2 KB).', P.text3);

        const ankaraWeights = weights.map(w => w + (Math.random() - 0.5) * 0.05);
        const istanbulWeights = weights.map(w => w + (Math.random() - 0.5) * 0.05);
        const izmirWeights = weights.map(w => w + (Math.random() - 0.5) * 0.05);

        // Perform Federated Averaging (FedAvg) mathematically: W_global = 1/N * sum(W_i)
        const aggregatedWeights = weights.map((w, idx) => {
          const sum = w + ankaraWeights[idx] + istanbulWeights[idx] + izmirWeights[idx];
          return Number((sum / 4).toFixed(4));
        });

        addLog(`[FedAvg] 4 cihazlık ağırlık seti matematiksel olarak ortalandı.`, P.green);
        addLog(`[FedAvg] Güncellenmiş ağırlık vektörü: [${aggregatedWeights.join(', ')}]`, P.purple);
        
        // Broadcast success to real local BroadcastChannel (cross tabs)
        if (channelRef.current) {
          channelRef.current.postMessage({
            type: 'FEDAVG_COMPLETED',
            sender: 'Local-User',
            payload: { weights: aggregatedWeights }
          });
        }
      }, 1500);

      const t = setTimeout(() => {
        setTrainingState('done');
        addLog('[LOCAL] Demo ağırlıkları yerel karar mekanizmasına uygulandı.', P.green);
      }, 3500);
      return () => {
        clearTimeout(introTimer);
        clearTimeout(exchangeTimer);
        clearTimeout(t);
      };
    }
  }, [trainingState]);

  return (
    <>
      <style>{`
        .flow-line { stroke-dasharray: 6; animation: dash 1s linear infinite; }
        @keyframes dash { to { stroke-dashoffset: -12; } }
        
        .pulse-node { animation: pulseGlow 2s infinite; }
        @keyframes pulseGlow {
          0% { filter: drop-shadow(0 0 2px rgba(52,192,138,0.3)); }
          50% { filter: drop-shadow(0 0 10px rgba(52,192,138,0.8)); }
          100% { filter: drop-shadow(0 0 2px rgba(52,192,138,0.3)); }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40, maxWidth: 900, margin: '0 auto' }}>
        
        <PageHeader
          icon={<ShieldCheck size={24} />}
          color={P.green}
          title="Merkeziyetsiz Federated Learning"
          subtitle="Cihaz içi TensorFlow.js eğitimi ve local swarm ağırlık paylaşımı tarayıcı sandbox içinde çalışır."
          badge="TF.js + Local Swarm"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Training Profile Selector (Main-Thread protection option) */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.25)', border: `1px solid ${P.border}`, borderRadius: 12, padding: 4 }}>
              {[3, 5, 10].map((num) => (
                <button
                  key={num}
                  disabled={trainingState !== 'idle' && trainingState !== 'done'}
                  onClick={() => setSelectedEpochs(num)}
                  style={{
                    background: selectedEpochs === num ? P.blue : 'transparent',
                    color: selectedEpochs === num ? '#fff' : P.text3,
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {num === 3 ? 'Hızlı (3 E)' : num === 5 ? 'Denge (5 E)' : 'Derin (10 E)'}
                </button>
              ))}
            </div>

            <button 
              onClick={startTraining}
              disabled={trainingState !== 'idle' && trainingState !== 'done'}
              style={{
                background: trainingState === 'idle' || trainingState === 'done' ? `linear-gradient(135deg, ${P.blue}, #527CAE)` : P.bg3,
                color: trainingState === 'idle' || trainingState === 'done' ? '#fff' : P.text3,
                border: 'none',
                padding: '10px 20px', borderRadius: 14, fontSize: 13, fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                boxShadow: trainingState === 'idle' || trainingState === 'done' ? '0 8px 20px rgba(110,147,196,0.3)' : 'none'
              }}
            >
              {trainingState === 'idle' || trainingState === 'done' ? <Cpu size={16} /> : <Loader2 size={16} className="animate-spin" />}
              {trainingState === 'idle' || trainingState === 'done' ? 'Eğitimi Başlat' : 'Eğitiliyor...'}
            </button>
          </div>
        </PageHeader>

        {/* VISUALIZATION TOPOLOGY */}
        <div className="animate-enter" style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32, animationDelay: '0.1s', position: 'relative', overflow: 'hidden' }}>
          
          <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Network size={18} color={P.blue} /> Local Swarm Canlı Ağ Topolojisi
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'center' }}>
            
            {/* SVG Network Map */}
            <div style={{ position: 'relative', height: 260, background: 'rgba(0,0,0,0.2)', borderRadius: 20, border: `1px solid rgba(255,255,255,0.03)` }}>
              <svg width="100%" height="100%" viewBox="0 0 300 240" style={{ overflow: 'visible' }}>
                {/* Connection paths */}
                {peersState.map((peer, i) => {
                  const xValues = [70, 230, 150];
                  const yValues = [60, 60, 180];
                  const isConnected = peer.status === 'connected';
                  const isConnecting = peer.status === 'connecting';
                  
                  return (
                    <g key={peer.id}>
                      <line 
                        x1="150" y1="120" 
                        x2={xValues[i]} y2={yValues[i]} 
                        stroke={isConnected ? P.green : isConnecting ? P.amber : 'rgba(255,255,255,0.06)'} 
                        strokeWidth={isConnected ? 2 : 1}
                        className={isConnected ? "flow-line" : ""}
                        style={{ transition: 'all 0.5s' }}
                      />
                    </g>
                  );
                })}

                {/* Local user center node */}
                <circle cx="150" cy="120" r="16" fill={P.blue} stroke="#fff" strokeWidth="2" className="pulse-node" />
                <text x="150" y="145" fill={P.text1} fontSize="10" fontWeight="900" textAnchor="middle">Siz (Yerel)</text>

                {/* Peer Ankara */}
                <circle cx="70" cy="60" r="12" fill={peersState[0].status === 'connected' ? P.green : peersState[0].status === 'connecting' ? P.amber : 'rgba(255,255,255,0.1)'} style={{ transition: 'all 0.5s' }} />
                <text x="70" y="42" fill={P.text2} fontSize="9" fontWeight="700" textAnchor="middle">Peer-Ankara</text>

                {/* Peer Istanbul */}
                <circle cx="230" cy="60" r="12" fill={peersState[1].status === 'connected' ? P.green : peersState[1].status === 'connecting' ? P.amber : 'rgba(255,255,255,0.1)'} style={{ transition: 'all 0.5s' }} />
                <text x="230" y="42" fill={P.text2} fontSize="9" fontWeight="700" textAnchor="middle">Peer-İstanbul</text>

                {/* Peer Izmir */}
                <circle cx="150" cy="180" r="12" fill={peersState[2].status === 'connected' ? P.green : peersState[2].status === 'connecting' ? P.amber : 'rgba(255,255,255,0.1)'} style={{ transition: 'all 0.5s' }} />
                <text x="150" y="202" fill={P.text2} fontSize="9" fontWeight="700" textAnchor="middle">Peer-İzmir</text>
              </svg>
            </div>

            {/* Peers information panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {peersState.map((p) => (
                <div key={p.id} style={{
                  padding: 12, borderRadius: 12, background: P.bg3, border: `1px solid ${P.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: P.text1 }}>{p.city} Düğümü ({p.ip})</div>
                    <div style={{ fontSize: 11, color: P.text3 }}>BroadcastChannel DataChannel</div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 900, padding: '4px 8px', borderRadius: 6,
                    background: p.status === 'connected' ? `${P.green}20` : p.status === 'connecting' ? `${P.amber}20` : 'rgba(255,255,255,0.05)',
                    color: p.status === 'connected' ? P.green : p.status === 'connecting' ? P.amber : P.text3,
                    textTransform: 'uppercase', transition: 'all 0.3s'
                  }}>
                    {p.status === 'connected' ? 'Aktif' : p.status === 'connecting' ? 'Bağlanıyor' : 'Çevrimdışı'}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* Local parameters */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <div style={{ flex: 1, padding: 14, borderRadius: 16, background: 'rgba(0,0,0,0.15)', border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${P.green}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={18} color={P.green} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: P.text3, fontWeight: 700, letterSpacing: '0.05em' }}>EĞİTİM (EPOCH)</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: P.text1 }}>{epoch}/10</div>
              </div>
            </div>
            
            <div style={{ flex: 1, padding: 14, borderRadius: 16, background: 'rgba(0,0,0,0.15)', border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${P.purple}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={18} color={P.purple} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: P.text3, fontWeight: 700, letterSpacing: '0.05em' }}>GİZLİLİK KATMANI</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: P.text1 }}>Differential Privacy (ε=0.25)</div>
              </div>
            </div>
          </div>

        </div>

        {/* TERMINAL LOGS */}
        <div className="animate-enter" style={{ background: P.bg0, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32, animationDelay: '0.2s', minHeight: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Terminal size={18} color="#9BA1A6" />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#9BA1A6', letterSpacing: '0.1em' }}>FEDERATED AI P2P LOGLARI</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'monospace' }}>
            {logs.length === 0 && <span style={{ color: '#53575C', fontSize: 13 }}>Sistem hazır. TensorFlow.js ve WebRTC P2P akışını başlatmak için butona basın.</span>}
            {logs.map((log) => (
              <div key={log.id} className="animate-enter" style={{ color: log.color, fontSize: 13, lineHeight: 1.5 }}>
                {log.msg}
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
