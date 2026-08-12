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
      
      <h1 className="pt-24 px-6 text-2xl font-bold mb-6 ml-6">Dashboard</h1>

      <div className="mx-6 pb-12 space-y-6"> 
        
        {/* TOP ROW: Cards & Current Sales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardData.cards.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <p className="text-gray-400 text-sm">{item.title}</p>
              <h2 className="text-xl font-bold mt-2">{item.value}</h2>
            </div>
          ))}
          {/* Current Sales */}
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
            <p className="text-gray-400 text-sm">Current Sales</p>
            <h2 className="text-xl font-bold">{dashboardData.performance}%</h2>
            <div className="h-10 mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.lineData}>
                  <Line dataKey="value" stroke="#3366ff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: Charts Grid (Daily Sales, Monthly Sales, and Pie Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Daily Sales Overview Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 lg:col-span-1.5">
            <h2 className="font-bold text-lg mb-4">Daily Sales Overview</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.barData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#e2b7ff" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Sales Overview Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 lg:col-span-1.5">
            <h2 className="font-bold text-lg mb-4">Monthly Sales Overview</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.monthlyBarData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#ff5a8a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product by Sales (Pie Chart) */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 lg:col-span-1 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-center mb-2">Product by Sales</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60} 
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
            </div>
            <div className="space-y-2 mt-2">
              {dashboardData.pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-gray-600 truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;