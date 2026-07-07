import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// ==========================================
// 🌟 1. CUSTOMER PAGE IMPORTS (မင်း၏ Code)
// ==========================================
import StationeroPage from './pages/StationeroPage';
import AboutUs from './pages/AboutUs';
import ProductPage from './pages/ProductPage';
import ProductDetail from './pages/ProductDetail';
import ShoppingCart from './pages/ShoppingCart';
import LoginPage from './pages/login';
import SignupPage from './pages/signup';
import ForgotPasswordPage from './pages/forgotpassword';
import OrderPage from './pages/order';
import OrderHistoryPage from './pages/history';
import ReturnsPage from './pages/returns';
import ProfilePage from './pages/profile';

// ==========================================
// 🌟 2. ADMIN PAGE IMPORTS (Team Leader ၏ Code)
// ==========================================
import Sidebar from '../../components/admin/Sidebar';
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
import PurchasePage from './PurchasePage';
import AddPurchaseOrderPage from './AddPurchaseOrderPage';
import PurchaseOrderDetail from './PurchaseOrderDetail';
import PurchaseReturnsPage from './PurchaseReturnsPage';
import PurchaseReturnList from './PurchaseReturnList';
import PurchaseReturnDetails from './PurchaseReturnDetails';

// --- Conflict ရှင်းလင်းပြီးသား Admin Reports များ ---
import ConfirmedOrderPage from './ConfirmedOrderPage';
import ConfirmedOrderDetailsPage from './ConfirmedOrderDetailsPage';
import PurchaseSummary from './PurchaseSummary';
import PurchaseReturnSummary from './PurchaseReturnSummary';
import SupplierWisePurchase from './SupplierWisePurchase';
import SaleReport from './SaleReport';
import SaleReturnReport from './SaleReturnReport';
import InventoryStockReport from "./InventoryStockReport";
import LowStockReport from "./InventoryLowStockReport";

// ==========================================
// 🌟 3. AUTHENTICATION & LAYOUTS
// ==========================================

// Customer ပိုင်းအတွက် Protected Route Logic (မင်း၏ မူလ Code)
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useContext(AuthContext);
  return isLoggedIn ? children : <Navigate to="/login" />;
};

// Admin ပိုင်းအတွက် သီးသန့် Layout (Sidebar ပါဝင်မည်)
const AdminLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Outlet /> {/* ဒီနေရာမှာ Admin Routes တွေ အလုပ်လုပ်ပါမယ် */}
      </div>
    </div>
  );
};

// ==========================================
// 🌟 4. MAIN APP COMPONENT
// ==========================================
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          
          {/* ---------------------------------------------------- */}
          {/* 🔹 CUSTOMER ROUTES (Sidebar မပါသော စာမျက်နှာများ) 🔹 */}
          {/* ---------------------------------------------------- */}
          <Route path="/" element={<StationeroPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Customer Routes */}
          <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><ShoppingCart /></ProtectedRoute>} />
          <Route path="/order" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
          <Route path="/returns" element={<ProtectedRoute><ReturnsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />


          {/* ---------------------------------------------------- */}
          {/* 🔸 ADMIN ROUTES (Sidebar အမြဲပေါ်နေမည့် စာမျက်နှာများ) 🔸 */}
          {/* ---------------------------------------------------- */}
          <Route element={<AdminLayout />}>
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
            
            {/* Merged Reports & Inventory */}
            <Route path="/confirm-orders" element={<ConfirmedOrderPage />} />   
            <Route path="/confirm-orders/details/:id" element={<ConfirmedOrderDetailsPage />} />
            <Route path="/purchase-reports" element={<PurchaseSummary />} />
            <Route path="/purchase-return-summary" element={<PurchaseReturnSummary />} />
            <Route path="/supplier-wise" element={<SupplierWisePurchase />} />
            <Route path='/sale-reports' element={<SaleReport />} />
            <Route path='/sale-return-reports' element={<SaleReturnReport />} />
            <Route path="/stock-report" element={<InventoryStockReport />} /> 
            <Route path="/low-stock-report" element={<LowStockReport />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;