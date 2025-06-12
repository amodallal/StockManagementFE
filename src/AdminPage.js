import React, { useState } from 'react';
import './styles.css';
import AddProducts from './AddProducts';
// To resolve the compile error, the AddProducts component and styles
// are now included directly within this file.





const AdminPage = () => {
  // Your original state logic is preserved
  const [activePage, setActivePage] = useState(null);

  // Helper to determine the main title in the header
  const getPageTitle = () => {
    switch (activePage) {
      case 'productManagement':
        return 'Product Management';
      case 'addProducts':
        return 'Add Product';
      case 'employeeManagement':
        return 'Employee Management';
      case 'itemsManagement':
        return 'Items Management';
      default:
        return 'Dashboard';
    }
  };

  return (
    <>
     
      <div className="admin-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Admin Panel</h2>
          </div>
          <nav className="sidebar-nav">
            <ul>
              {/* Product Management with Submenu */}
              <li>
                <div
                  onClick={() => setActivePage('productManagement')}
                  // The parent menu is "active" if its submenu is open
                  className={`menu-item ${['productManagement', 'addProducts'].includes(activePage) ? 'active-main' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: ['productManagement', 'addProducts'].includes(activePage) ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
                  <span>Product Management</span>
                </div>

                {/* Your original logic for showing the submenu */}
                {activePage === 'productManagement' && (
                  <ul className="submenu">
                    <li
                      onClick={() => setActivePage('addProducts')}
                      className={`menu-item submenu-item ${activePage === 'addProducts' ? 'active' : ''}`}
                    >
                      Add Product
                    </li>
                  </ul>
                )}
              </li>

              {/* Other Top-Level Menu Items */}
              <li>
                <div
                  onClick={() => setActivePage('employeeManagement')}
                  className={`menu-item ${activePage === 'employeeManagement' ? 'active' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span>Employee Management</span>
                </div>
              </li>
              <li>
                <div
                  onClick={() => setActivePage('itemsManagement')}
                  className={`menu-item ${activePage === 'itemsManagement' ? 'active' : ''}`}
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                  <span>Items Management</span>
                </div>
              </li>
            </ul>
          </nav>
          <div className="sidebar-footer">
            <p>&copy; 2025 Your Company</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="content">
          <header className="content-header">
            <h1>{getPageTitle()}</h1>
            <div className="user-profile">
              <span>Welcome, Admin</span>
              <img src="https://placehold.co/40x40/E2E8F0/475569?text=A" alt="Admin" />
            </div>
          </header>
          <div className="content-body">
            {/* Your original rendering logic */}
            {activePage === 'addProducts' && <AddProducts />}
            {activePage === 'employeeManagement' && <div className="page-content"><p>Employee Management Page</p></div>}
            {activePage === 'itemsManagement' && <div className="page-content"><p>Items Management Page</p></div>}
            {(!activePage && activePage !== 'productManagement') && (
              <div className="page-content welcome-message">
                <h2>Welcome to the Admin Dashboard</h2>
                <p>Select an option from the menu.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminPage;
