import React, { useState } from 'react';
import AddProducts from './AddProducts';
import AddEmployee from './AddEmployee';
import AddItems from './AddItems';
import AddColor from './AddColor';
import AddCapacity from './AddCapacity'; // Import the new component
import AddBrand from './AddBrand'; // Import the new component
import './styles.css';


// NOTE: In your project, these would be imported from separate files.
// They are defined here to create a single, runnable example.



const AdminPage = () => {
  const [activePage, setActivePage] = useState(null);

  const getPageTitle = () => {
    switch (activePage) {
      case 'addProducts':
        return 'Product Management';
      case 'AddEmployee':
        return 'Employee Management';
      case 'AddItems':
        return 'Items Management';
      case 'AddColor':
        return 'Color Management';
      case 'AddCapacity':
        return 'Capacity Management';
      case 'AddBrand': // Add case for the new page
        return 'Brand Management';
      default:
        return 'Dashboard';
    }
  };

  return (
      <div className="admin-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Admin Panel</h2>
          </div>

          <nav className="sidebar-nav">
            <ul>
              <li>
                <div
                  onClick={() => setActivePage('addProducts')}
                  className={`menu-item ${activePage === 'addProducts' ? 'active-main' : ''}`}
                >
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>
                </svg>
                  <span>Product Management</span>
                </div>
              </li>

              <li>
                <div
                  onClick={() => setActivePage('AddEmployee')}
                  className={`menu-item ${activePage === 'AddEmployee' ? 'active-main' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span>Employee Management</span>
                </div>
              </li>

              <li>
                <div
                  onClick={() => setActivePage('AddItems')}
                  className={`menu-item ${activePage === 'AddItems' ? 'active-main' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                  <span>Items Management</span>
                </div>
              </li>
              
              <li>
                <div
                  onClick={() => setActivePage('AddColor')}
                  className={`menu-item ${activePage === 'AddColor' ? 'active-main' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 2a7 7 0 0 0-7 7c0 2.4 1.2 4.5 3 5.7"></path>
                      <path d="M12 22a7 7 0 0 0 7-7c0-2.4-1.2-4.5-3-5.7"></path>
                  </svg>
                  <span>Add Color</span>
                </div>
              </li>
              
              <li>
                <div
                  onClick={() => setActivePage('AddCapacity')}
                  className={`menu-item ${activePage === 'AddCapacity' ? 'active-main' : ''}`}
                >
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0"></path><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M13.41 10.59l4.59 -4.59"></path><path d="M7 12a5 5 0 0 1 5 -5"></path>
</svg>
                  <span>Add Capacity</span>
                </div>
              </li>

              {/* START: New Menu Item */}
              <li>
                <div
                  onClick={() => setActivePage('AddBrand')}
                  className={`menu-item ${activePage === 'AddBrand' ? 'active-main' : ''}`}
                >
                  {/* Icon for Brand (e.g., a bookmark or label) */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>Add Brand</span>
                </div>
              </li>
              {/* END: New Menu Item */}

            </ul>
          </nav>

          <div className="sidebar-footer">
            <p>&copy; 2025 Your Company</p>
          </div>
        </aside>

        {/* Content */}
        <main className="content">
          <header className="content-header">
            <h1>{getPageTitle()}</h1>
            <div className="user-profile">
              <span>Welcome, Admin</span>
              <img src="https://placehold.co/40x40/E2E8F0/475569?text=A" alt="Admin" />
            </div>
          </header>

          <div className="content-body">
            {activePage === 'addProducts' && <AddProducts />}
            {activePage === 'AddEmployee' && <AddEmployee />}
            {activePage === 'AddItems' && <AddItems />}
            {activePage === 'AddColor' && <AddColor />}
            {activePage === 'AddCapacity' && <AddCapacity />}
            {activePage === 'AddBrand' && <AddBrand />} 
            {!activePage && (
              <div className="page-content welcome-message">
                <h2>Welcome to the Admin Dashboard</h2>
                <p>Select an option from the menu.</p>
              </div>
            )}
          </div>
        </main>
      </div>
  );
};

export default AdminPage;
