import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddItem = () => {
  const [name, setName] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state

  // Fetch brands and categories when the component loads
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);  // Optional: set loading state
      const [brandsRes, categoriesRes] = await Promise.all([
        axios.get('http://localhost:5257/api/brands'),
        axios.get('http://localhost:5257/api/categories'),
      ]);

      console.log('Brands:', brandsRes.data);
      console.log('Categories:', categoriesRes.data);

      // Check if the response data is an array and log it
      if (Array.isArray(brandsRes.data)) {
        setBrands(brandsRes.data);
      } else {
        console.error('Brands data is not in the correct format:', brandsRes.data);
      }

      if (Array.isArray(categoriesRes.data)) {
        setCategories(categoriesRes.data);
      } else {
        console.error('Categories data is not in the correct format:', categoriesRes.data);
      }

      setLoading(false);  // Optional: set loading state to false after data is fetched
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);  // Optional: set loading state to false after error
    }
  };

  fetchData();
}, []);

  

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newItem = {
      name,
      model_number: modelNumber,
      brand_id: brandId,
      category_id: categoryId,
    };
    try {
      const response = await axios.post('http://localhost:5257/api/items', newItem); // Replace with your add-item API endpoint
      alert('Item added successfully!');
      console.log(response.data);
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Add Item</h2>
      {loading ? (
        <p>Loading...</p> // Show loading message if data is still being fetched
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="modelNumber" style={{ display: 'block', marginBottom: '5px' }}>Model Number:</label>
            <input
              type="text"
              id="modelNumber"
              value={modelNumber}
              onChange={(e) => setModelNumber(e.target.value)}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="brandId" style={{ display: 'block', marginBottom: '5px' }}>Brand:</label>
            <select
              id="brandId"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              required
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">Select a brand</option>
              {brands.length === 0 ? (
                <option value="">Loading brands...</option> // Show a loading option if brands are still being fetched
              ) : (
                brands.map((brand, index) => (
                  <option key={brand.id || index} value={brand.id}>{brand.name}</option> // Ensure unique key
                ))
              )}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="categoryId" style={{ display: 'block', marginBottom: '5px' }}>Category:</label>
            <select
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">Select a category</option>
              {categories.length === 0 ? (
                <option value="">Loading categories...</option> // Show a loading option if categories are still being fetched
              ) : (
                categories.map((category, index) => (
                  <option key={category.id || index} value={category.id}>{category.name}</option> // Ensure unique key
                ))
              )}
            </select>
          </div>

          <button
            type="submit"
            style={{ padding: '10px 15px', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '5px' }}
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default AddItem;
