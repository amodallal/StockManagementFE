import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddItem from './AddItem';
import AddBrand from './AddBrand';
import AddEmployee from './AddEmployee';
import AddItemDetails from './AddItemDetails';
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
        <Route path="/AddItem" element={<AddItem />} />
        <Route path="/AddBrand" element={<AddBrand />} />
        <Route path="/AddEmployee" element={<AddEmployee  />} />
        <Route path="/AddItemDetails" element={<AddItemDetails  />} />
        <Route path="/AddCapacity" element={<AddCapacity  />} />
        <Route path="/BatchAddItems" element={<BatchAddItems  />} />
      </Routes>
    </Router>
  );
}

export default App;
