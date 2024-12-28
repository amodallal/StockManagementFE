import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddItem = () => {
  // States for form fields
  const [name, setName] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [barcode, setBarcode] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for added items
  const [items, setItems] = useState([]);

  // Fetch brands and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [brandsRes, categoriesRes] = await Promise.all([
          axios.get('http://localhost:5257/api/brands'),
          axios.get('http://localhost:5257/api/categories'),
        ]);
        setBrands(brandsRes.data);
        setCategories(categoriesRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle adding an item to the list
  const handleAddItem = () => {
    if (!name || !modelNumber || !brandId || !categoryId) {
      alert('Please fill in all required fields before adding.');
      return;
    }

    const newItem = {
      name,
      modelNumber,
      barcode,
      brandId,
      categoryId,
    };

    setItems([...items, newItem]); // Add new item to the list
    // Clear the input fields
    setName('');
    setModelNumber('');
    setBarcode('');
    setBrandId('');
    setCategoryId('');
  };

  // Handle submitting all items
  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5257/api/items/bulk', items );
      alert('Items submitted successfully!');
      console.log('Submitted items:', response.data);
      setItems([]); // Clear the list after successful submission
    } catch (error) {
      console.error('Error submitting items:', error);
      alert('Failed to submit items.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Add Item</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <form onSubmit={(e) => e.preventDefault()}>
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
              <label htmlFor="barcode" style={{ display: 'block', marginBottom: '5px' }}>Barcode:</label>
              <input
                type="text"
                id="barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
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
                {brands.map((brand) => (
                  <option key={brand.brandId} value={brand.brandId}>
                    {brand.brandName}
                  </option>
                ))}
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
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              style={{ padding: '10px 15px', backgroundColor: '#28A745', color: '#fff', border: 'none', borderRadius: '5px', marginRight: '10px' }}
            >
              Add
            </button>
          </form>

          {/* Display List of Added Items */}
          <h3>Added Items</h3>
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                {item.name} - {item.modelNumber} - {item.barcode || 'No Barcode'} - Brand ID: {item.brandId} - Category ID: {item.categoryId}
              </li>
            ))}
          </ul>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            style={{ padding: '10px 15px', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '5px', marginTop: '20px' }}
            disabled={items.length === 0}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default AddItem;
