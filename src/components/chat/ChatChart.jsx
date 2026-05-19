import { useEffect, useRef, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend
} from 'recharts';

const PIE_COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#06B6D4'];

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
    return <div style={{ textAlign: 'center', color: '#64748b', fontSize: 13, paddingTop: 40 }}>Grafik verisi bulunamadı.</div>;
  }
  if (!chartReady || chartSize.width <= 1 || chartSize.height <= 1) {
    return <div ref={containerRef} style={{ height: '100%', minHeight: 180, width: '100%' }} />;
  }
  const { type, data } = chartData;
  const pieData = type === 'pie' ? data.map(d => ({ name: d.label, value: d.value })) : data;
  const tickStyle = { fill: '#64748B', fontSize: 11 };

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
            <RechartsTooltip contentStyle={{ background: '#1C2038', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F1F5F9' }} formatter={v => [`₺${v}`, 'Tutar']} />
            <Bar dataKey="value" fill="#7C3AED" radius={[6, 6, 0, 0]} maxBarSize={50} />
          </BarChart>
      );
    case 'line':
      return chartFrame(
          <LineChart width={chartSize.width} height={chartSize.height} data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="label" tick={tickStyle} tickLine={false} axisLine={false} />
            <YAxis tick={tickStyle} tickLine={false} axisLine={false} tickFormatter={v => `₺${v}`} />
            <RechartsTooltip contentStyle={{ background: '#1C2038', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F1F5F9' }} formatter={v => [`₺${v}`, 'Tutar']} />
            <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
      );
    case 'pie':
      return chartFrame(
          <PieChart width={chartSize.width} height={chartSize.height}>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius="45%" outerRadius="75%" paddingAngle={4} dataKey="value" stroke="none">
              {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <RechartsTooltip contentStyle={{ background: '#1C2038', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F1F5F9' }} formatter={v => [`₺${v}`, 'Tutar']} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
          </PieChart>
      );
    default:
      return <div style={{ textAlign: 'center', color: '#64748b', fontSize: 13 }}>Desteklenmeyen grafik tipi: {type}</div>;
  }
}
