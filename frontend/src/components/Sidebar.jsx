// import React, { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';

// const NavItem = ({ icon, label, active, onClick, className, isSubMenu }) => (
//   <div 
//     onClick={onClick}
//     className={`flex items-center gap-3 p-3 cursor-pointer rounded-lg transition-all duration-200 
//       ${active ? 'bg-pink-50 text-[#F25278]' : 'text-gray-700 hover:bg-gray-100'} 
//       ${isSubMenu ? 'ml-10 text-sm py-2' : ''} ${className || ''}`}
//     style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}
//   >
//     {icon && <i className={`${icon} text-lg`} style={{ fontSize: '18px', width: '20px', textAlign: 'center' }}></i>}
//     <span className="font-medium" style={{ fontWeight: '500' }}>{label}</span>
//   </div>
// );

// export default function Sidebar() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [isProductOpen, setIsProductOpen] = useState(false);
//   const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
//   const [isInventoryOpen, setIsInventoryOpen] = useState(false);
//   const [isSaleReportOpen, setIsSaleReportOpen] = useState(false);
//   const [isPurchaseReportOpen, setIsPurchaseReportOpen] = useState(false);

//   const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

//   return (
//     <div className="w-64 bg-[#F8FAFC] min-h-screen border-r border-gray-200 shadow-sm flex flex-col shrink-0" 
//          style={{ width: '256px', backgroundColor: '#F8FAFC', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', padding: '12px', boxSizing: 'border-box', minHeight: '100vh' }}>
      
//       <div className="p-6" style={{ padding: '24px 12px' }}>
//         <h1 className="text-2xl font-bold text-[#F25278]" style={{ fontSize: '24px', fontWeight: '700', color: '#F25278', margin: 0 }}>Stationero</h1>
//       </div>
      
//       <nav className="mt-4 px-3 space-y-1 flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
//         {/* <NavItem icon="fa-solid fa-chart-line" label="Dashboard" onClick={() => navigate('/admin/dashboard')} active={isActive('/admin/dashboard')} /> */}
//         <NavItem 
//           icon="fa-solid fa-chart-line" 
//           label="Dashboard" 
//           onClick={() => navigate('/admin/dashboard')} 
//           active={isActive('/admin/dashboard')} 
//         />
//         <NavItem icon="fa-solid fa-user" label="Customers" onClick={() => navigate('/customers')} active={isActive('/customers')} />
//         <NavItem icon="fa-solid fa-check-double" label="Confirmed Order" onClick={() => navigate('/confirm-orders')} active={isActive('/confirm-orders')} />
//         <NavItem icon="fa-solid fa-users" label="Suppliers" onClick={() => navigate('/suppliers')} active={isActive('/suppliers')} />
        
//         {/* Products */}
//         <NavItem 
//           icon="fa-solid fa-box" 
//           label="Products" 
//           onClick={() => {
//             setIsProductOpen(!isProductOpen);
//             navigate('/products');
//           }} 
//           active={isActive('/products') || isActive('/categories')} 
//         />
//         {isProductOpen && (
//           <NavItem icon="fa-solid fa-tags" label="Category" onClick={() => navigate('/categories')} active={isActive('/categories')} isSubMenu={true} />
//         )}
        
//         {/* Purchase */}
//         <NavItem 
//           icon="fa-solid fa-cart-shopping" 
//           label="Purchase" 
//           onClick={() => {
//             setIsPurchaseOpen(!isPurchaseOpen);
//             navigate('/purchase');
//           }}
//           active={isActive('/purchase')} 
//         />
//         {isPurchaseOpen && (
//           <NavItem icon="fa-solid fa-right-left" label="Purchase Return" onClick={() => navigate('/purchase/returns')} active={isActive('/purchase/returns')} isSubMenu={true} />
//         )}

//         {/* Inventory Reports */}
//         <NavItem 
//           icon="fa-solid fa-chart-pie" 
//           label="Inventory Reports" 
//           onClick={() => { 
//             setIsInventoryOpen(!isInventoryOpen);
//             navigate('/inventory'); 
//           }}
//           active={isActive('/inventory') || isActive('/stock-report') || isActive('/low-stock-report')} 
//         />
//         {isInventoryOpen && (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
//             <NavItem icon="fa-solid fa-layer-group" label="Stock Report" onClick={() => navigate('/stock-report')} active={isActive('/stock-report')} isSubMenu={true} />
//             <NavItem icon="fa-solid fa-exclamation-triangle" label="Low Stock Report" onClick={() => navigate('/low-stock-report')} active={isActive('/low-stock-report')} isSubMenu={true} />
//           </div>
//         )}

//         {/* Sale Reports */}
//         <NavItem icon="fa-solid fa-chart-column" label="Sale Reports" onClick={() => { setIsSaleReportOpen(!isSaleReportOpen); navigate('/sale-reports'); }} active={isActive('/sale-reports')} />
//         {isSaleReportOpen && (
//           <NavItem icon="fa-solid fa-rotate-left" label="Sale Return Report" onClick={() => navigate('/sale-return-reports')} active={isActive('/sale-return-reports')} isSubMenu={true} />
//         )}
        
//         {/* Purchase Reports */}
//         <NavItem icon="fa-solid fa-clipboard-list" label="Purchase Reports" onClick={() => { setIsPurchaseReportOpen(!isPurchaseReportOpen); navigate('/purchase-reports'); }} active={isActive('/purchase-reports')} />
//         {isPurchaseReportOpen && (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
//             <NavItem icon="fa-solid fa-file-contract" label="Purchase Return Summary" onClick={() => navigate('/purchase-return-summary')} active={isActive('/purchase-return-summary')} isSubMenu={true} />
//             <NavItem icon="fa-solid fa-truck-field" label="Supplier-wise Purchase" onClick={() => navigate('/supplier-wise')} active={isActive('/supplier-wise')} isSubMenu={true} />
//           </div>
//         )}
        
//         <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
//           <NavItem icon="fa-solid fa-right-from-bracket" label="Logout" className="text-red-500" onClick={() => console.log('Logout')} />
//         </div>
//       </nav>
//     </div>
//   );
// }