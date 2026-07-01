import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavItem = ({ icon, label, active, onClick, className, isSubMenu }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 p-3 cursor-pointer rounded-lg transition-all duration-200 
      ${active ? 'bg-pink-50 text-[#F25278]' : 'text-gray-700 hover:bg-gray-100'} 
      ${isSubMenu ? 'ml-10 text-sm py-2' : ''} ${className}`}
  >
    {icon && <i className={`${icon} text-lg`}></i>}
    <span className="font-medium">{label}</span>
  </div>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProductOpen, setIsProductOpen] = useState(true);

  const isActive = (keyword) => location.pathname.toLowerCase().includes(keyword.toLowerCase());

  return (
    <div className="w-64 bg-[#F8FAFC] min-h-screen border-r border-gray-200 shadow-sm flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#F25278]">Stationero</h1>
      </div>
      
      <nav className="mt-4 px-3 space-y-1 flex-1">
        <NavItem icon="fa-solid fa-chart-line" label="Dashboard" onClick={() => navigate('/dashboard')} active={isActive('dashboard')} />
        <NavItem icon="fa-solid fa-user" label="Customers" onClick={() => navigate('/customers')} active={isActive('customer')} />
        <NavItem icon="fa-solid fa-check-double" label="Confirm Order" onClick={() => navigate('/orders')} active={isActive('order')} />
        
        <NavItem icon="fa-solid fa-users" label="Suppliers" onClick={() => navigate('/suppliers')} active={isActive('supplier')} color="#F25278" />
        
        {/* Products */}
        <NavItem 
          icon="fa-solid fa-box" 
          label="Products" 
          onClick={() => {
            setIsProductOpen(!isProductOpen);
            navigate('/products');
          }} 
          active={isActive('product')} 
        />
        
        {/* Sub-menu (Category) */}
        {isProductOpen && (
          <NavItem 
            icon="fa-solid fa-tags" 
            label="Category" 
            onClick={() => navigate('/category')} 
            active={isActive('category')} 
            isSubMenu={true}
          />
        )}
        
        <NavItem icon="fa-solid fa-cart-shopping" label="Purchase" onClick={() => navigate('/purchase')} active={isActive('purchase')} />
        <NavItem icon="fa-solid fa-chart-pie" label="Inventory Reports" onClick={() => navigate('/inventory')} active={isActive('inventory')} />
        <NavItem icon="fa-solid fa-chart-column" label="Sale Reports" onClick={() => navigate('/sales')} active={isActive('sale')} />
        <NavItem icon="fa-solid fa-clipboard-list" label="Purchase Reports" onClick={() => navigate('/purchase-reports')} active={isActive('purchase-reports')} />
        
        <div className="mt-auto pt-10">
          <NavItem icon="fa-solid fa-right-from-bracket" label="Logout" className="text-red-500" onClick={() => console.log('Logout')} />
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;