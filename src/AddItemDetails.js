import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './styles.css';

const AddItemDetails = () => {
  const [itemId, setItemId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [imei1, setImei1] = useState('');
  const [imei2, setImei2] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [cost, setCost] = useState('');
  const [descriptionId, setDescriptionId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [dateReceived, setDateReceived] = useState('');
  const [items, setItems] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [barcodeData, setBarcodeData] = useState('');

  // Ref for the IMEI 1 input field
  const imeiInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    // Set today's date for the DateReceived state
    const today = new Date().toISOString().split('T')[0];
    setDateReceived(today);

    const fetchData = async () => {
      try {
        const [itemsRes, suppliersRes, descriptionsRes] = await Promise.all([
          axios.get('http://localhost:5257/api/items'),
          axios.get('http://localhost:5257/api/supplier'),
          axios.get('http://localhost:5257/api/description'),
        ]);

        setItems(itemsRes.data);
        setSuppliers(suppliersRes.data);
        setDescriptions(descriptionsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();

    // Automatically focus the IMEI field when the component mounts
    if (imeiInputRef.current) {
      imeiInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    
    // Listen for barcode scanner input
    const handleBarcodeInput = (event) => {
      if (event.key === 'Enter') {
        // When 'Enter' key is pressed, assume the barcode is fully scanned
        if (barcodeData.length !== 15) {
          console.log('Invalid IMEI length:', barcodeData.length);
          alert('IMEI must be exactly 15 digits');
          setBarcodeData('');
          setImei1('');

          return; // Don't proceed with the request if the IMEI length is not 15
        }
  
         setImei1(barcodeData);
         
        handleSubmit()
        setBarcodeData(''); // Reset barcode data after submission
      } else if (event.key !== 'Backspace') {  // Ignore backspace keys
        setBarcodeData((prev) => prev + event.key);
      }

      // Reset barcode data on first scan to avoid strange characters
      if (barcodeData.length === 0) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          setBarcodeData('');
        }, 300); // Reset after a short delay (debounce)
      }
    };

    window.addEventListener('keydown', handleBarcodeInput);

    return () => {
      window.removeEventListener('keydown', handleBarcodeInput);
      clearTimeout(debounceTimerRef.current);  // Clear any existing timeouts
    };
  }, [imei1]);

  const handleSubmit = async () => {
    if (!itemId || !imei1 || !salePrice ||  !cost || !quantity || !descriptionId || !supplierId || !dateReceived) {
      
      alert('Please fill in all required fields.');
      return;
    }
    
    const newItemDetail = {
      itemId,
      serialNumber,
      imei1,
      imei2,
      salePrice,
      cost,
      descriptionId,
      supplierId,
      quantity,
      dateReceived,
    };

    try {
      console.log('Scanned Barcode:', barcodeData);
      
      await axios.post('http://localhost:5257/api/ItemDetails', newItemDetail);
     // alert('Item detail added successfully!');

      // Clear form fields after submission
      setSerialNumber('');
      setImei1('');
      setImei2('');
      setQuantity('1');
      setDateReceived(new Date().toISOString().split('T')[0]);

      // Refocus on the IMEI field
      if (imeiInputRef.current) {
        imeiInputRef.current.focus();
      }
    } catch (error) {
      console.error('Error adding item detail:', error);
      alert('Failed to add item detail.');
    }
  };

  return (
    <div className="container">
      <h2 className="title">Add Item Details</h2>
      <form onSubmit={(e) => e.preventDefault()} className="form">
        <div className="form-group">
          <label htmlFor="itemId">Item:</label>
          <select
            id="itemId"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            required
          >
            <option value="">Select Item</option>
            {items.map((item) => (
              <option key={item.itemId} value={item.itemId}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="serialNumber">Serial Number:</label>
          <input
            type="text"
            id="serialNumber"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="imei1">IMEI 1 (Scan to fill):</label>
          <input
            type="text"
            id="imei1"
            value={imei1}
            onChange={(e) => setImei1(e.target.value)}
            placeholder="Scan barcode here"
            autoComplete='off'
            ref={imeiInputRef} // Attach ref to the IMEI 1 input field
          />
        </div>

        <div className="form-group">
          <label htmlFor="imei2">IMEI 2:</label>
          <input
            type="text"
            id="imei2"
            value={imei2}
            onChange={(e) => setImei2(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="salePrice">Sale Price:</label>
          <input
            type="number"
            id="salePrice"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="cost">Cost:</label>
          <input
            type="number"
            id="cost"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="descriptionId">Description:</label>
          <select
            id="descriptionId"
            value={descriptionId}
            onChange={(e) => setDescriptionId(e.target.value)}
            required
          >
            <option value="">Select Description</option>
            {descriptions.map((desc) => (
              <option key={desc.descriptionId} value={desc.descriptionId}>
                {desc.descriptionText}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="supplierId">Supplier:</label>
          <select
            id="supplierId"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            required
          >
            <option value="">Select Supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.supplierId} value={supplier.supplierId}>
                {supplier.supplierName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dateReceived">Date Received:</label>
          <input
            type="date"
            id="dateReceived"
            value={dateReceived}
            onChange={(e) => setDateReceived(e.target.value)}
            required
          />
        </div>

        <p>Scan IMEI code with a barcode scanner to submit automatically.</p>
      </form>
    </div>
  );
};

export default AddItemDetails;
