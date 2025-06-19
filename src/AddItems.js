import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './styles.css';
import { fetch_itm_sup , fetch_items,fetch_supplier_item} from './Functions';
import { playBuzzer} from './Functions';
import {checkIMEIExists } from './Functions';
import {checkSNExists } from './Functions';

const AddItemDetails = () => {
  // State for form fields
  const [itemId, setItemId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [imei1, setImei1] = useState('');
  const [imei2, setImei2] = useState('');
  const [barcode, setBarcode] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [cost, setCost] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [dateReceived, setDateReceived] = useState('');
  // New state for bulk quantity
  const [quantity, setQuantity] = useState(1);

  // State for UI control and data
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [addedItems, setAddedItems] = useState([]);
  const [modelNumber, setModelNumber] = useState('');
  const [description, setDescription] = useState('');
  const [identifier, setIdentifier] = useState(null); // 'sn', 'imei', or 'barcode' (always lowercase)

  // Refs for focusing on specific inputs
  const snInputRef = useRef(null);
  const imeiInputRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const quantityInputRef = useRef(null); // Ref for the new quantity input

  // --- EFFECTS ---

  // Effect for initial data fetch
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDateReceived(today);

    const fetchData = async () => {
      try {
        const { items, suppliers } = await fetch_itm_sup();
        setItems(items || []);
        setSuppliers(suppliers || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        alert('Could not fetch items and suppliers.');
      }
    };
    fetchData();
  }, []);

  // Effect to focus on the correct input when an item is selected
  useEffect(() => {
    if (!identifier) return;

    const focusTimeout = setTimeout(() => {
      switch (identifier) {
        case 'sn':
          snInputRef.current?.focus();
          break;
        case 'imei':
          imeiInputRef.current?.focus();
          break;
        case 'barcode':
          barcodeInputRef.current?.focus();
          break;
        default:
          break;
      }
    }, 100);

    return () => clearTimeout(focusTimeout);
  }, [identifier]);

  // --- HANDLERS ---

  const handleItemChange = (e) => {
    const selectedItemId = e.target.value;
    const selectedItem = items.find((item) => String(item.itemId) === selectedItemId);

    if (selectedItem) {
      if (!supplierId || !salePrice || !cost) {
        alert('Please fill Supplier, Sale Price, and Cost before selecting an item.');
        e.target.value = '';
        return;
      }
      setItemId(selectedItem.itemId);
      setModelNumber(selectedItem.modelNumber || '');
      setDescription(selectedItem.description || '');
      setIdentifier(selectedItem.identifier?.toLowerCase() || null);
      setSerialNumber('');
      setImei1('');
      setImei2('');
      setBarcode('');
      // Reset quantity to 1 for new item selections
      setQuantity(1);
    } else {
      handleReset();
    }
  };

  const handleReset = () => {
      setItemId('');
      setModelNumber('');
      setDescription('');
      setIdentifier(null);
      setSalePrice('');
      setCost('');
      setSupplierId('');
      setAddedItems([]);
      setSerialNumber('');
      setImei1('');
      setImei2('');
      setBarcode('');
      setQuantity(1);
  };

  const handleSubmit = async () => {
    if (!identifier) {
      alert('Please select a valid item first.');
      return;
    }

    let submissionData = {};
    let isValid = true;

    switch (identifier) {
      case 'imei':
        if (!imei1 || imei1.length !== 15) {
          playBuzzer();
          alert('IMEI 1 must be exactly 15 digits.');
          setImei1('');
          isValid = false;
        } else if (await checkIMEIExists(imei1)) {
          playBuzzer();
          alert('This IMEI already exists in the database!');
          setImei1('');
          setImei2('');
          isValid = false;
        } else {
          submissionData = { imei1, imei2 };
        }
        imeiInputRef.current?.focus();
        break;

      case 'sn':
        if (!serialNumber.trim()) {
          playBuzzer();
          alert('Serial Number cannot be empty.');
          isValid = false;
         } else if (await checkSNExists(serialNumber)) {
          playBuzzer();
          alert('This serial number already exists in the database!');
          setSerialNumber('');
          isValid = false;
        } else {
          submissionData = { serialNumber };
        }
        snInputRef.current?.focus();
        break;

      case 'barcode':
        if (!barcode.trim()) {
          playBuzzer();
          alert('Barcode cannot be empty.');
          isValid = false;
        // Also validate the quantity for barcode items
        } else if (isNaN(quantity) || Number(quantity) < 1) {
            playBuzzer();
            alert('Please enter a valid quantity of at least 1.');
            isValid = false;
            quantityInputRef.current?.focus();
        } else {
          submissionData = { barcode };
        }
        barcodeInputRef.current?.focus();
        break;

      default:
        alert("The selected item does not have a valid identifier (SN, IMEI, barcode).");
        isValid = false;
        break;
    }

    if (!isValid) return;

    const newItemDetail = {
      itemId,
      supplierId,
      salePrice,
      cost,
      // Use the state for quantity. It will be 1 unless changed for a barcode item.
      quantity: String(quantity),
      dateReceived,
      ...submissionData,
    };

    try {
      await axios.post('http://localhost:5257/api/ItemDetails', newItemDetail);
      const selectedItem = items.find((item) => String(item.itemId) === String(itemId));
      setAddedItems((prev) => [{ itemName: selectedItem.name, ...newItemDetail }, ...prev]);
      setSerialNumber('');
      setImei1('');
      setImei2('');
      setBarcode('');
      // Do not reset quantity here, so it can be reused for the next barcode scan
    } catch (error) {
      console.error('Error adding item detail:', error);
      alert('Failed to add item detail. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="container">
      <h2 className="title">Add Items</h2>
        <div className="form">
          {/* --- Main static form fields --- */}
          <div className="grid">
            <div>
              <div className="form-group">
                <label htmlFor="supplierId">Supplier:</label>
                <select id="supplierId" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} disabled={!!itemId} required>
                  <option value="">Select Supplier</option>
                  {(suppliers || []).map((supplier) => (
                    <option key={supplier.supplierId} value={supplier.supplierId}>{supplier.supplierName}</option>
                  ))}
                </select>
              </div>
               <div className="form-group">
                <label htmlFor="salePrice">Sale Price:</label>
                <input type="number" id="salePrice" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} disabled={!!itemId}/>
              </div>
              <div className="form-group">
                <label htmlFor="cost">Cost:</label>
                <input type="number" id="cost" value={cost} onChange={(e) => setCost(e.target.value)} disabled={!!itemId} />
              </div>
              <div className="form-group">
                  <label htmlFor="dateReceived">Date Received:</label>
                  <input type="date" id="dateReceived" value={dateReceived} onChange={(e) => setDateReceived(e.target.value)} disabled={!!itemId} required />
              </div>
            </div>
            <div>
              <div className="form-group">
                <label htmlFor="itemId">Item:</label>
                <select id="itemId" value={itemId} onChange={handleItemChange} disabled={!!itemId} required>
                  <option value="">Select Product to Start Scanning</option>
                  {(items || []).map((item) => (
                    <option key={item.itemId} value={item.itemId}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="ModelNumber">Model Number</label>
                <input type="text" id="ModelNumber" value={modelNumber} disabled />
              </div>
               <div className="form-group">
                <label htmlFor="Description">Description</label>
                <input type="text" id="Description" value={description} disabled />
              </div>
               <button type="button" onClick={handleReset} className="btn btn-success" >
                 Clear Form
               </button>
            </div>
          </div>
        </div>

          {/* --- Dynamic Input Section --- */}
          {identifier && (
            <div className="scan-section">
                <h3>Scan Item ({identifier.toUpperCase()})</h3>
                {/* Conditionally render the quantity input for barcode items */}
                {identifier === 'barcode' && (
                    <div className="form-group">
                        <label htmlFor="quantity">Quantity:</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            onKeyPress={handleKeyPress}
                            ref={quantityInputRef}
                            min="1"
                            className="input-quantity" // Add a specific class for styling
                        />
                    </div>
                )}
              <div className="form-group">
                <label htmlFor="serialNumber">Serial Number:</label>
                <input type="text" id="serialNumber" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} onKeyPress={handleKeyPress} ref={snInputRef} disabled={identifier !== 'sn'} placeholder={identifier !== 'sn' ? 'NA' : 'Enter Serial Number'}/>
              </div>
              <div className="form-group">
                <label htmlFor="barcode">Barcode:</label>
                <input type="text" id="barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} onKeyPress={handleKeyPress} ref={barcodeInputRef} disabled={identifier !== 'barcode'} placeholder={identifier !== 'barcode' ? 'NA' : 'Scan Barcode'}/>
              </div>
               <div className="form-group">
                <label htmlFor="imei1">IMEI 1:</label>
                <input type="text" id="imei1" value={imei1} onChange={(e) => setImei1(e.target.value)} onKeyPress={handleKeyPress} ref={imeiInputRef} disabled={identifier !== 'imei'} placeholder={identifier !== 'imei' ? 'NA' : 'Scan IMEI 1'}/>
              </div>
              <div className="form-group">
                <label htmlFor="imei2">IMEI 2:</label>
                <input type="text" id="imei2" value={imei2} onChange={(e) => setImei2(e.target.value)} onKeyPress={handleKeyPress} disabled={identifier !== 'imei'} placeholder={identifier !== 'imei' ? 'NA' : 'Enter/Scan IMEI 2 (Optional)'}/>
              </div>
            </div>
          )}

        {/* Display Grid of Added Items - Now includes quantity */}
        {addedItems.length > 0 && (
            <div className="added-items">
                <h3>Recently Added Items</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Identifier Value</th>
                            <th>Quantity</th>
                            <th>Sale Price</th>
                            <th>Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {addedItems.map((item, index) => (
                            <tr key={index}>
                                <td>{item.itemName}</td>
                                <td>{item.imei1 || item.serialNumber || item.barcode}</td>
                                <td>{item.quantity}</td>
                                <td>{item.salePrice}</td>
                                <td>{item.cost}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
};

export default AddItemDetails;