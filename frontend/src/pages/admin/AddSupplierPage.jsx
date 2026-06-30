import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddSupplierPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/suppliers', formData);
      alert("Supplier added successfully!");
      navigate('/suppliers');
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data. Please check your backend terminal.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* --- SIDEBAR --- */}
      <div className="w-64 shadow-md bg-[#F8FAFC]">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#F25278]">Stationero</h1>
        </div>
        <nav className="mt-4">
          <NavItem icon="fa-solid fa-chart-line" label="Dashboard" />
          <NavItem icon="fa-solid fa-user" label="Customers" />
          <NavItem icon="fa-solid fa-check-double" label="Confirm Order" />
          <NavItem icon="fa-solid fa-users" label="Suppliers" active color="#F25278" />
          <NavItem icon="fa-solid fa-box" label="Products" />
          <NavItem icon="fa-solid fa-cart-shopping" label="Purchase" />
          <NavItem icon="fa-solid fa-chart-pie" label="Inventory Reports" />
          <NavItem icon="fa-solid fa-chart-column" label="Sale Reports" />
          <NavItem icon="fa-solid fa-clipboard-list" label="Purchase Reports" />
          <NavItem icon="fa-solid fa-right-from-bracket" label="Logout" className="mt-10 text-red-500" />
        </nav>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1">
        {/* --- NAVBAR --- */}
        <div className="h-16 flex justify-between items-center px-8 shadow-sm bg-[#F8FAFC]">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/suppliers')}
            className="text-gray-600 hover:text-[#F25278] transition-colors font-medium flex items-center"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i> Back
          </button>
          
          {/* User Icon */}
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border border-gray-300">
            <i className="fa-solid fa-user text-gray-600"></i>
          </div>
        </div>

        {/* --- FORM CONTENT --- */}
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6">Add Supplier</h2>
          <div className="bg-white p-8 rounded-lg shadow-sm max-w-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full mt-1 p-2 border rounded" placeholder="Supplier Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full mt-1 p-2 border rounded" placeholder="email@gmail.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input name="phone" type="text" value={formData.phone} onChange={handleChange} className="w-full mt-1 p-2 border rounded" placeholder="09xxxxxxxxx" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} className="w-full mt-1 p-2 border rounded" rows="3"></textarea>
              </div>
              <button 
                onClick={handleSave} 
                className="text-white px-8 py-2 rounded-md font-semibold mt-4 w-full sm:w-auto" 
                style={{ backgroundColor: '#F25278' }}
              >
                Save Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, color = "", className = "" }) => (
  <div className={`flex items-center p-4 cursor-pointer ${className}`} style={{ backgroundColor: active ? '#E2E8F0' : 'transparent', borderRight: active ? `4px solid ${color}` : 'none' }}>
    <span className="mr-4 text-lg w-6 text-center"><i className={icon}></i></span>
    <span className="text-gray-700 font-medium">{label}</span>
  </div>
);

export default AddSupplierPage;