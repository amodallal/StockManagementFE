import React, { useState } from 'react';

const AddItems = () => {
  // State for form fields
  const [itemName, setItemName] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');

  // Example options for dropdowns
  const brandOptions = ['Apple', 'Samsung', 'Sony', 'LG', 'Dell'];
  const categoryOptions = ['Tablet', 'Phone'];

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`Item Details:\nName: ${itemName}\nModel: ${modelNumber}\nBrand: ${brand}\nCategory: ${category}`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Add New Item</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="itemName" style={{ display: 'block', marginBottom: '5px' }}>
            Item Name:
          </label>
          <input
            type="text"
            id="itemName"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="modelNumber" style={{ display: 'block', marginBottom: '5px' }}>
            Model Number:
          </label>
          <input
            type="text"
            id="modelNumber"
            value={modelNumber}
            onChange={(e) => setModelNumber(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="brand" style={{ display: 'block', marginBottom: '5px' }}>
            Brand:
          </label>
          <select
            id="brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">Select a brand</option>
            {brandOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="category" style={{ display: 'block', marginBottom: '5px' }}>
            Category:
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">Select a category</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          style={{ padding: '10px 15px', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '5px' }}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddItems;
