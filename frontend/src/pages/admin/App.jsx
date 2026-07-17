
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SupplierPage from './supplierPage';
import AddSupplierPage from './AddSupplierPage';
import UpdateSupplierPage from './UpdateSupplierPage';
import ProductList from './ProductList'; 
import AddProductPage from './AddProductPage';
import ViewProductDetails from './ViewProductDetails';
import UpdateProductPage from './UpdateProductPage';
import CategoryList from './CategoryList';
import AddCategoryPage from './AddCategoryPage';
import UpdateCategoryPage from './UpdateCategoryPage';
import Sidebar from '../../components/admin/Sidebar';
import PurchasePage from './PurchasePage';
import AddPurchaseOrderPage from './AddPurchaseOrderPage';
import PurchaseOrderDetail from './PurchaseOrderDetail';
import PurchaseReturnsPage from './PurchaseReturnsPage';
import PurchaseReturnList from './PurchaseReturnList';
import PurchaseReturnDetails from './PurchaseReturnDetails';

import ConfirmedOrderPage from './ConfirmedOrderPage';
import ConfirmedOrderDetailsPage from './ConfirmedOrderDetailsPage';
import PurchaseSummary from './PurchaseSummary';
import PurchaseReturnSummary from './PurchaseReturnSummary';
import SupplierWisePurchase from './SupplierWisePurchase';
import SaleReport from './SaleReport';
import SaleReturnReport from './SaleReturnReport';

import InventoryStockReport from "./InventoryStockReport";
import LowStockReport from "./InventoryLowStockReport";
import AdminDashboard from './Admin_Dashboard';
import CustomerPage from './CustomerPage';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  return (
    <Router>
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        
        <div className="flex-1 w-full md:ml-64 transition-all duration-300">
          <Routes>
            <Route path="/suppliers" element={<SupplierPage toggleSidebar={toggleSidebar}/>} />
            <Route path="/add-supplier" element={<AddSupplierPage toggleSidebar={toggleSidebar}/>} />
            <Route path="/edit-supplier/:id" element={<UpdateSupplierPage toggleSidebar={toggleSidebar} />} />
            <Route path="/products" element={<ProductList toggleSidebar={toggleSidebar}/>} />
            <Route path="/add-product" element={<AddProductPage toggleSidebar={toggleSidebar}/>} />
            <Route path="/view-product/:id" element={<ViewProductDetails toggleSidebar={toggleSidebar}/>} />
            <Route path="/edit-product/:id" element={<UpdateProductPage toggleSidebar={toggleSidebar} />} />
            <Route path="/categories" element={<CategoryList toggleSidebar={toggleSidebar}/>} />
            <Route path="/categories/:id" element={<UpdateCategoryPage toggleSidebar={toggleSidebar}/>} />
            <Route path="/categories/add" element={<AddCategoryPage toggleSidebar={toggleSidebar}/>} />
            <Route path='/purchase' element={<PurchasePage toggleSidebar={toggleSidebar}/>} />
            <Route path="/purchase/add" element={<AddPurchaseOrderPage toggleSidebar={toggleSidebar}/>} />
            <Route path="/purchase/details/:id" element={<PurchaseOrderDetail toggleSidebar={toggleSidebar}/>} />
            <Route path="/purchase/returns/:id" element={<PurchaseReturnsPage toggleSidebar={toggleSidebar}/>} />   
            <Route path='/purchase/returns' element={<PurchaseReturnList toggleSidebar={toggleSidebar}/>} />     
            <Route path="/purchase/return/details/:id" element={<PurchaseReturnDetails toggleSidebar={toggleSidebar}/>} /> 
            
            <Route path="/confirm-orders" element={<ConfirmedOrderPage toggleSidebar={toggleSidebar}/>} />   
            <Route path="/confirm-orders/details/:id" element={<ConfirmedOrderDetailsPage toggleSidebar={toggleSidebar}/>} />
            <Route path="/purchase-reports" element={<PurchaseSummary toggleSidebar={toggleSidebar}/>} />
            <Route path="/purchase-return-summary" element={<PurchaseReturnSummary toggleSidebar={toggleSidebar}/>} />
            <Route path="/supplier-wise" element={<SupplierWisePurchase toggleSidebar={toggleSidebar}/>} />
            <Route path='/sale-reports' element={<SaleReport toggleSidebar={toggleSidebar}/>} />
            <Route path='/sale-return-reports' element={<SaleReturnReport toggleSidebar={toggleSidebar}/>} />
            <Route path="/stock-report" element={<InventoryStockReport toggleSidebar={toggleSidebar}/>} /> 
            <Route path="/low-stock-report" element={<LowStockReport toggleSidebar={toggleSidebar}/>} />
            
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/customers" element={<CustomerPage toggleSidebar={toggleSidebar} />} />

          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;