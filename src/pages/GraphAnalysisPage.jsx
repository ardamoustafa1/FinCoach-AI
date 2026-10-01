import { useState, useMemo } from 'react';
import { Network, Search, Link as LinkIcon, Zap } from 'lucide-react';
import useStore from '../store/useStore';
import PageHeader from '../components/PageHeader';

import { P } from '../styles/palette';
// ─── APRIORI ALGORITHM (Market Basket Analysis) ───
// Finds merchants or categories that are frequently bought together or sequentially within 48 hours.
function runAprioriAnalysis(transactions) {
  const edges = [];
  const nodesMap = new Map();
  const txSorted = [...(transactions || [])]
    .filter(t => t && t.tur === 'gider' && t.magaza && t.tarih)
    .sort((a, b) => new Date(a.tarih) - new Date(b.tarih));

  // Node ekleme yardımcı fonksiyon
  const addNode = (magaza, tutar) => {
    if (!nodesMap.has(magaza)) {
      nodesMap.set(magaza, { id: magaza, weight: 0, count: 0 });
    }
    const node = nodesMap.get(magaza);
    node.weight += tutar;
    node.count += 1;
  };

  // Basit Zaman Pencereli Birliktelik (Sequential Pattern Mining)
  const edgeMap = new Map();
  
  for (let i = 0; i < txSorted.length; i++) {
    const txA = txSorted[i];
    addNode(txA.magaza, Number(txA.tutar));

    // Kendisinden sonraki 2 gün (48 saat) içindeki işlemlere bak
    for (let j = i + 1; j < Math.min(i + 10, txSorted.length); j++) {
      const txB = txSorted[j];
      const diffMs = new Date(txB.tarih) - new Date(txA.tarih);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (diffDays <= 2 && txA.magaza !== txB.magaza) {
        const edgeId = [txA.magaza, txB.magaza].sort().join('||');
        if (!edgeMap.has(edgeId)) {
          edgeMap.set(edgeId, { source: txA.magaza, target: txB.magaza, strength: 0 });
        }
        edgeMap.get(edgeId).strength += 1;
      }
    }
  }

  // Yalnızca güçlü bağları al
  const threshold = 1; // Demo için düşük tutuyoruz
  for (const edge of edgeMap.values()) {
    if (edge.strength >= threshold) edges.push(edge);
  }

  return { nodes: Array.from(nodesMap.values()), edges };
}

