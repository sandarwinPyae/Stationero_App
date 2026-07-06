import React from 'react';
import { LayoutDashboard, Users, UserSquare2, Truck, Box, ShoppingBag, BarChart3, LogOut } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: true },
    { name: 'Customers', icon: Users },
    { name: 'Sale Persons', icon: UserSquare2 },
    { name: 'Suppliers', icon: Truck },
    { name: 'Products', icon: Box },
    { name: 'Purchase', icon: ShoppingBag },
    { name: 'Inventory Reports', icon: BarChart3 },
    { name: 'Sale Reports', icon: BarChart3 },
    { name: 'Purchase Reports', icon: BarChart3 },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col justify-between p-6">
      <div>
        <h1 className="text-2xl font-bold text-rose-500 mb-8 tracking-wide">Stationero</h1>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                item.active 
                  ? 'bg-rose-50 text-gray-900 font-semibold' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`h-5 w-5 ${item.active ? 'text-gray-900' : 'text-gray-400'}`} />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
      <button className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all font-medium text-sm w-full">
        <LogOut className="h-5 w-5 text-gray-400" />
        <span>Logout</span>
      </button>
    </div>
  );
}