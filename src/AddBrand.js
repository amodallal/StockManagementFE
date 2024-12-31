import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';

const AddBrand = () => {
  const [brandName, setBrandName] = useState('');
  const [databaseBrands, setDatabaseBrands] = useState([]); // Brands from the database

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
      const existingBrandInDB = databaseBrands.find((brand) => brand.brandName === brandName);
      if (existingBrandInDB) {
        alert('This brand already exists in the database. Please use a different name.');
        return;
      }

      const newBrand = { brandName };

      // Add the new brand to the database
      await axios.post('http://localhost:5257/api/brands', newBrand);

      // Update the list of database brands
      const response = await axios.get('http://localhost:5257/api/brands');
      setDatabaseBrands(response.data);

      alert('Brand added successfully!');
      setBrandName('');
    } catch (error) {
      console.error('Error adding brand:', error);
      alert('Failed to add brand.');
    }
  };

  return (
    <div className="container">
      <h2 className="title">Add Brand</h2>

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
            className="btn btn-success"
          >
            Add Brand
          </button>
        </div>
      </form>

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
            {databaseBrands.map((brand) => (
              <tr key={brand.brandId}>
                <td>{brand.brandName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AddBrand;
