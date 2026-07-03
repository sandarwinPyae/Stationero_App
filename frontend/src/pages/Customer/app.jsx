import React, { useState, useEffect } from 'react';
import LoginPage from './login.jsx'; 
import SignUpPage from './signup.jsx'; // RESTORED YOUR MAIN SIGNUP IMPORT
import ProductDetailPage from './productdetail.jsx'; 
import ShoppingCartPage from './shoppingcart.jsx';
import OrderPage from './order.jsx';
import ReturnsPage from './returns.jsx';
import OrderHistoryPage from './history.jsx';
import ProfilePage from './profile.jsx';
import ForgotPasswordPage from './forgotpassword.jsx';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');

  useEffect(() => {
    const savedUser = localStorage.getItem('stationero_logged_user');
    const savedScreen = localStorage.getItem('stationero_active_screen');
    const cleanScreen = savedScreen ? String(savedScreen).toLowerCase().trim() : 'login';
    
    // ---- FIXED: MASTER SHIELD ENGINE ALLOWS SIGNUP & FORGOTPASSWORD CHANNELS ----
    if (!savedUser || savedUser === "undefined") {
      // If logged out, only allow them to visit public auth screens, otherwise force login gate
      if (cleanScreen === 'signup' || cleanScreen === 'forgotpassword') {
        setCurrentScreen(cleanScreen);
      } else {
        localStorage.setItem('stationero_active_screen', 'login');
        setCurrentScreen('login');
      }
    } else if (savedScreen) {
      setCurrentScreen(cleanScreen);
    } else {
      setCurrentScreen('productdetail');
    }
  }, []);

  const handleGlobalNavigation = (targetScreen) => {
    const cleanTarget = String(targetScreen).toLowerCase().trim();
    
    if (cleanTarget === 'login') {
      localStorage.removeItem('stationero_active_screen');
      localStorage.removeItem('stationero_logged_user');
    } else {
      localStorage.setItem('stationero_active_screen', cleanTarget);
    }
    
    setCurrentScreen(cleanTarget);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', backgroundColor: '#ffffff' }}>
      
      {currentScreen === 'login' && (
        <LoginPage onNavigate={handleGlobalNavigation} />
      )}

      {currentScreen === 'signup' && (
        <SignUpPage onNavigate={handleGlobalNavigation} />
      )}

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
