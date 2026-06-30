import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SupplierPage from './pages/admin/SupplierPage';
import AddSupplierPage from './pages/admin/AddSupplierPage';
import UpdateSupplierPage from './pages/admin/UpdateSupplierPage';

function App() {
  return (
    <Router>
      <div className="flex">
        <div className="flex-1">
          <Routes>
            <Route path="/suppliers" element={<SupplierPage />} />
            <Route path="/add-supplier" element={<AddSupplierPage />} />
            <Route path="/edit-supplier/:id" element={<UpdateSupplierPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;