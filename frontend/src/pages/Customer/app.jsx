import React, { useState, useEffect } from 'react';
import LoginPage from './login.jsx'; 
import ProductDetailPage from './productdetail.jsx'; // Your main product component asset sheet
import ShoppingCartPage from './shoppingcart.jsx';
import OrderPage from './order.jsx';
import ReturnsPage from './returns.jsx';
import OrderHistoryPage from './history.jsx';
import ProfilePage from './profile.jsx';
import ForgotPasswordPage from './forgotpassword.jsx';

function App() {
  // Safe baseline fallback screen context target string configuration
  const [currentScreen, setCurrentScreen] = useState('login');

  useEffect(() => {
    const savedScreen = localStorage.getItem('stationero_active_screen');
    if (savedScreen) {
      setCurrentScreen(savedScreen);
    }
  }, []);

  const handleGlobalNavigation = (targetScreen) => {
    const cleanTarget = String(targetScreen).toLowerCase().trim();
    localStorage.setItem('stationero_active_screen', cleanTarget);
    setCurrentScreen(cleanTarget);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', backgroundColor: '#ffffff' }}>
      
      {/* Mounts your Login entry card page panel */}
      {currentScreen === 'login' && (
        <LoginPage onNavigate={handleGlobalNavigation} />
      )}

      {/* FIXED: Binds both lowercase string targets to your main product component */}
      {(currentScreen === 'product' || currentScreen === 'productdetail') && (
        <ProductDetailPage onNavigate={handleGlobalNavigation} />
      )}

      {currentScreen === 'cart' && (
        <ShoppingCartPage onNavigate={handleGlobalNavigation} />
      )}

      {currentScreen === 'order' && (
        <OrderPage onNavigate={handleGlobalNavigation} />
      )}

      {currentScreen === 'returns' && (
        <ReturnsPage onNavigate={handleGlobalNavigation} />
      )}

      {currentScreen === 'history' && (
        <OrderHistoryPage onNavigate={handleGlobalNavigation} />
      )}

      {currentScreen === 'profile' && (
        <ProfilePage onNavigate={handleGlobalNavigation} />
      )}

      {currentScreen === 'forgotpassword' && (
        <ForgotPasswordPage onNavigate={handleGlobalNavigation} />
      )}

    </div>
  );
}

export default App;
