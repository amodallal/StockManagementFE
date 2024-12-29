import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

  const handleAddItem = () => {
    if (!name || !modelNumber || !brandId || !categoryId) {
      alert('Please fill in all required fields before adding.');
      return;
    }

    const newItem = { name, modelNumber, barcode, brandId, categoryId };

    if (isEditing !== null) {
      // Update the existing item
      const updatedItems = items.map((item, index) =>
        index === isEditing ? newItem : item
      );
      setItems(updatedItems);
      setIsEditing(null);
    } else {
      // Add a new item
      setItems([...items, newItem]);
    }

    setName('');
    setModelNumber('');
    setBarcode('');
    setBrandId('');
    setCategoryId('');
  };

  const handleDeleteItem = (index) => {
    const filteredItems = items.filter((_, i) => i !== index);
    setItems(filteredItems);
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
      const response = await axios.post('http://localhost:5257/api/items/bulk', items);
      alert('Items submitted successfully!');
      setItems([]);
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
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Add Item</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <div>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '6px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label htmlFor="modelNumber" style={{ display: 'block', marginBottom: '5px' }}>Model Number:</label>
              <input
                type="text"
                id="modelNumber"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                required
                style={{ width: '100%', padding: '6px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label htmlFor="barcode" style={{ display: 'block', marginBottom: '5px' }}>Barcode:</label>
              <input
                type="text"
                id="barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                style={{ width: '100%', padding: '6px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label htmlFor="brandId" style={{ display: 'block', marginBottom: '5px' }}>Brand:</label>
              <select
                id="brandId"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                required
                style={{ width: '100%', padding: '6px', fontSize: '14px' }}
              >
                <option value="">Select a brand</option>
                {brands.map((brand) => (
                  <option key={brand.brandId} value={brand.brandId}>
                    {brand.brandName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="categoryId" style={{ display: 'block', marginBottom: '5px' }}>Category:</label>
              <select
                id="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                style={{ width: '100%', padding: '6px', fontSize: '14px' }}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button
                type="button"
                onClick={handleAddItem}
                style={{
                  padding: '8px 12px',
                  backgroundColor: isEditing !== null ? '#FFC107' : '#28A745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '14px',
                  width: '100%',
                }}
              >
                {isEditing !== null ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>

          {/* Added Items Section */}
          <h3 style={{ marginBottom: '10px' }}>Added Items</h3>
          {items.length === 0 ? (
            <p>No items added yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Model Number</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Barcode</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Brand</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Category</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.name}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.modelNumber}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.barcode || 'No Barcode'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{getBrandName(item.brandId)}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{getCategoryName(item.categoryId)}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <button
                        onClick={() => handleEditItem(index)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#FFC107',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '3px',
                          marginRight: '5px',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(index)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#DC3545',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '3px',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            style={{
              padding: '10px 15px',
              backgroundColor: '#007BFF',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              marginTop: '20px',
              width: '100%',
            }}
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
