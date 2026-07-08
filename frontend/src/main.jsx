import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './Dashboard.jsx';
import Customers from './Customers.jsx';
import './index.css';

// ==========================================
// 1. IMPORT YOUR ADMIN PAGES FROM SUBFOLDER
// ==========================================
import SupplierPage from './pages/admin/supplierPage';
import AddSupplierPage from './pages/admin/AddSupplierPage';
import UpdateSupplierPage from './pages/admin/UpdateSupplierPage';
import ProductList from './pages/admin/ProductList'; 
import AddProductPage from './pages/admin/AddProductPage';
import ViewProductDetails from './pages/admin/ViewProductDetails';
import UpdateProductPage from './pages/admin/UpdateProductPage';
import CategoryList from './pages/admin/CategoryList';
import AddCategoryPage from './pages/admin/AddCategoryPage';
import UpdateCategoryPage from './pages/admin/UpdateCategoryPage';
import PurchasePage from './pages/admin/PurchasePage';
import AddPurchaseOrderPage from './pages/admin/AddPurchaseOrderPage';
import PurchaseOrderDetail from './pages/admin/PurchaseOrderDetail';
import PurchaseReturnsPage from './pages/admin/PurchaseReturnsPage';
import PurchaseReturnList from './pages/admin/PurchaseReturnList';
import PurchaseReturnDetails from './pages/admin/PurchaseReturnDetails';
import ConfirmedOrderPage from './pages/admin/ConfirmedOrderPage';
import ConfirmedOrderDetailsPage from './pages/admin/ConfirmedOrderDetailsPage';
import PurchaseSummary from './pages/admin/PurchaseSummary';
import PurchaseReturnSummary from './pages/admin/PurchaseReturnSummary';
import SupplierWisePurchase from './pages/admin/SupplierWisePurchase';
import SaleReport from './pages/admin/SaleReport';
import SaleReturnReport from './pages/admin/SaleReturnReport';
import InventoryStockReport from "./pages/admin/InventoryStockReport";
import LowStockReport from "./pages/admin/InventoryLowStockReport";

function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      <Sidebar />
      <Routes>
        {/* Existing merged base routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        {/* ==========================================
            2. ADDED YOUR SUBFOLDER ADMIN PAGES HERE
           ========================================== */}
        <Route path="/suppliers" element={<SupplierPage />} />
        <Route path="/add-supplier" element={<AddSupplierPage />} />
        <Route path="/edit-supplier/:id" element={<UpdateSupplierPage />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/add-product" element={<AddProductPage />} />
        <Route path="/view-product/:id" element={<ViewProductDetails />} />
        <Route path="/edit-product/:id" element={<UpdateProductPage />} />
        <Route path="/categories" element={<CategoryList />} />
        <Route path="/categories/:id" element={<UpdateCategoryPage />} />
        <Route path="/categories/add" element={<AddCategoryPage />} />
        <Route path='/purchase' element={<PurchasePage />} />
        <Route path="/purchase/add" element={<AddPurchaseOrderPage />} />
        <Route path="/purchase/details/:id" element={<PurchaseOrderDetail />} />
        <Route path="/purchase/returns/:id" element={<PurchaseReturnsPage />} />   
        <Route path='/purchase/returns' element={<PurchaseReturnList/>} />     
        <Route path="/purchase/return/details/:id" element={<PurchaseReturnDetails />} /> 
        <Route path="/confirm-orders" element={<ConfirmedOrderPage />} />   
        <Route path="/confirm-orders/details/:id" element={<ConfirmedOrderDetailsPage />} />
        <Route path="/purchase-reports" element={<PurchaseSummary />} />
        <Route path="/purchase-return-summary" element={<PurchaseReturnSummary />} />
        <Route path="/supplier-wise" element={<SupplierWisePurchase />} />
        <Route path='/sale-reports' element={<SaleReport />} />
        <Route path='/sale-return-reports' element={<SaleReturnReport />} />
        <Route path="/stock-report" element={<InventoryStockReport />} /> 
        <Route path="/low-stock-report" element={<LowStockReport />} />

                {/* Wildcard remains at the very bottom for any truly missing pages */}
        <Route path="*" element={
          <div style={{ padding: '40px', color: '#64748B' }}>
            <h3>Teammate Component Workspace Placeholder</h3>
            <p>This module interface will render dynamically when its respective code is pulled.</p>
          </div>
        } />
      </Routes>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  </React.StrictMode>,
);