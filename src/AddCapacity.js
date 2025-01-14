import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css'; // Import styles
import { fetch_capacities, PostCapacity, DeleteCapacity } from './Functions';

const CapacitiesGrid = () => {
  const [capacities, setCapacities] = useState([]);
  const [newCapacityName, setNewCapacityName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch capacities on component mount
  useEffect(() => {
    const getCapacities = async () => {
      try {
        const { capacities } = await fetch_capacities();
        setCapacities(capacities);
      } catch (err) {
        setError('Failed to fetch capacities.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getCapacities();
  }, []);

  // Handle adding a new capacity
const handleAddCapacity = async () => {
    if (!newCapacityName.trim()) {
      alert('Please enter capacity.');
      return;
    }
  
    try {
      const newCapacity = { capacityName: newCapacityName };
      await PostCapacity(newCapacity); // Post to the backend
  
      // After posting, fetch the updated list of capacities including the newly added one
      const { capacities } = await fetch_capacities(); // Fetch the list again
      setCapacities(capacities); // Update the local state with the complete list
      setNewCapacityName(''); // Clear the input field
    } catch (err) {
      console.error('Error adding capacity:', err);
      alert('Failed to add capacity.');
      
    }
  };

  // Handle deleting a capacity
  const handleDeleteCapacity = async (capacityID) => {
  if (window.confirm('Are you sure you want to delete this capacity?')) {
     await DeleteCapacity(capacityID); // Remove from the database

     const response = await axios.get('http://localhost:5257/api/capacities');
        setCapacities(response.data);
  }
};

  if (loading) {
    return <p className="loading">Loading capacities...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="container">
      <h2 className="title">Capacities List</h2>

      {/* Add Capacity Form */}
      <div className="form-group full-width">
        <label htmlFor="newCapacityName">Add New Capacity:</label>
        <input
          type="text"
          id="newCapacityName"
          value={newCapacityName}
          onChange={(e) => setNewCapacityName(e.target.value)}
          placeholder="Enter capacity"
        />
        <button className="btn btn-success submit-btn" onClick={handleAddCapacity}>
          Add Capacity
        </button>
      </div>

      {/* Capacities Grid */}
      {capacities.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Capacities</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {capacities.map((capacity) => (
              <tr key={capacity.capacityID}>
                <td>{capacity.capacityName}</td>
                
                <td>
                  <button
                    className="btn btn-danger btn-small"
                  
                    onClick={() => handleDeleteCapacity(capacity.capacityID)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="empty">No capacities available.</p>
      )}
    </div>
  );
};

export default CapacitiesGrid;
