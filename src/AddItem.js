import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';
import { fetch_brands, fetch_categories, fetch_items, PostItem, DeleteItem, fetch_capacities, fetch_itemscapacities } from './Functions';

const AddItem = () => {
  const [name, setName] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [barcode, setBarcode] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [capacities, setCapacities] = useState([]);
  const [items, setItems] = useState([]);
  const [capacityId, setCapacityId] = useState([]); 
  const [itemscapacities, setItemCapacities] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isIemiId, setIsIemiId] = useState(true); // State for the checkbox

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [brandsData, categoriesData, itemsData, capacitiesData , itemscapacitiesData] = await Promise.all([
          fetch_brands(),
          fetch_categories(),
          fetch_items(),
          fetch_capacities(),
          fetch_itemscapacities()
        ]);
  
        setBrands(brandsData.brands);
        setCategories(categoriesData.categories);
        setItems(itemsData.items);
        setCapacities(capacitiesData.capacities);
        setItemCapacities(itemscapacitiesData); // Update item capacities state
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data.');
        setLoading(false);
      }
    };
  
    fetchData();
  }, []); // Empty dependency array ensures this only runs once on initial mount

  // Handle adding an item
  const handleAddItem = async () => {
    if (!name || !modelNumber || !brandId || !categoryId || capacityId.length === 0) {
      alert('Please fill in all required fields before adding.');
      return;
    }

    // Check if the model number exists in the database (API)
    const response = await axios.get('http://localhost:5257/api/items');
    const existingItemInDB = response.data.find((item) => item.modelNumber === modelNumber);

    if (existingItemInDB) {
      alert('This model number already exists in the database. Please use a different model number.');
      return;
    }

    try {
      const newItem = { name, modelNumber, barcode, brandId, categoryId, isIemiId }; // Include isIemiId
      
      // Insert the item into the database
      await PostItem(newItem);

      // Fetch the newly created item to get its `itemId`
      const itemsResponse = await axios.get('http://localhost:5257/api/items');
      const createdItem = itemsResponse.data.find(item => item.modelNumber === modelNumber);

      if (createdItem) {
        // Send the selected capacity IDs (without any splitting or concatenating)
        await axios.post('http://localhost:5257/api/items/item-capacities', {
          ItemId: createdItem.itemId, 
          CapacityIds: capacityId  // Send the individual capacity ID as an array
        });
         // Fetch updated capacities after adding
         const updatedItemscapacities = await fetch_itemscapacities();
         setItemCapacities(updatedItemscapacities);
      }

      // Fetch updated items after adding
      setItems(itemsResponse.data);

      // Clear input fields
      setName('');
      setModelNumber('');
      setBarcode('');
      setBrandId('');
      setCategoryId('');
      setCapacityId([]);  // Clear the selected capacities
      setIsIemiId(false); // Reset checkbox
    } catch (err) {
      console.error('Error adding item:', err);
      alert('Failed to add item.');
      
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await DeleteItem(itemId); // Remove from the database

      // Fetch updated items after deletion
      const response = await axios.get('http://localhost:5257/api/items');
      setItems(response.data);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="container">
      <h2 className="title">Add Item</h2>

      {/* Add Item Form */}
      <div className="form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="modelNumber">Model Number:</label>
          <input
            type="text"
            id="modelNumber"
            value={modelNumber}
            onChange={(e) => setModelNumber(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="brandId">Brand:</label>
          <select
            id="brandId"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
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
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.categoryName}
              </option>
            ))}
          </select>
       
       /</div>
          {/* Checkbox for IsIemiId */}
          <div className="form-group">
          <label htmlFor="IEMIE">IEMIE:</label>
          <input
            type="checkbox"
            id="IEMIE"
            checked={isIemiId}
            onChange={(e) => setIsIemiId(e.target.checked)}
          />
        </div>

        {/* Multi-Select for Capacities */}
        <div className="form-group">
          <label htmlFor="capacities">Select Capacities:</label>
          <select
            id="capacityId"
            value={capacityId}
            onChange={(e) => setCapacityId(Array.from(e.target.selectedOptions, option => option.value))}
            multiple
          >
            {capacities.map((capacity) => (
              <option key={capacity.capacityID} value={capacity.capacityID}>
                {capacity.capacityName}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-success" onClick={handleAddItem}>
          Add Item
        </button>
      </div>

      {/* Items Grid */}
      <h3 className="subtitle">Items List</h3>
      {items.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Model Number</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Capacities</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.itemId}>
                <td>{item.name}</td>
                <td>{item.modelNumber}</td>
                <td>{brands.find((b) => b.brandId === item.brandId)?.brandName || 'Unknown'}</td>
                <td>{categories.find((c) => c.categoryId === item.categoryId)?.categoryName || 'Unknown'}</td>
                <td>
                  {itemscapacities
                    .filter((itemCapacity) => itemCapacity.itemId === item.itemId)
                    .map((itemCapacity) => (
                      <div key={`${itemCapacity.itemId}-${itemCapacity.capacityId}`}>
                        {itemCapacity.capacityName || 'Unknown'}
                      </div>
                    ))}
                </td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteItem(item.itemId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No items available.</p>
      )}
    </div>
  );
};

export default AddItem;
