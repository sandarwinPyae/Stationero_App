import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext";

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

const LogoutModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-80 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-red-100 text-[#F25278] rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Logout</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-[#F25278] text-white rounded-lg">Logout</button>
        </div>
      </div>
    </div>
  );
};


const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isProductOpen, setIsProductOpen] = useState(true);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isSaleReportOpen, setIsSaleReportOpen] = useState(false);
  const [isPurchaseReportOpen, setIsPurchaseReportOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const isActive = (keyword) => location.pathname.toLowerCase().includes(keyword.toLowerCase());

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('stationero_logged_user');
    window.location.href = 'http://localhost:5173';
  };

  return (
    <>
      {/* Mobile Backdrop - Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 md:hidden z-40" 
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar Container */}
      <div div className={`w-64 bg-[#F8FAFC] h-screen border-r border-gray-200 shadow-sm flex flex-col fixed left-0 top-0 overflow-y-auto z-50 transition-transform duration-300 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        
        <div className="py-4 px-6 flex justify-between items-center">
          <h1 className="font-azeret text-2xl font-bold text-[#F25278]">Stationero</h1>
          <button onClick={toggleSidebar} className="md:hidden text-gray-500">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <nav className="mt-2 px-3 space-y-1 flex-1">
          <NavItem icon="fa-solid fa-chart-line" label="Dashboard" onClick={() => { navigate('/admin/dashboard'); toggleSidebar(); }} active={isActive('/admin/dashboard')} />
          <NavItem icon="fa-solid fa-user" label="Customers" onClick={() => { navigate('/customers'); toggleSidebar(); }} active={isActive('customer')} />
          <NavItem icon="fa-solid fa-check-double" label="Confirm Order" onClick={() => { navigate('/confirm-orders'); toggleSidebar(); }} active={isActive('confirm-order')} />
          <NavItem icon="fa-solid fa-users" label="Suppliers" onClick={() => { navigate('/suppliers'); toggleSidebar(); }} active={isActive('supplier')} />
          
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
              onClick={() => setIsLogoutOpen(true)} 
            />
          </div>
        </nav>

        <LogoutModal 
          isOpen={isLogoutOpen} 
          onConfirm={handleLogout} 
          onCancel={() => setIsLogoutOpen(false)} 
        />
      </div>
    </>
  );
};

export default Sidebar;