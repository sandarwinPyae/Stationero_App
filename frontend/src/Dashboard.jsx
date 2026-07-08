import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';

const pieData = [
  { name: 'Notebooks', value: 30, color: '#F43F5E' },
  { name: 'Pens', value: 20, color: '#3C2A21' },
  { name: 'Paper', value: 15, color: '#A7727D' },
  { name: 'Others', value: 35, color: '#FBC5B5' }
];

const barData = [
  { name: 'Mar 1 - 7', sales: 50000 },
  { name: 'Mar 8 - 14', sales: 125000 },
  { name: 'Mar 15 - 21', sales: 125000 },
  { name: 'Mar 22 - 28', sales: 125000 },
  { name: 'Final wk', sales: 190000 }
];

const sparklineData = [{ v: 10 }, { v: 15 }, { v: 12 }, { v: 25 }, { v: 18 }, { v: 30 }];

// Recharts custom label positioning function to draw percentage and names inside the slices
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  // Use 0.55 multiplier to pull text perfectly into the middle area of the slice
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <g>
      {/* Percentage Label */}
      <text 
        x={x} 
        y={y - 6} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central" 
        style={{ fontSize: '11px', fontWeight: '700' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      {/* Product Name Type Label */}
      <text 
        x={x} 
        y={y + 8} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central" 
        style={{ fontSize: '9px', fontWeight: '500', opacity: 0.9 }}
      >
        {name}
      </text>
    </g>
  );
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ total_sales: 2100000, total_products: 2000000, top_product: "Notebook", current_sales_pct: 86 });

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/dashboard/metrics")
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(err => console.log("Using local metrics fallback profile"));
  }, []);

  return (
    <main style={{ flex: 1, padding: '40px', boxSizing: 'border-box', overflowY: 'auto', backgroundColor: '#FAFAFA' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '700', color: '#0F172A' }}>Dashboard</h2>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👤</div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>TOTAL SALES</p>
            <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#0F172A' }}>{metrics.total_sales.toLocaleString()}<span style={{ fontSize: '14px', color: '#94A3B8', marginLeft: '4px' }}>MMK</span></h3>
          </div>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>TOTAL PRODUCT BY SALES</p>
            <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#0F172A' }}>{metrics.total_products.toLocaleString()}</h3>
          </div>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>TOP PRODUCT BY SALES</p>
            <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#0F172A' }}>{metrics.top_product}</h3>
          </div>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>CURRENT SALES</p>
              <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#0F172A' }}>{metrics.current_sales_pct}%</h3>
            </div>
            <div style={{ width: '80px', height: '40px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}><Area type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2} fill="none" /></AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h4 style={{ margin: '0 0 12px 0', alignSelf: 'flex-start', fontSize: '14px', color: '#1E293B', fontWeight: '600' }}>Product by Sales</h4>
          <div style={{ width: '100%', height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={70}
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ width: '100%', height: '240px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barSize={45}>
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#F8FAFC' }} />
              <Bar dataKey="sales" fill="#E8D5FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}