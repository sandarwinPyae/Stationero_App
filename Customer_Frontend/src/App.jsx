import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import StationeroPage from './pages/StationeroPage';
import AboutUs from './pages/AboutUs';
import ProductPage from './pages/ProductPage';
import ProductDetail from './pages/ProductDetail';
import ShoppingCart from './pages/ShoppingCart';
import LoginPage from './pages/login';
import SignupPage from './pages/signup';
import OTPVerifyPage from './pages/OTPVerifyPage';
import ForgotPasswordPage from './pages/forgotpassword';
import OrderPage from './pages/order';
import OrderHistoryPage from './pages/history';
import ReturnsPage from './pages/returns';
import ProfilePage from './pages/profile';
import OrderDetailPage from './pages/orderdetail';

// ---- FIXED: PROTECTED ROUTE CHECKS LOCAL STORAGE TO PRESERVE VIEW ON CTRL+S ----
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useContext(AuthContext);
  const hasLocalSession = localStorage.getItem('stationero_logged_user');

  // If either the context says true OR a local storage user profile exists, allow access!
  return (isLoggedIn || hasLocalSession) ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<StationeroPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-otp" element={<OTPVerifyPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><ShoppingCart /></ProtectedRoute>} />
          <Route path="/order" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
          <Route path="/returns" element={<ProtectedRoute><ReturnsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/order/:order_id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
