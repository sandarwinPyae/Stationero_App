import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const UpdateSupplierPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // URL ထဲက id ကို ယူသည်
  const [formData, setFormData] = useState({
    supplier_name: '',
    supplier_email: '',
    supplier_phone_no: '',
    supplier_address: ''
  });

  // Page စတက်တာနဲ့ Data ကို ID နဲ့ လှမ်းခေါ်ခြင်း
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/suppliers/${id}`);
        setFormData(response.data);
      } catch (error) {
        console.error("Error fetching supplier:", error);
      }
    };
    fetchSupplier();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/suppliers/${id}`, formData);
      alert("Supplier updated successfully!");
      navigate('/suppliers');
    } catch (error) {
      console.error("Error updating data:", error);
      alert("Failed to update data.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* SIDEBAR */}
      {/* <div className="w-64 bg-white border-r border-gray-100 flex-shrink-0">
        <div className="p-8"><h1 className="text-2xl font-bold text-[#F25278]">Stationero</h1></div>
        <nav className="mt-4 px-3 space-y-1">
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

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 flex justify-between items-center px-8 bg-[#F8FAFC] shadow-sm">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-[#F25278] flex items-center">
            <i className="fa-solid fa-arrow-left mr-2"></i> Back
          </button>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
            <i className="fa-solid fa-user text-gray-500"></i>
          </div>
        </header>

        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6">Update Supplier</h2>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input name="supplier_name" type="text" value={formData.supplier_name} onChange={handleChange} className="w-full mt-1 p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#F25278]/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input name="supplier_email" type="email" value={formData.supplier_email} onChange={handleChange} className="w-full mt-1 p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#F25278]/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input name="supplier_phone_no" type="text" value={formData.supplier_phone_no} onChange={handleChange} className="w-full mt-1 p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#F25278]/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea name="supplier_address" value={formData.supplier_address} onChange={handleChange} className="w-full mt-1 p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#F25278]/20" rows="3"></textarea>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="submit" className="bg-[#F25278] hover:bg-[#e04a6d] text-white px-8 py-2.5 rounded-lg font-semibold shadow-md shadow-[#F25278]/20">
                  Update Infos
                </button>
                <button 
                type="button" 
                onClick={() => setFormData({
                    supplier_name: '',
                    supplier_email: '',
                    supplier_phone_no: '',
                    supplier_address: ''
                })} 
                className="bg-gray-100 text-gray-700 px-8 py-2.5 rounded-lg font-semibold hover:bg-gray-200"
                >
                Clear
                </button>
              </div>
            </form>
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
export default UpdateSupplierPage;
