import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddProducts from './AddProducts';
import AddBrand from './AddBrand';
import AddEmployee from './AddEmployee';
import AddItems from './AddItems';
import AddCapacity from './AddCapacity';
import BatchAddItems from'./BatchAddItems'
import TransferStock from'./TransferStock'
import AdminPage from './AdminPage';
import './App.css';
import './styles.css';  // Import the global CSS file
import Login from './login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminPage />} />
        <Route path="/AddProducts" element={<AddProducts />} />
        <Route path="/AddBrand" element={<AddBrand />} />
        <Route path="/AddEmployee" element={<AddEmployee  />} />
        <Route path="/AddItems" element={<AddItems  />} />
        <Route path="/AddCapacity" element={<AddCapacity  />} />
        <Route path="/BatchAddItems" element={<BatchAddItems  />} />
        <Route path="/TransferStock" element={<TransferStock  />} />
      </Routes>
    </Router>
  );
}

export default App;
