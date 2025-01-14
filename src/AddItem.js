import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';
import { fetch_capacities } from './Functions';

const AddItem = () => {
  const [name, setName] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [barcode, setBarcode] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [isEditing, setIsEditing] = useState(null);

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

 


  const handleAddItem = async () => {
    if (!name || !modelNumber || !brandId || !categoryId) {
      alert('Please fill in all required fields before adding.');
      return;
    }

    try {
      // Check if the model number already exists in the current items state
      const existingItemInState = items.find((item) => item.modelNumber === modelNumber);
      if (existingItemInState && !isEditing) {
        alert('This model number already exists in the added items. Please use a different model number.');
        return;
      }

      // Check if the model number exists in the database (API)
      const response = await axios.get('http://localhost:5257/api/items');
      const existingItemInDB = response.data.find((item) => item.modelNumber === modelNumber);

      if (existingItemInDB) {
        alert('This model number already exists in the database. Please use a different model number.');
        return;
      }

      const newItem = { name, modelNumber, barcode, brandId, categoryId };

      if (isEditing !== null) {
        const updatedItems = items.map((item, index) =>
          index === isEditing ? newItem : item
        );
        setItems(updatedItems);
        setIsEditing(null);
      } else {
        setItems([...items, newItem]);
      }

      setName('');
      setModelNumber('');
      setBarcode('');
      setBrandId('');
      setCategoryId('');
    } catch (error) {
      console.error('Error checking model number:', error);
      alert('Failed to check model number.');
    }
  };

  const handleDeleteItem = (index) => {
    const filteredItems = items.filter((_, i) => i !== index);
    setItems(filteredItems);
    setIsEditing(null);
    setName('');
    setModelNumber('');
    setBarcode('');
    setBrandId('');
    setCategoryId('');
  };

  const handleEditItem = (index) => {
    const itemToEdit = items[index];
    setName(itemToEdit.name);
    setModelNumber(itemToEdit.modelNumber);
    setBarcode(itemToEdit.barcode);
    setBrandId(itemToEdit.brandId);
    setCategoryId(itemToEdit.categoryId);
    setIsEditing(index);
  };

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:5257/api/items/bulk', items);
      alert('Items submitted successfully!');
      setItems([]);
      setName('');
      setModelNumber('');
      setBarcode('');
      setBrandId('');
      setCategoryId('');
    } catch (error) {
      console.error('Error submitting items:', error);
      alert('Failed to submit items.');
    }
  };

  const getBrandName = (id) => {
    const brand = brands.find((b) => String(b.brandId) === String(id));
    return brand ? brand.brandName : 'Unknown Brand';
  };

  const getCategoryName = (id) => {
    const category = categories.find((c) => String(c.categoryId) === String(id));
    return category ? category.categoryName : 'Unknown Category';
  };

  return (
    <div className="container">
      <h2 className="title">Add Item</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <form onSubmit={(e) => e.preventDefault()} className="form">
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="off" // Add this line to disable browser autocomplete
              />
            </div>

            <div className="form-group">
              <label htmlFor="modelNumber">Model Number:</label>
              <input
                type="text"
                id="modelNumber"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                required
                autoComplete="off" // Add this line to disable browser autocomplete
              />
            </div>

            <div className="form-group">
              <label htmlFor="brandId">Brand:</label>
              <select
                id="brandId"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                required
              >
                <option value="">Select a brand</option>
                {brands.map((brand) => (
                  <option key={brand.brandId} value={brand.brandId}>
                    {brand.brandName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="categoryId">Category:</label>
              <select
                id="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              id="barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="hidden"
            />

            <div className="form-group full-width">
              <button
                type="button"
                onClick={handleAddItem}
                className={isEditing !== null ? 'btn btn-warning' : 'btn btn-success'}
              >
                {isEditing !== null ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>

          <h3 className="subtitle">Added Items</h3>
          {items.length === 0 ? (
            <p>No items added yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Model Number</th>
                  <th>Barcode</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.modelNumber}</td>
                    <td>{item.barcode || 'No Barcode'}</td>
                    <td>{getBrandName(item.brandId)}</td>
                    <td>{getCategoryName(item.categoryId)}</td>
                    <td>
                      <button
                        onClick={() => handleEditItem(index)}
                        className="btn btn-warning btn-small"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(index)}
                        className="btn btn-danger btn-small"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <button
            onClick={handleSubmit}
            className="btn btn-primary submit-btn"
            disabled={items.length === 0}
          >
            Submit Items
          </button>
        </div>
      )}
    </div>
  );
};

export default AddItem;
