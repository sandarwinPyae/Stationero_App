import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './Dashboard.jsx';
import Customers from './Customers.jsx';
import './index.css';

function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
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