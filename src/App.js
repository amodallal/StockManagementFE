import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddItem from './AddItem';
import StockTransfer from './StockTransfer';
import './App.css';
import Login from './login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/AddItem" element={<AddItem />} />
      </Routes>
    </Router>
  );
}

export default App;
