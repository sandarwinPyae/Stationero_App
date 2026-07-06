import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, CheckCircle, Truck, Box, ShoppingBag, 
  BarChart3, LogOut, ChevronDown, Trash2, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';

const pieData = [
  { name: 'Notebooks', value: 30, color: '#F43F5E' },
  { name: 'Pens', value: 20, color: '#3C2A21' },
  { name: 'Paper', value: 15, color: '#A7727D' },
  { name: 'Others', value: 35, color: '#FBC5B5' }
];

const barData = [
  { name: 'Mar 1 - 7', sales: 50000 },
  { name: 'Mar 8 - 14', sales: 125000 },
  { name: 'Mar 15 - 21', sales: 125000 },
  { name: 'Mar 22 - 28', sales: 125000 },
  { name: 'Final wk', sales: 190000 }
];

const sparklineData = [{ v: 10 }, { v: 15 }, { v: 12 }, { v: 25 }, { v: 18 }, { v: 30 }];

export default function App() {
  const [activeTab, setActiveTab] = useState('Customers');
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Real Server Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_LIMIT = 5; // Matches backend default limit size per screen view

  const [metrics, setMetrics] = useState({ total_sales: 0, total_products: 0, top_product: "Loading...", current_sales_pct: 0 });

  // Unchanged dashboard metrics pull
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/dashboard/metrics")
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(err => console.error(err));
  }, []);

  // Fetch paginated customers based on dynamic state dependencies
  const refreshCustomers = () => {
    setIsLoading(true);
    let targetUrl = `http://127.0.0.1:8000/api/v1/customers?page=${currentPage}&limit=${PAGE_LIMIT}`;
    if (searchQuery) {
      targetUrl += `&search=${encodeURIComponent(searchQuery)}`;
    }

    fetch(targetUrl)
      .then(res => res.json())
      .then(data => {
        setCustomers(data.items || []);
        setTotalPages(data.total_pages || 1);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    refreshCustomers();
  }, [activeTab, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Back to page 1 on fresh search query criteria execution
    refreshCustomers();
  };

  // Unchanged structural deletion handler logic sequence
  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete record ${id}?`)) {
      fetch(`http://127.0.0.1:8000/api/v1/customers/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
          // If deleting the last item on a page, snap back a page if possible
          if (customers.length === 1 && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
          } else {
            refreshCustomers();
          }
        })
        .catch(err => console.error(err));
    }
  };

  return (
    <div className="flex min-h-screen">
      
      {/* SIDEBAR CONTAINER */}
      <aside className="sidebar flex flex-col justify-between shrink-0">
        <div>
          <div className="sidebar-logo">Stationero</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { name: 'Dashboard', icon: LayoutDashboard },
              { name: 'Customers', icon: Users },
              { name: 'Confirmed Order', icon: CheckCircle },
              { name: 'Suppliers', icon: Truck },
              { name: 'Products', icon: Box },
              { name: 'Purchase', icon: ShoppingBag },
              { name: 'Inventory Reports', icon: BarChart3 },
              { name: 'Sale Reports', icon: BarChart3 },
              { name: 'Purchase Reports', icon: BarChart3 },
            ].map((item) => (
              <button 
                key={item.name} 
                onClick={() => setActiveTab(item.name)}
                className={`nav-btn ${activeTab === item.name ? 'active' : ''}`}
              >
                <item.icon style={{ width: '18px', height: '18px' }} />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
        <button className="nav-btn" style={{ marginTop: 'auto' }}>
          <LogOut style={{ width: '18px', height: '18px' }} />
          <span>Logout</span>
        </button>
      </aside>

      {/* WORKSPACE ELEMENT WINDOW */}
      <main className="flex-1 main-content">
        <header className="flex justify-between items-center header-row">
          <h2 className="header-title">{activeTab}</h2>
          <div className="avatar">👤</div>
        </header>

        {activeTab === 'Dashboard' && (
          <>
            <div className="dashboard-grid">
              <div className="cards-subgrid">
                <div className="dashboard-card"><p className="card-label">Total Sales</p><h3 className="card-value">{metrics.total_sales.toLocaleString()}<span className="card-unit">MMK</span></h3></div>
                <div className="dashboard-card"><p className="card-label">Total Product by Sales</p><h3 className="card-value">{metrics.total_products.toLocaleString()}</h3></div>
                <div className="dashboard-card"><p className="card-label">Top Product by Sales</p><h3 className="card-value" style={{ fontSize: '20px' }}>{metrics.top_product}</h3></div>
                <div className="dashboard-card" style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <div className="flex flex-col justify-between" style={{ height: '100%' }}><p className="card-label">Current Sales</p><h3 className="card-value">{metrics.current_sales_pct}%</h3></div>
                  <div style={{ width: '80px', height: '40px', marginLeft: 'auto', alignSelf: 'flex-end' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparklineData}><Area type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2} fill="none" /></AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="dashboard-card" style={{ alignItems: 'center', minHeight: 'auto' }}>
                <h3 className="chart-card-title">Product by Sales</h3>
                <div style={{ width: '100%', height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
                        const RADIAN = Math.PI / 180; const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN); const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (<text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '10px', fontWeight: '600' }}><tspan x={x} dy="-4">{value}%</tspan><tspan x={x} dy="12">{name}</tspan></text>);
                      }}>{pieData.map((e, i) => <Cell key={`c-${i}`} fill={e.color} stroke={e.color} />)}</Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="timeline-card">
              <div className="timeline-filter"><span>Last 30 days</span><ChevronDown style={{ width: '12px', height: '12px' }} /></div>
              <div style={{ width: '100%', height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={40}>
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 200000]} ticks={[0, 50000, 100000, 150000, 200000]} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} /><Bar dataKey="sales" fill="#E8D5FF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab === 'Customers' && (
          <div className="customers-container">
            
            {/* CLEAN UNIFIED SEARCH FORM */}
            <form onSubmit={handleSearchSubmit} className="search-row" style={{ maxWidth: '700px' }}>
              <input 
                type="text" 
                placeholder="Search Customer" 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-submit-btn">Search</button>
            </form>

            {/* DATA GRID DISPLAY TABLE */}
            <div className="table-wrapper" style={{ position: 'relative' }}>
              {isLoading && <div className="table-loading-overlay">Syncing pagination view...</div>}
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                        No dynamic database profiles match this query.
                      </td>
                    </tr>
                  ) : (
                    customers.map((user) => (
                      <tr key={user.id}>
                        <td className="font-medium" style={{ color: '#1E293B' }}>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.address}</td>
                        <td><span className="email-link">{user.email}</span></td>
                        <td>{user.phone}</td>
                        <td>
                          <div className="action-cell-buttons">
                            {/* Only the requested active delete operation remains */}
                            <button onClick={() => handleDelete(user.id)} className="action-icon-btn delete-btn" title="Delete Customer">
                              <Trash2 style={{ width: '15px', height: '15px' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* DYNAMIC BACKEND PAGINATION ENGINE BAR */}
            <div className="pagination-row">
              <button 
                className="page-nav-arrow" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft style={{ width: '16px', height: '16px' }} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                return (
                  <button 
                    key={pageNumber} 
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`page-num-btn ${currentPage === pageNumber ? 'active' : ''}`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button 
                className="page-nav-arrow" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}