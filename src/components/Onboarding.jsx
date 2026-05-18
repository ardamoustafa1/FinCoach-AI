import { useState, useEffect, useRef } from "react";

const STEPS = [
  {
    icon: "📈",
    label: "Adım 1 / 2",
    title: ["Finansal profilini", "oluşturalım"],
    sub: "Bu bilgiler sana özel tavsiyeler üretmem için.",
    progress: "50%",
  },
  {
    icon: "🏦",
    label: "Adım 2 / 2",
    title: ["Son bir adım", "kaldı"],
    sub: "Banka formatını bilmek CSV yüklemeni kolaylaştırır.",
    progress: "100%",
  },
];

const BANKS = ["Garanti BBVA", "İş Bankası", "Yapı Kredi", "Akbank", "Diğer"];
const GOALS = [
  { key: "tasarruf", label: "💡 Tasarruf artırmak" },
  { key: "takip",   label: "📊 Harcamaları takip etmek" },
  { key: "birikim", label: "🎯 Birikim hedefi koymak" },
];

export default function Onboarding({ userName = 'Kullanıcı', onComplete = () => {} }) {
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState("");
  const [goal, setGoal]   = useState("");
  const [bank, setBank]   = useState("");
  const [customBank, setCustomBank] = useState("");
  const [leaving, setLeaving] = useState(false);

  const s = STEPS[step - 1] || STEPS[0];

  const timerRef = useRef(null);
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  function next(n) {
    setLeaving(true);
    timerRef.current = setTimeout(() => { setStep(n); setLeaving(false); }, 220);
  }

  function finish() {
    const finalBank = bank === "Diğer" ? customBank : bank;
    const profile = { name: userName, income: Number(income), goal, bank: finalBank };
    setLeaving(true);
    timerRef.current = setTimeout(() => onComplete(profile), 350);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: "#070b14" }}>

      {/* Arka plan ışık efektleri */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div style={{
          position:"absolute", top:"-10%", left:"-10%",
          width:"55%", height:"55%",
          background:"radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
          borderRadius:"50%"
        }}/>
        <div style={{
          position:"absolute", bottom:"-10%", right:"-5%",
          width:"50%", height:"50%",
          background:"radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
          borderRadius:"50%"
        }}/>
      </div>

      {/* Ana kart */}
      <div className="relative w-full max-w-md"
        style={{
          opacity: leaving ? 0 : 1,
          transform: leaving ? "scale(0.97) translateY(8px)" : "scale(1) translateY(0)",
          transition: "opacity 0.22s ease, transform 0.22s ease",
        }}>
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "28px",
          padding: "40px 36px 32px",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Kart iç parlaklık */}
          <div style={{
            position:"absolute", inset:0, pointerEvents:"none",
            background:"linear-gradient(135deg, rgba(124,58,237,0.06) 0%, transparent 60%)",
          }}/>

          {/* Progress bar */}
          <div style={{
            height:"2px", background:"rgba(255,255,255,0.08)",
            borderRadius:"100px", marginBottom:"32px", overflow:"hidden"
          }}>
            <div style={{
              height:"100%", borderRadius:"100px",
              background:"linear-gradient(90deg,#7c3aed,#6366f1)",
              width: s.progress,
              transition:"width 0.5s cubic-bezier(0.4,0,0.2,1)"
            }}/>
          </div>

          {/* İkon */}
          <div style={{
            width:"64px", height:"64px",
            background:"linear-gradient(135deg,#7c3aed,#6366f1)",
            borderRadius:"18px",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 20px",
            fontSize:"28px",
            boxShadow:"0 0 40px rgba(124,58,237,0.4), 0 0 0 1px rgba(124,58,237,0.3)",
          }}> {s.icon} </div>

          {/* Step badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:"6px",
            background:"rgba(124,58,237,0.15)",
            border:"1px solid rgba(124,58,237,0.3)",
            borderRadius:"100px", padding:"4px 14px",
            fontSize:"12px", color:"#a78bfa", fontWeight:"500",
            marginBottom:"12px",
          }}>
            <span style={{width:"5px",height:"5px",background:"#7c3aed",borderRadius:"50%",display:"inline-block"}}/>
            {s.label}
          </div>

          {/* Başlık */}
          <h1 style={{
            fontSize:"28px", fontWeight:"700",
            color:"#fff", letterSpacing:"-0.5px", lineHeight:"1.2",
            marginBottom:"8px", textAlign:"center"
          }}>
            {s.title[0]}<br/>{s.title[1]}
          </h1>
          <p style={{ fontSize:"15px", color:"rgba(255,255,255,0.4)", textAlign:"center", marginBottom:"32px", lineHeight:"1.5" }}>
            {s.sub}
          </p>

          {/* ADIM 1 — Finansal profil */}
          {step === 1 && (
            <div>
              <Label>Aylık gelirin (₺)</Label>
              <Input
                type="number"
                value={income}
                onChange={e => setIncome(e.target.value)}
                placeholder="Örn: 25000"
                autoFocus
              />
              <Label style={{ marginTop:"4px" }}>Birincil hedefin</Label>
              <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"24px" }}>
                {GOALS.map(g => (
                  <OptionBtn key={g.key} selected={goal===g.key} onClick={() => setGoal(g.key)}>
                    {g.label}
                  </OptionBtn>
                ))}
              </div>
              <PrimaryBtn onClick={() => next(2)} disabled={!income || !goal}>
                Devam Et <Arrow/>
              </PrimaryBtn>
            </div>
          )}

          {/* ADIM 2 — Banka */}
          {step === 2 && (
            <div>
              <Label>Hangi bankayı kullanıyorsun?</Label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"20px" }}>
                {BANKS.map(b => (
                  <OptionBtn key={b} selected={bank===b} onClick={() => setBank(b)}>
                    {b}
                  </OptionBtn>
                ))}
              </div>

              {bank === "Diğer" && (
                <div style={{ marginBottom: "20px" }}>
                  <Label>Banka adını girin</Label>
                  <Input
                    value={customBank}
                    onChange={e => setCustomBank(e.target.value)}
                    placeholder="Örn: Enpara"
                    autoFocus
                    style={{ marginBottom: "0" }}
                  />
                </div>
              )}

              {/* Demo önerisi */}
              <div style={{
                background:"rgba(124,58,237,0.1)",
                border:"1px solid rgba(124,58,237,0.2)",
                borderRadius:"14px", padding:"14px 16px",
                display:"flex", alignItems:"flex-start", gap:"10px",
                marginBottom:"24px",
              }}>
                <span style={{ fontSize:"18px" }}>✨</span>
                <div>
                  <div style={{ fontSize:"13px", fontWeight:"600", color:"#a78bfa", marginBottom:"3px" }}>
                    Demo verisiyle başla
                  </div>
                  <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)", lineHeight:"1.5" }}>
                    120 gerçekçi işlemle uygulamayı hemen keşfet
                  </div>
                </div>
              </div>

              <NavRow onBack={() => next(1)} onNext={finish} nextLabel="Başla ✓" disabled={!bank || (bank === "Diğer" && !customBank.trim())}/>
            </div>
          )}

          {/* Dot göstergeler */}
          <div style={{ display:"flex", justifyContent:"center", gap:"6px", marginTop:"24px" }}>
            {[1,2].map(i => (
              <div key={i} style={{
                height:"6px", borderRadius:"100px",
                background: i===step ? "#7c3aed" : "rgba(255,255,255,0.12)",
                width: i===step ? "20px" : "6px",
                transition:"all 0.3s ease",
              }}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Küçük yardımcı bileşenler ── */

function Label({ children, style }) {
  return (
    <div style={{ fontSize:"13px", fontWeight:"500", color:"rgba(255,255,255,0.55)", marginBottom:"8px", ...style }}>
      {children}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      style={{
        width:"100%",
        background:"rgba(255,255,255,0.06)",
        border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:"14px",
        padding:"14px 16px",
        color:"#fff", fontSize:"15px",
        outline:"none", marginBottom:"20px",
        fontFamily:"inherit",
        transition:"border-color 0.2s, background 0.2s",
        ...props.style,
      }}
      onFocus={e => {
        e.target.style.borderColor = "rgba(124,58,237,0.6)";
        e.target.style.background  = "rgba(124,58,237,0.08)";
      }}
      onBlur={e => {
        e.target.style.borderColor = "rgba(255,255,255,0.1)";
        e.target.style.background  = "rgba(255,255,255,0.06)";
      }}
    />
  );
}

function OptionBtn({ selected, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: selected ? "rgba(124,58,237,0.18)" : "rgba(255,255,255,0.05)",
      border: `1px solid ${selected ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}`,
      borderRadius:"12px", padding:"12px 14px",
      color: selected ? "#a78bfa" : "rgba(255,255,255,0.55)",
      fontSize:"14px", fontWeight: selected ? "600" : "400",
      cursor:"pointer", textAlign:"left",
      transition:"all 0.15s ease", fontFamily:"inherit",
    }}>
      {children}
    </button>
  );
}

function PrimaryBtn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%",
      background: disabled
        ? "rgba(124,58,237,0.3)"
        : "linear-gradient(135deg,#7c3aed,#6366f1)",
      border:"none", borderRadius:"14px",
      padding:"15px", color:"#fff", fontSize:"15px", fontWeight:"600",
      cursor: disabled ? "not-allowed" : "pointer",
      display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
      transition:"opacity 0.2s, transform 0.1s",
      fontFamily:"inherit", letterSpacing:"0.01em",
    }}
    onMouseEnter={e => !disabled && (e.target.style.opacity="0.88")}
    onMouseLeave={e => (e.target.style.opacity="1")}
    >
      {children}
    </button>
  );
}

function NavRow({ onBack, onNext, nextLabel = "Devam Et →", disabled }) {
  return (
    <div style={{ display:"flex", gap:"10px" }}>
      <button onClick={onBack} style={{
        width:"50px", height:"50px", flexShrink:0,
        background:"rgba(255,255,255,0.05)",
        border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:"14px", cursor:"pointer",
        color:"rgba(255,255,255,0.5)", fontSize:"18px",
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"background 0.15s", fontFamily:"inherit",
      }}>←</button>
      <PrimaryBtn onClick={onNext} disabled={disabled}>
        {nextLabel}
      </PrimaryBtn>
    </div>
  );
}

function Arrow() {
  return <span style={{ fontSize:"18px" }}>→</span>;
}
