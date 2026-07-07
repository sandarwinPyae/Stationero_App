import React from 'react';
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


function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1">
          <Routes>
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
            
            <Route path="/purchase/return/details/:id" element={<PurchaseReturnDetails />} />   
            <Route path="/stock-report" element={<InventoryStockReport />} /> 
            <Route path="/low-stock-report" element={<LowStockReport />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;