import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddProducts from './AddProducts';
import AddBrand from './AddBrand';
import AddEmployee from './AddEmployee';
import AddItems from './AddItems';
import AddCapacity from './AddCapacity';
import BatchAddItems from'./BatchAddItems'
import './App.css';
import './styles.css';  // Import the global CSS file
import Login from './login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/AddProducts" element={<AddProducts />} />
        <Route path="/AddBrand" element={<AddBrand />} />
        <Route path="/AddEmployee" element={<AddEmployee  />} />
        <Route path="/AddItems" element={<AddItems  />} />
        <Route path="/AddCapacity" element={<AddCapacity  />} />
        <Route path="/BatchAddItems" element={<BatchAddItems  />} />
      </Routes>
    </Router>
  );
}

export default App;
