import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddSupplierPage = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChangeEmail = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value) && value !== "") {
        setErrors({ ...errors, email: "Invalid email format" });
      } else {
        setErrors({ ...errors, email: "" });
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/suppliers', formData);
      // alert("Supplier added successfully!");
      navigate('/suppliers');
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data. Please check your backend terminal.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* --- SIDEBAR --- */}
      {/* <div className="w-64 shadow-md bg-[#F8FAFC]">
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
      </div> */}

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1">
        {/* --- NAVBAR --- */}
        <div className="fixed top-0 left-0 md:left-64 right-0 h-16 flex justify-between items-center px-4 md:px-8 bg-white border-b border-gray-100 shadow-sm z-50">

          <button onClick={toggleSidebar} className="md:hidden text-gray-600 text-xl">
            <i className="fa-solid fa-bars"></i>
          </button>

          {/* Back Button (Left side) */}
          <button 
            onClick={() => navigate('/suppliers')}
            className="hidden sm:flex text-gray-600 hover:text-[#F25278] transition-colors font-medium items-center"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i> Back
          </button>

          {/* User Icon (Right side) */}
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border border-gray-300">
            <i className="fa-solid fa-user text-gray-600 cursor-pointer" onClick={() => navigate('/admin/dashboard')}></i>
          </div>
        </div>

        {/* --- FORM CONTENT --- */}
        <div className="p-4 md:p-8 pt-20 md:pt-20 w-full max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Supplier</h2>
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#F25278]/20" placeholder="Supplier Name" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  name="email" type="email" value={formData.email} onChange={handleChangeEmail} 
                  className={`w-full mt-1 p-2.5 border rounded-lg outline-none focus:ring-2 ${errors.email ? 'border-red-500' : 'border-gray-200 focus:ring-[#F25278]/20'}`} 
                  placeholder="email@gmail.com" 
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input name="phone" type="text" value={formData.phone} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#F25278]/20" placeholder="09xxxxxxxxx" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} className="w-full mt-1 p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#F25278]/20" rows="3"></textarea>
              </div>

              <button 
                onClick={handleSave} 
                disabled={errors.email !== "" || !formData.name || !formData.email || !formData.phone || !formData.address}
                className={`text-white px-8 py-2.5 rounded-lg font-semibold mt-4 w-full transition-all ${
                  (errors.email !== "" || !formData.name || !formData.email || !formData.phone || !formData.address) 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-[#F25278]'
                }`}
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