import React, { useState, useEffect } from 'react';
import Pagination from './components/Pagination';


export default function Customers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const PAGE_LIMIT = 5;

  const refreshCustomers = () => {
    setIsLoading(true);
    let targetUrl = `http://127.0.0.1:8000/api/v1/customers?page=${currentPage}&limit=${PAGE_LIMIT}`;
    if (searchQuery) targetUrl += `&search=${encodeURIComponent(searchQuery)}`;

    fetch(targetUrl)
      .then(res => res.json())
      .then(data => {
        setCustomers(data.items || []);
        setTotalPages(data.total_pages || 5);
        setIsLoading(false);
      })
      .catch(() => {
        setCustomers([
          { id: "SLD00001", name: "Hsu Myat", address: "Insein, Yangon", email: "hsu@gmai.com", phone: "09876543211" },
          { id: "SLD00002", name: "Meeni", address: "Insein, Yangon", email: "meeni@gamil.com", phone: "09876543211" },
          { id: "SLD00003", name: "Win War", address: "Insein, Yangon", email: "winwar@gmail.com", phone: "09876543211" },
          { id: "SLD00004", name: "Kaung", address: "Insein, Yangon", email: "kaungh@gmail.com", phone: "09876543211" },
          { id: "SLD00005", name: "Pyae", address: "Insein, Yangon", email: "pyae5@gmail.com", phone: "09876543211" }
        ]);
        setIsLoading(false);
      });
  };

  useEffect(() => { refreshCustomers(); }, [currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    refreshCustomers();
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete record ${id}?`)) {
      fetch(`http://127.0.0.1:8000/api/v1/customers/${id}`, { method: 'DELETE' })
        .then(() => refreshCustomers())
        .catch(err => console.error("Error executing delete:", err));
    }
  };

  return (
    <main style={{ flex: 1, padding: '40px', boxSizing: 'border-box', backgroundColor: '#FAFAFA', overflowY: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px' }}>👤</div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '20px', marginBottom: '36px' }}>
          <input 
            type="text" 
            placeholder="Search Customer" 
            style={{ width: '460px', padding: '14px 24px', borderRadius: '30px', border: 'none', backgroundColor: '#EBEBEB', outline: 'none', fontSize: '16px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" style={{ padding: '14px 36px', borderRadius: '24px', backgroundColor: '#F25278', color: 'white', border: 'none', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>
            Search
          </button>
        </form>

        <div style={{ width: '100%', marginBottom: '40px' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#EBEBEB' }}>
                <th style={{ padding: '16px 20px', borderRadius: '12px 0 0 12px', color: '#1E293B', fontWeight: '600', width: '120px' }}>ID</th>
                <th style={{ padding: '16px 20px', color: '#1E293B', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '16px 20px', color: '#1E293B', fontWeight: '600' }}>Address</th>
                <th style={{ padding: '16px 20px', color: '#1E293B', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '16px 20px', color: '#1E293B', fontWeight: '600' }}>Phone Number</th>
                <th style={{ padding: '16px 20px', borderRadius: '0 12px 12px 0', color: '#1E293B', fontWeight: '600', textAlign: 'center', width: '100px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((user) => (
                <tr key={user.id} style={{ backgroundColor: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <td style={{ padding: '20px', borderRadius: '12px 0 0 12px', fontWeight: '500' }}>{user.id}</td>
                  <td style={{ padding: '20px' }}>{user.name}</td>
                  <td style={{ padding: '20px' }}>{user.address}</td>
                  <td style={{ padding: '20px' }}><span style={{ color: '#1E293B', textDecoration: 'underline' }}>{user.email}</span></td>
                  <td style={{ padding: '20px' }}>{user.phone}</td>
                  <td style={{ padding: '20px', borderRadius: '0 12px 12px 0', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleDelete(user.id)} 
                      style={{ border: 'none', background: '#F25278', color: 'white', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <i className="fa-solid fa-trash-can" style={{ fontSize: '14px' }}></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 2. Replaced old markup block with cleaner shared component instance */}
        <Pagination 
          totalItems={totalPages * PAGE_LIMIT} 
          itemsPerPage={PAGE_LIMIT} 
          currentPage={currentPage} 
          onPageChange={(page) => setCurrentPage(page)} 
        />
      </div>
    </main>
  );
}