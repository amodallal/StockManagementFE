import React, { useState, useEffect } from 'react';
import './styles.css';
import { fetch_roles, fetch_statuses, fetch_employees, fetch_item_by_mn_imei } from './Functions';

const TransferStock = () => {
  const [statuses, setStatuses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [imeiInput, setImeiInput] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusesData, rolesData, employeesData] = await Promise.all([
          fetch_statuses(),
          fetch_roles(),
          fetch_employees(),
        ]);
        setStatuses(statusesData.statuses || []);
        setRoles(rolesData.roles || []);
        setEmployees(employeesData.employees || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Debugging: Log items when state changes
  useEffect(() => {
    console.log("Updated Items:", items);
  }, [items]);

  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.target.value);
  };

  const handleImeiChange = (e) => {
    setImeiInput(e.target.value);
  };

  const handleFetchItem = async () => {
    if (!imeiInput.trim()) {
      alert('Please enter an IMEI.');
      return;
    }

    try {
      const response = await fetch_item_by_mn_imei(imeiInput);
      console.log("Fetched Item:", response); // Debugging log

      if (response && response.items) {
        const item = response.items; // Access the 'items' key

        // Check if the item is not empty
        if (item && Object.keys(item).length > 0) {
          console.log("Item to be added:", item);

          // Append the item to the list of items
          setItems(prevItems => [...prevItems, item]);
          setImeiInput('');
        } else {
          alert('Item not found.');
        }
      } else {
        alert('Item not found.');
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      alert('Failed to fetch item.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container">
      <h2 className="title">Transfer Stock</h2>

      {/* Employee Dropdown */}
      <div className="form-group">
        <label htmlFor="employee-dropdown">Select Employee:</label>
        <select
          id="employee-dropdown"
          value={selectedEmployee}
          onChange={handleEmployeeChange}
          className="form-control"
        >
          <option value="" disabled>Select an employee</option>
          {employees
            .filter((employee) => employee.roleName === 'Salesman')
            .map((employee) => (
              <option key={employee.id} value={employee.id}>
                {`${employee.firstName} ${employee.lastName}`}
              </option>
            ))}
        </select>
      </div>

      {/* IMEI Input */}
      <div className="form-group">
        <label htmlFor="imei-input">Enter IMEI:</label>
        <input
          type="text"
          id="imei-input"
          value={imeiInput}
          onChange={handleImeiChange}
          className="form-control"
          placeholder="Enter IMEI"
        />
        <button onClick={handleFetchItem} className="btn btn-primary mt-2">Add Item</button>
      </div>

      {/* Items Table */}
      {items.length > 0 ? (
        <table className="table mt-4">
          <thead>
            <tr>
              
              <th>Item Name</th>
              <th>Brand</th>
              <th>IMEI1</th>
              <th>IMEI2</th>
              <th>Color</th>
              <th>Capacity</th>
              <th>Sale Price</th>
              <th>Cost</th>
              <th>Supplier</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                
                <td>{item.itemName || 'N/A'}</td>
                <td>{item.brandName || 'N/A'}</td>
                <td>{item.imei1 || 'N/A'}</td>
                <td>{item.imei2 || 'N/A'}</td>
                <td>{item.colorName || 'N/A'}</td>
                <td>{item.capacityName || 'N/A'}</td>
                <td>{item.salePrice || 'N/A'}</td>
                <td>{item.cost || 'N/A'}</td>
                <td>{item.supplierName || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No items added yet.</p>
      )}
    </div>
  );
};

export default TransferStock;
