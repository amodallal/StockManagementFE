import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';

const AddBrand = () => {
  const [brandName, setBrandName] = useState('');
  const [brands, setBrands] = useState([]);  // Newly added brands state
  const [databaseBrands, setDatabaseBrands] = useState([]); // Brands from the database
  const [isEditing, setIsEditing] = useState(null);

  useEffect(() => {
    // Fetch brands from the database when the component mounts
    const fetchDatabaseBrands = async () => {
      try {
        const response = await axios.get('http://localhost:5257/api/brands');
        setDatabaseBrands(response.data);
      } catch (error) {
        console.error('Error fetching database brands:', error);
      }
    };
    fetchDatabaseBrands();
  }, []);

  const handleAddBrand = async () => {
    if (!brandName) {
      alert('Please fill in the brand name before adding.');
      return;
    }

    try {
      // Check if the brand already exists in the local brands state
      const existingBrandInState = brands.find((brand) => brand.brandName === brandName);
      if (existingBrandInState) {
        alert('This brand already exists in the added list. Please use a different name.');
        return;
      }

      // Check if the brand exists in the database
      const existingBrandInDB = databaseBrands.find((brand) => brand.brandName === brandName);
      if (existingBrandInDB) {
        alert('This brand already exists in the database. Please use a different name.');
        return;
      }

      // If brand does not exist in state or database, add it to the list
      const newBrand = { brandName };

      if (isEditing !== null) {
        const updatedBrands = brands.map((brand, index) =>
          index === isEditing ? newBrand : brand
        );
        setBrands(updatedBrands);
        setIsEditing(null);
      } else {
        setBrands([...brands, newBrand]);
      }

      setBrandName('');
    } catch (error) {
      console.error('Error adding brand:', error);
      alert('Failed to add brand.');
    }
  };

  const handleDeleteBrand = (index) => {
    const filteredBrands = brands.filter((_, i) => i !== index);
    setBrands(filteredBrands);
    setIsEditing(null);
    setBrandName('');
  };

  const handleEditBrand = (index) => {
    const brandToEdit = brands[index];
    setBrandName(brandToEdit.brandName);
    setIsEditing(index);
  };

  const handleSubmit = async () => {
    try {
      // Submit newly added brands to the database
      await axios.post('http://localhost:5257/api/brands/bulk', brands);
      alert('Brands submitted successfully!');

      // After submitting, clear the local brands list and re-fetch the updated database brands
      setBrands([]);
      setBrandName('');
      
      // Re-fetch the updated list of brands from the database
      const response = await axios.get('http://localhost:5257/api/brands');
      setDatabaseBrands(response.data);

    } catch (error) {
      console.error('Error submitting brands:', error);
      alert('Failed to submit brands.');
    }
  };

  return (
    <div className="container">
      <h2 className="title">Add Brand</h2>

      <div>
        <form onSubmit={(e) => e.preventDefault()} className="form">
          <div className="form-group">
            <label htmlFor="brandName">Brand Name:</label>
            <input
              type="text"
              id="brandName"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group full-width">
            <button
              type="button"
              onClick={handleAddBrand}
              className={isEditing !== null ? 'btn btn-warning' : 'btn btn-success'}
            >
              {isEditing !== null ? 'Update Brand' : 'Add Brand'}
            </button>
          </div>
        </form>

        <h3 className="subtitle">Added Brands</h3>
        {brands.length === 0 ? (
          <p>No brands added yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Brand Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand, index) => (
                <tr key={index}>
                  <td>{brand.brandName}</td>
                  <td>
                    <button
                      onClick={() => handleEditBrand(index)}
                      className="btn btn-warning btn-small"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBrand(index)}
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

        <h3 className="subtitle">Available Brands</h3>
        {databaseBrands.length === 0 ? (
          <p>No brands in the database.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Brand Name</th>
              </tr>
            </thead>
            <tbody>
              {databaseBrands.map((brand, index) => (
                <tr key={index}>
                  <td>{brand.brandName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          onClick={handleSubmit}
          className="btn btn-primary submit-btn"
          disabled={brands.length === 0}
        >
          Submit Brands
        </button>
      </div>
    </div>
  );
};

export default AddBrand;
