import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';
import { fetch_roles, fetch_statuses, fetch_employees, fetch_item_by_mn_imei ,transferimei_url ,transferserial_url ,fetch_item_by_serial,fetch_item_by_barcode ,transferbarcode_url,fetch_barcode_identifier } from './Functions';

const TransferStock = () => {
  const [statuses, setStatuses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [imeiInput, setImeiInput] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serialNumber, setserialNumber] = useState([]);
  
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
    
  }, [items]);

  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.target.value);
  };

  const handleImeiChange = (e) => {
    setImeiInput(e.target.value);
  };

  const handleFetchItem = async () => {
    if (!imeiInput.trim()) {
        alert('Please enter an IMEI, Serial Number, or Barcode.');
        return;
    }

    try {
        let item = null;

        let identifierResponse = await fetch_barcode_identifier(imeiInput);

        console.log(identifierResponse.identifier);

        if (identifierResponse.identifier == "IMEI"){
        // First, check if IMEI exists
        let response = await fetch_item_by_mn_imei(imeiInput);
        if (response && response.items && Object.keys(response.items).length > 0) {
            item = response.items;

            // Execute IMEI transfer API
            const transferData = {
                Employee_id: parseInt(selectedEmployee),
                IMEI_1: imeiInput,
                source: "Main Warehouse",
                destination : selectedEmployee

            };

            const transferResponse = await axios.post(transferimei_url, transferData);

            if (transferResponse.status === 200) {
                setItems(prevItems => [...prevItems, item]);
                setImeiInput('');
                return;
            } else {
                alert('Stock transfer failed.');
                return;
            }
        }
      }

        // If not found by IMEI, check Serial Number
        if (identifierResponse.identifier == "SN"){
        let response = await fetch_item_by_serial(imeiInput);
        if (response && response.items && Object.keys(response.items).length > 0) {
            item = response.items;

            // Execute Serial Number transfer API
            const transferData = {
                Employee_id: parseInt(selectedEmployee),
                SerialNumber: imeiInput,
                source: "Main Warehouse",
                destination : selectedEmployee
            };

            const transferResponse = await axios.post(transferserial_url, transferData);

            if (transferResponse.status === 200) {
                setItems(prevItems => [...prevItems, item]);
                setImeiInput('');
                return;
            } else {
                alert('Stock transfer failed.');
                return;
            }
        }
      }
       
        // If still not found, check Barcode identifier
        let response = await fetch_barcode_identifier(imeiInput);
        if (response && response.itemId) {
          const quantity = prompt('Barcode detected! Please enter the quantity to transfer:');
          
          if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
            
            // Proceed with quantity-based stock transfer API call
            const transferData = {
              Employee_id: parseInt(selectedEmployee),
              ItemId: response.itemId,
              TransferQuantity: parseInt(quantity),
              source: "Main Warehouse",
              destination: selectedEmployee
            };
    
            try {
              const transferResponse = await axios.post(transferbarcode_url, transferData);
              console.log(transferResponse);
              const barcodeItem = {
                itemId: transferResponse.data.stock.itemId,
                itemName: response.name, // Make sure these fields are in the response
                brandName: transferResponse.data.stock.name,
                modelNumber: transferResponse.data.stock.modelNumber,
                serialNumber: transferResponse.data.stock.serialNumber,
                salePrice: transferResponse.data.stock.salePrice,
                cost: transferResponse.data.stock.cost,
                supplierName: transferResponse.data.stock.supplierName,
                quantity: quantity // Use the entered quantity
              };
              // Add the item to the list
              setItems(prevItems => [...prevItems, barcodeItem]);
              alert('Stock transferred successfully.');
              
            } catch (error) {
              alert("Stock transfer failed. Check item availability.");
            }
          } else {
            alert('Invalid quantity entered.');
          }
          return;
        }
    
        // If nothing is found, show "Item not found"
        alert('Item not found.');
      } catch (error) {
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
              <option key={employee.employeeId} value={employee.employeeId}>
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
        <button onClick={handleFetchItem} className="btn btn-success submit-btn">Add Item</button>
      </div>

      {/* Items Table */}
      {items.length > 0 ? (
        <table className="table mt-4">
          <thead>
            <tr>
              
              <th>Item Name</th>
              <th>Brand</th>
              <th>Model</th>
              <th>IMEI1</th>
              <th>IMEI2</th>
              <th>SN</th>
              <th>Color</th>
              <th>Capacity</th>
             {/* <th>Sale Price</th>
              <th>Cost</th> */}
              <th>Supplier</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.itemName || 'N/A'}</td>
                <td>{item.brandName || 'N/A'}</td>
                <td>{item.modelNumber || 'N/A'}</td>
                <td>{item.imei1 || 'N/A'}</td>
                <td>{item.imei2 || 'N/A'}</td>
                <td>{item.serialNumber || 'N/A'}</td>
                <td>{item.colorName || 'N/A'}</td>
                <td>{item.capacityName || 'N/A'}</td>
               {/* <td>{item.salePrice || 'N/A'}</td>
                <td>{item.cost || 'N/A'}</td>*/}  
                <td>{item.supplierName || 'N/A'}</td>
                <td>{item.quantity || 'N/A'}</td>
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
