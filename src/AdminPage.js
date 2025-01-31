import React, { useState } from 'react';
import AddProducts from './AddProducts';
import './styles.css';

const AdminPage = () => {
  const [activePage, setActivePage] = useState(null);

  return (
    <div className="main-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3>Menu</h3>
        <ul>
          <li>
            <span onClick={() => setActivePage('productManagement')} className="menu-item">
              Product Management
            </span>
            {activePage === 'productManagement' && (
              <ul className="submenu">
                <li onClick={() => setActivePage('addProducts')} className="menu-item">
                  Add Product
                </li>
              </ul>
            )}
          </li>
          <li>
            <span onClick={() => setActivePage('employeeManagement')} className="menu-item">
              Employee Management
            </span>
          </li>
          <li>
            <span onClick={() => setActivePage('itemsManagement')} className="menu-item">
              Items Management
            </span>
          </li>
        </ul>
      </aside>

      {/* Content Section */}
      <main className="content">
        <h2>Main Page</h2>
        {activePage === 'addProducts' && <AddProducts />}
        {activePage === 'employeeManagement' && <p>Employee Management Page</p>}
        {activePage === 'itemsManagement' && <p>Items Management Page</p>}
        {!activePage && <p>Select an option from the menu.</p>}
      </main>
    </div>
  );
};

export default AdminPage;
