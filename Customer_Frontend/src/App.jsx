import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// =====================================================================
// 🌟 1. CUSTOMER PAGE IMPORTS (မင်း၏ မူလလမ်းကြောင်းများ)
// =====================================================================
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

// =====================================================================
// 🌟 2. ADMIN PAGE & COMPONENT IMPORTS (Folder Structure အသစ်အတိုင်း ချိတ်ဆက်ခြင်း)
// =====================================================================
import Sidebar from './components/admin/Sidebar';
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

// Reports & Inventory Pages
import ConfirmedOrderPage from './pages/admin/ConfirmedOrderPage';
import ConfirmedOrderDetailsPage from './pages/admin/ConfirmedOrderDetailsPage';
import PurchaseSummary from './pages/admin/PurchaseSummary';
import PurchaseReturnSummary from './pages/admin/PurchaseReturnSummary';
import SupplierWisePurchase from './pages/admin/SupplierWisePurchase';
import SaleReport from './pages/admin/SaleReport';
import SaleReturnReport from './pages/admin/SaleReturnReport';
import InventoryStockReport from "./pages/admin/InventoryStockReport";
import LowStockReport from "./pages/admin/InventoryLowStockReport";

// =====================================================================
// 🌟 3. AUTHENTICATION & LAYOUT MANAGEMENT
// =====================================================================
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useContext(AuthContext);
  return isLoggedIn ? children : <Navigate to="/login" />;
};

// Admin Pages များအတွက်သာ Sidebar သီးသန့် ပြသပေးမည့် Layout
const AdminLayout = () => {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* 🌟 Sidebar ကြီး အမြဲတမ်း ဘေးတွင် ပေါ်နေစေရန် သတ်မှတ်ခြင်း */}
      <Sidebar />
      <div className="flex-1 p-6">
        <Outlet /> 
      </div>
    </div>
  );
};

// =====================================================================
// 🌟 4. MAIN APP ROUTING ENGINE
// =====================================================================
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
          {/* 🔸 ADMIN ROUTES (Sidebar အမြဲတမ်း ပေါ်နေမည့် စာမျက်နှာများ) 🔸 */}
          {/* ---------------------------------------------------- */}
          <Route element={<AdminLayout />}>
            {/* 🌟 /admin ဟု ခေါ်ပါက No Route Matched မဖြစ်စေဘဲ Category List သို့ တိုက်ရိုက် Auto-Redirect လုပ်ပေးခြင်း */}
            <Route path="/admin" element={<Navigate to="/categories" replace />} />
            
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
            
            {/* Reports & Inventory Control Panel */}
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