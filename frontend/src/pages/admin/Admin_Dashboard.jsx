import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from '../../components/admin/Sidebar';

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
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/admin/dashboard")
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

  if (loading) return (
  <div className="min-h-screen flex flex-col justify-center items-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25278]"></div>
    <p className="mt-4 text-gray-500 font-medium">Loading Dashboard...</p>
  </div>
  );

// 2. Error state
if (!dashboardData) return (
  <div className="min-h-screen flex flex-col justify-center items-center">
    <i className="fa-solid fa-circle-exclamation text-4xl text-red-500 mb-4"></i>
    <p className="text-gray-600 font-medium">Failed to load data.</p>
    <button 
      onClick={() => window.location.reload()} 
      className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition"
    >
      Try Again
    </button>
  </div>
  );

  return (
    <div className="bg-[#fafafa] min-h-screen">

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="md:hidden p-4 flex items-center bg-white border-b">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-xl">
          <i className="fa-solid fa-bars"></i>
        </button>
        <h1 className="ml-4 font-bold text-[#F25278]">Stationero</h1>
      </div>
      
      {/* Header */}
      <header className="fixed top-0 left-64 right-0 h-16 flex justify-end items-center px-8 bg-white border-b border-gray-100 shadow-sm z-50">
        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer">
          <i className="fa-solid fa-user text-gray-500" onClick={() => navigate('/admin/dashboard')}></i>
        </div>
      </header>
      
      <h1 className=" pt-24 p-6 text-2xl font-bold mb-6 ml-6">Dashboard</h1>


      <div className="grid lg:grid-cols-4 gap-4 mx-6"> 
        
        {/* LEFT SECTION (col-span-3) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Cards */}
            {dashboardData.cards.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-gray-400 text-sm">{item.title}</p>
                <h2 className="text-xl font-bold mt-2">{item.value}</h2>
              </div>
            ))}
            {/* Current Sales */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-gray-400 text-sm">Current Sales</p>
              <h2 className="text-xl font-bold">{dashboardData.performance}%</h2>
              <div className="h-16 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.lineData}>
                    <Line dataKey="value" stroke="#3366ff" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-xl mb-5">Sales Overview</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.barData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#e2b7ff" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION (Pie Chart) - col-span-1 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-1">
          <h2 className="text-xl font-bold text-center mb-4">Product by Sales</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70} 
                  paddingAngle={5}
                  cornerRadius={5}
                >
                  {dashboardData.pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {dashboardData.pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
  


export default AdminDashboard;