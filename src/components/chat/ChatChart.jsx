import { useEffect, useRef, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend
} from 'recharts';

const PIE_COLORS = ['#C3CBD3', '#34C08A', '#D2894F', '#DB5C4E', '#6E93C4', '#C0705C', '#45939C'];

export default function ChatChart({ chartData }) {
  const [chartReady, setChartReady] = useState(false);
  const containerRef = useRef(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setChartReady(true), 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setChartSize({
        width: Math.max(1, Math.floor(rect.width || 0)),
        height: Math.max(1, Math.floor(rect.height || 220)),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (!chartData || !chartData.data || chartData.data.length === 0) {
    return <div style={{ textAlign: 'center', color: '#6B7075', fontSize: 13, paddingTop: 40 }}>Grafik verisi bulunamadı.</div>;
  }
  if (!chartReady || chartSize.width <= 1 || chartSize.height <= 1) {
    return <div ref={containerRef} style={{ height: '100%', minHeight: 180, width: '100%' }} />;
  }
  const { type, data } = chartData;
  const pieData = type === 'pie' ? data.map(d => ({ name: d.label, value: d.value })) : data;
  const tickStyle = { fill: '#6B7075', fontSize: 11 };

  const chartFrame = (children) => (
    <div ref={containerRef} style={{ height: '100%', minHeight: 180, width: '100%' }}>
      {children}
    </div>
  );

  switch (type) {
    case 'bar':
      return chartFrame(
          <BarChart width={chartSize.width} height={chartSize.height} data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="label" tick={tickStyle} tickLine={false} axisLine={false} />
            <YAxis tick={tickStyle} tickLine={false} axisLine={false} tickFormatter={v => `₺${v}`} />
            <RechartsTooltip contentStyle={{ background: '#181A1D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F2F4F5' }} formatter={v => [`₺${v}`, 'Tutar']} />
            <Bar dataKey="value" fill="#C3CBD3" radius={[6, 6, 0, 0]} maxBarSize={50} />
          </BarChart>
      );
    case 'line':
      return chartFrame(
          <LineChart width={chartSize.width} height={chartSize.height} data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="label" tick={tickStyle} tickLine={false} axisLine={false} />
            <YAxis tick={tickStyle} tickLine={false} axisLine={false} tickFormatter={v => `₺${v}`} />
            <RechartsTooltip contentStyle={{ background: '#181A1D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F2F4F5' }} formatter={v => [`₺${v}`, 'Tutar']} />
            <Line type="monotone" dataKey="value" stroke="#34C08A" strokeWidth={2.5} dot={{ r: 4, fill: '#34C08A', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
      );
    case 'pie':
      return chartFrame(
          <PieChart width={chartSize.width} height={chartSize.height}>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius="45%" outerRadius="75%" paddingAngle={4} dataKey="value" stroke="none">
              {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <RechartsTooltip contentStyle={{ background: '#181A1D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F2F4F5' }} formatter={v => [`₺${v}`, 'Tutar']} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#9BA1A6' }} />
          </PieChart>
      );
    default:
      return <div style={{ textAlign: 'center', color: '#6B7075', fontSize: 13 }}>Desteklenmeyen grafik tipi: {type}</div>;
  }
}
