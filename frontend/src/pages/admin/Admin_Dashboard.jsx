import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching dashboard data:", err);
        setLoading(false);
      });
  }, []);

  const COLORS = ["#ff5a8a", "#b97d97", "#4d2d38", "#f8cddd"];

  if (loading) return <div className="p-8">Loading Dashboard...</div>;
  if (!dashboardData) return <div className="p-8">Failed to load data.</div>;

  return (
    <div className="bg-[#fafafa] min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2">
          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-5">
            {dashboardData.cards.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-gray-400 text-sm">{item.title}</p>
                <h2 className="text-xl font-bold mt-2">{item.value}</h2>
              </div>
            ))}

            {/* Current Sales Line Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-gray-400 text-sm">Current Sales</p>
              <h2 className="text-xl font-bold">{dashboardData.performance}%</h2>
              <div className="h-16 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.lineData}>
                    <ReferenceLine y={100} stroke="red" strokeDasharray="3 3" />
                    <Line
                      dataKey="value"
                      stroke="#3366ff"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm mt-8 p-6">
            <div className="flex justify-between mb-5">
              <h2 className="font-bold text-xl">Sales Overview</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer>
                <BarChart data={dashboardData.barData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="sales"
                    fill="#e2b7ff"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RIGHT (Solid Pie Chart) */}
        {/* RIGHT (Exploded Pie Chart) */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-center mb-4">Product by Sales</h2>
        <div className="h-80">
          <ResponsiveContainer>
            <PieChart>
              {/* <Pie
                data={dashboardData.pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80} // နေရာပိုရအောင် နည်းနည်းလျှော့လိုက်ပါတယ်
                paddingAngle={5}
                cornerRadius={5}
                labelLine={true} // အပြင်ထုတ်ပြဖို့အတွက် true ပေးလိုက်ပါတယ်
                label={({ cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, percent, name }) => {
                  const RADIAN = Math.PI / 180;
                  const sin = Math.sin(-RADIAN * midAngle);
                  const cos = Math.cos(-RADIAN * midAngle);
                  const sx = cx + (outerRadius + 5) * cos;
                  const sy = cy + (outerRadius + 5) * sin;
                  const mx = cx + (outerRadius + 20) * cos;
                  const my = cy + (outerRadius + 20) * sin;
                  const ex = mx + (cos >= 0 ? 1 : -1) * 10;
                  const ey = my;
                  const textAnchor = cos >= 0 ? 'start' : 'end';

                  const displayName = name.length > 8 ? name.substring(0, 8) + '...' : name;

                  return (
                    <g>
                      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="#999" fill="none" />
                      <text x={ex + (cos >= 0 ? 1 : -1) * 5} y={ey} textAnchor={textAnchor} fill="#333" dominantBaseline="central" style={{ fontSize: '10px' }}>
                        {`${displayName}`}
                      </text>
                    </g>
                  );
                }}
              >
                {dashboardData.pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie> */}
              <Pie
                data={dashboardData.pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80} 
                paddingAngle={5}
                cornerRadius={5}
                labelLine={true} 
                label={({ name, percent }) => {
                  const shortName = name.length > 10 ? name.substring(0, 10) + '...' : name;
                  return `${shortName}`;
                }}
              >
                {dashboardData.pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="space-y-3 mt-3">
          {dashboardData.pieData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>{item.name}</span>
              </div>
              <span>{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;