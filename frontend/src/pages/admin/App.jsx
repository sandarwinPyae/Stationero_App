import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SupplierPage from './supplierPage';
import AddSupplierPage from './AddSupplierPage';
import UpdateSupplierPage from './UpdateSupplierPage';
import ProductList from './ProductList'; 
import Sidebar from '../../components/admin/Sidebar';

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
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;