import { MapPin, AlertTriangle, Crosshair } from 'lucide-react';

import { P } from '../../styles/palette';
export default function GeoHeatmap() {
  return (
    <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid rgba(239, 68, 68, 0.3)` }}>
            <MapPin size={24} color={P.red} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1 }}>Konum Tabanlı Isı Haritası</h3>
            <p style={{ fontSize: 12, color: P.text2 }}>Harcama Lokasyon Analizi</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: P.red, background: 'rgba(239, 68, 68, 0.1)', padding: '6px 12px', borderRadius: 99, border: `1px solid rgba(239, 68, 68, 0.3)` }}>
          <AlertTriangle size={14} /> Kırmızı Alan Uyarısı
        </div>
      </div>

      {/* Map Mockup */}
      <div style={{ 
        height: 240, width: '100%', borderRadius: 16, border: `1px solid ${P.border}`, position: 'relative', overflow: 'hidden',
        background: '#0a0d14', backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px'
      }}>
        {/* Kadıköy Moda Glow */}
        <div style={{ position: 'absolute', top: '40%', left: '60%', width: 120, height: 120, background: 'rgba(239, 68, 68, 0.6)', filter: 'blur(30px)', borderRadius: '50%', transform: 'translate(-50%, -50%)', animation: 'pulse 3s infinite' }} />
        <div style={{ position: 'absolute', top: '40%', left: '60%', width: 40, height: 40, background: 'rgba(239, 68, 68, 0.9)', filter: 'blur(10px)', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
        <MapPin size={24} color="#fff" style={{ position: 'absolute', top: '35%', left: '60%', transform: 'translate(-50%, -100%)', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }} />
        <div style={{ position: 'absolute', top: '30%', left: '60%', transform: 'translate(-50%, -100%)', background: P.text1, color: '#000', padding: '4px 8px', borderRadius: 8, fontSize: 10, fontWeight: 800 }}>Kadıköy / Moda</div>

        {/* Beşiktaş Glow (Smaller) */}
        <div style={{ position: 'absolute', top: '65%', left: '35%', width: 80, height: 80, background: 'rgba(245, 158, 11, 0.4)', filter: 'blur(20px)', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
        <MapPin size={16} color={P.text1} style={{ position: 'absolute', top: '60%', left: '35%', transform: 'translate(-50%, -100%)' }} />
        
        {/* Crosshair decoration */}
        <Crosshair size={40} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      </div>

      {/* AI Roast */}
      <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: 12, padding: '16px', border: `1px solid rgba(239, 68, 68, 0.3)` }}>
        <p style={{ fontSize: 13, color: P.text1, lineHeight: 1.5 }}>
          <strong style={{ color: P.red }}>Ajan Analizi: </strong> 
          En çok paranı <span style={{ textDecoration: 'underline', textUnderlineOffset: 4 }}>Kadıköy/Moda</span> bölgesindeki kahvecilerde ve barlarda kaybediyorsun (Aylık: 4.850₺). Bütçeni korumak istiyorsan <strong>oradan uzak dur!</strong>
        </p>
      </div>

    </div>
  );
}