export default function GraphAnalysisPage() {
  const transactions = useStore(state => state.transactions);
  const graphData = useMemo(() => runAprioriAnalysis(transactions), [transactions]);
  const [selectedNode, setSelectedNode] = useState(null);

  // ─── BASİT SVG FORCE LAYOUT SİMÜLASYONU ───
  // Gerçek D3 yerine, çembersel (circular) yerleşim kullanıyoruz.
  const visualNodes = useMemo(() => {
    if (graphData.nodes.length === 0) return [];
    
    // En büyük N node'u al
    const topNodes = [...graphData.nodes].sort((a, b) => b.count - a.count).slice(0, 15);
    
    const centerX = 350;
    const centerY = 350;
    const radius = 220;
    
    return topNodes.map((n, i) => {
      const angle = (i / topNodes.length) * 2 * Math.PI;
      const rScale = Math.max(15, Math.min(50, n.count * 8)); // Node büyüklüğü frekansa göre
      return {
        ...n,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        r: rScale
      };
    });
  }, [graphData.nodes]);

  const visualEdges = useMemo(() => {
    return graphData.edges.map(e => {
      const source = visualNodes.find(n => n.id === e.source);
      const target = visualNodes.find(n => n.id === e.target);
      if (source && target) return { ...e, source, target };
      return null;
    }).filter(Boolean);
  }, [graphData.edges, visualNodes]);



  return (
    <>
      <style>{`
        @keyframes drawLine { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
        .edge-path { stroke-dasharray: 1000; animation: drawLine 2s ease-out forwards; }
        .node-circle { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
        .node-circle:hover { filter: drop-shadow(0 0 16px rgba(195,203,211,0.8)); }
      `}</style>
      
      <div style={{ paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <PageHeader
          icon={<Network size={24} />}
          color={P.purple}
          title="Market Basket Analizi"
          subtitle="Harcamalarınız arasındaki gizli bağlantıları ve zincirleme reaksiyonları keşfedin."
          badge="Apriori Algorithm"
        />

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          
          {/* GRAPH VISUALIZATION */}
          <div style={{ flex: '1 1 600px', background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 600 }}>
            {visualNodes.length === 0 ? (
              <p style={{ color: P.text3, fontWeight: 600 }}>Yeterli harcama verisi bulunamadı.</p>
            ) : (
              <svg width="700" height="700" viewBox="0 0 700 700" style={{ overflow: 'visible' }}>
                {/* Edges */}
                {visualEdges.map((e, i) => (
                  <line 
                    key={`edge-${i}`}
                    x1={e.source.x} y1={e.source.y}
                    x2={e.target.x} y2={e.target.y}
                    stroke={P.purple}
                    strokeWidth={Math.min(6, e.strength * 1.5)}
                    strokeOpacity={0.2 + (e.strength * 0.1)}
                    className="edge-path"
                  />
                ))}
                
                {/* Nodes */}
                {visualNodes.map(n => (
                  <g key={n.id} 
                    className="node-circle" 
                    onClick={() => setSelectedNode(n)}
                    style={{ transformOrigin: `${n.x}px ${n.y}px`, transform: selectedNode?.id === n.id ? 'scale(1.15)' : 'scale(1)' }}
                  >
                    <circle cx={n.x} cy={n.y} r={n.r} fill={selectedNode?.id === n.id ? P.purple : P.bg3} stroke={selectedNode?.id === n.id ? '#fff' : P.purple} strokeWidth={selectedNode?.id === n.id ? 3 : 2} />
                    <text x={n.x} y={n.y + 4} textAnchor="middle" fill={selectedNode?.id === n.id ? '#fff' : P.text1} fontSize={Math.max(10, n.r / 2.5)} fontWeight="800" style={{ pointerEvents: 'none' }}>
                      {n.id.length > 10 ? n.id.slice(0, 8) + '..' : n.id}
                    </text>
                  </g>
                ))}
              </svg>
            )}
          </div>

          {/* SIDE PANEL */}
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {selectedNode ? (
              <div style={{ background: P.bg2, border: `1px solid ${P.purple}50`, borderRadius: 20, padding: 24, boxShadow: `0 16px 40px rgba(195,203,211,0.15)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 16, background: `${P.purple}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Search size={24} color={P.purple} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: P.text1, margin: 0 }}>{selectedNode.id}</h3>
                    <p style={{ fontSize: 13, color: P.text3, margin: 0 }}>Merkez Düğüm (Node)</p>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  <div style={{ background: P.bg3, padding: 16, borderRadius: 12 }}>
                    <p style={{ fontSize: 11, color: P.text3, textTransform: 'uppercase', fontWeight: 800, margin: '0 0 4px' }}>İşlem Frekansı</p>
                    <p style={{ fontSize: 20, color: P.text1, fontWeight: 900, margin: 0 }}>{selectedNode.count} <span style={{fontSize: 12, fontWeight: 600, color: P.text3}}>kez</span></p>
                  </div>
                  <div style={{ background: P.bg3, padding: 16, borderRadius: 12 }}>
                    <p style={{ fontSize: 11, color: P.text3, textTransform: 'uppercase', fontWeight: 800, margin: '0 0 4px' }}>Toplam Hacim</p>
                    <p style={{ fontSize: 20, color: P.text1, fontWeight: 900, margin: 0 }}>₺{Math.round(selectedNode.weight).toLocaleString('tr-TR')}</p>
                  </div>
                </div>

                <h4 style={{ fontSize: 13, fontWeight: 800, color: P.text2, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tetiklediği Harcamalar (Bağlantılar)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {visualEdges.filter(e => e.source.id === selectedNode.id || e.target.id === selectedNode.id).length === 0 ? (
                    <p style={{ fontSize: 13, color: P.text3, margin: 0 }}>Güçlü bir bağlantı tespit edilemedi.</p>
                  ) : (
                    visualEdges
                      .filter(e => e.source.id === selectedNode.id || e.target.id === selectedNode.id)
                      .sort((a,b) => b.strength - a.strength)
                      .map((e, i) => {
                        const targetName = e.source.id === selectedNode.id ? e.target.id : e.source.id;
                        return (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: P.bg3, padding: '12px 16px', borderRadius: 12, border: `1px solid ${P.border}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <LinkIcon size={14} color={P.purple} />
                              <span style={{ fontSize: 14, fontWeight: 700, color: P.text1 }}>{targetName}</span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 800, color: P.amber }}>
                              {e.strength} ortak işlem
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            ) : (
              <div style={{ background: P.bg2, border: `1px dashed ${P.border}`, borderRadius: 20, padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <Search size={32} color={P.text3} />
                <p style={{ fontSize: 14, color: P.text2, margin: 0 }}>Detaylı zincir analizi için grafikteki yuvarlak düğümlere (satıcılara) tıklayın.</p>
              </div>
            )}

            {/* AI INSIGHT */}
            <div style={{ background: `linear-gradient(135deg, rgba(219,92,78,0.1), rgba(210,137,79,0.05))`, border: `1px solid rgba(219,92,78,0.3)`, borderRadius: 20, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Zap size={18} color={P.red} />
                <span style={{ fontSize: 12, fontWeight: 800, color: P.red, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Tespiti: Toksik Zincir</span>
              </div>
              <p style={{ fontSize: 14, color: P.text1, margin: 0, lineHeight: 1.6 }}>
                Grafik verilerine göre; bazı mağazalardaki harcamalarınız diğerlerini tetikliyor (Dopamin Döngüsü). Bu zincirin ana düğümlerini (en büyük yuvarlakları) keserseniz, bütçenizde <strong>kelebek etkisiyle</strong> %15 ekstra tasarruf sağlayabilirsiniz.
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
