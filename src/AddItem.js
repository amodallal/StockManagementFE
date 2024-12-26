import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddItem = () => {
  // States for form fields
  const [name, setName] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // To show loading message while fetching data

  // Fetch brands and categories when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Start loading

        // Fetch both brands and categories concurrently
        const [brandsRes, categoriesRes] = await Promise.all([
          axios.get('http://localhost:5257/api/brands'),
          axios.get('http://localhost:5257/api/categories'),
        ]);

        // Handle the data and ensure the correct format
        setBrands(brandsRes.data);
        setCategories(categoriesRes.data);

        setLoading(false); // Stop loading
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false); // Stop loading if there was an error
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
      brand_id: brandId, // We send the brand id, not the name
      category_id: categoryId, // We send the category id, not the name
    };

    try {
      // Post request to the API to add the new item
      const response = await axios.post('http://localhost:5257/api/items', newItem);
      alert('Item added successfully!');
      console.log('Item added:', response.data);
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Add Item</h2>
      {loading ? (
        <p>Loading...</p> // Show loading message while brands and categories are being fetched
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          {/* Model Number Field */}
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

          {/* Brand Dropdown */}
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
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name} {/* Display brand name but use the id in the value */}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
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
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} {/* Display category name but use the id in the value */}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
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
