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
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isSaleReportOpen, setIsSaleReportOpen] = useState(false);
  const [isPurchaseReportOpen, setIsPurchaseReportOpen] = useState(false);

  const isActive = (keyword) => location.pathname.toLowerCase().includes(keyword.toLowerCase());

  return (
    <div className="w-64 bg-[#F8FAFC] min-h-screen border-r border-gray-200 shadow-sm flex flex-col">
      <div className="p-6">
        <h1 className=" font-azeret text-2xl font-bold text-[#F25278]">Stationero</h1>
      </div>
      
      <nav className="mt-4 px-3 space-y-1 flex-1">
        <NavItem icon="fa-solid fa-chart-line" label="Dashboard" onClick={() => navigate('/admin/dashboard')} active={isActive('/admin/dashboard')} />
        <NavItem icon="fa-solid fa-user" label="Customers" onClick={() => navigate('/customers')} active={isActive('customer')} />
        <NavItem icon="fa-solid fa-check-double" label="Confirm Order" onClick={() => navigate('/confirm-orders')} active={isActive('confirm-order')} />
        
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
            onClick={() => navigate('/categories')} 
            active={isActive('categories')} 
            isSubMenu={true}
          />
        )}
        
        {/* Purchase */}
        <NavItem 
          icon="fa-solid fa-cart-shopping" 
          label="Purchase" 
          onClick={() => {
            navigate('/purchase');
            setIsPurchaseOpen(!isPurchaseOpen);
          }}
          // active={isActive('purchase-order') || isActive('purchase-return')} 
          active={location.pathname === '/purchase' || isActive('purchase/details/') || isActive('purchase/add')} 
        />
        {isPurchaseOpen && (
          <>
            
            <NavItem 
              icon="fa-solid fa-right-left" 
              label="Purchase Return" 
              onClick={() => navigate('/purchase/returns')} 
              active={isActive('purchase/returns')} 
              isSubMenu={true}
            />
          </>
        )}

        {/* Inventory Reports */}
        <NavItem 
          icon="fa-solid fa-chart-pie" 
          label="Inventory Reports" 
          onClick={() => { navigate('/stock-report'); setIsInventoryOpen(!isInventoryOpen); }}
          active={location.pathname === '/stock-report'} 
        />
        {isInventoryOpen && (
          <>
            {/* <NavItem icon="fa-solid fa-layer-group" label="Stock Report" onClick={() => navigate('/stock-report')} active={location.pathname === '/stock-report'} isSubMenu={true} /> */}
            <NavItem icon="fa-solid fa-exclamation-triangle" label="Low Stock Report" onClick={() => navigate('/low-stock-report')} active={location.pathname === '/low-stock-report'} isSubMenu={true} />
          </>
        )}
        {/* Sale Reports */}
        <NavItem icon="fa-solid fa-chart-column" label="Sale Reports" onClick={() => { navigate('/sale-reports'); setIsSaleReportOpen(!isSaleReportOpen); }} active={location.pathname === '/sale-reports'} />
        {isSaleReportOpen && (
          <NavItem icon="fa-solid fa-rotate-left" label="Sale Return Report" onClick={() => navigate('/sale-return-reports')} active={location.pathname === '/sale-return-reports'} isSubMenu={true} />
        )}
        
        {/* Purchase Reports */}
        <NavItem icon="fa-solid fa-clipboard-list" label="Purchase Order Summary Report" onClick={() => { navigate('/purchase-reports'); setIsPurchaseReportOpen(!isPurchaseReportOpen); }} active={location.pathname === '/purchase-reports'} />
        {isPurchaseReportOpen && (
          <>
            <NavItem icon="fa-solid fa-file-contract" label="Purchase Return Summary" onClick={() => navigate('/purchase-return-summary')} active={location.pathname === '/purchase-return-summary'} isSubMenu={true} />
            <NavItem icon="fa-solid fa-truck-field" label="Supplier-wise Purchase" onClick={() => navigate('/supplier-wise')} active={location.pathname === '/supplier-wise'} isSubMenu={true} />
          </>
        )}
        
        <div className="mt-auto pt-10">
          <NavItem 
            icon="fa-solid fa-right-from-bracket" 
            label="Logout" 
            className="text-red-500" 
            onClick={() => {
              localStorage.clear(); 
              window.location.href = 'http://localhost:5173'; 
            }} 
          />
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;