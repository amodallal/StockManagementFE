import React, { useState, useRef } from 'react';
import {
  fetch_item_by_mn_imei,
  fetch_item_by_serial,
  fetch_item_by_barcode,
} from './Functions';

const PlaceOrder = () => {
  const [scannedCode, setScannedCode] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const inputRef = useRef();

  const handleScan = async () => {
    const code = scannedCode.trim();
    if (!code) return;

     let result = null;
    let items = null;

try {
  result = await fetch_item_by_mn_imei(code);
  items = result?.items;
  
  if (!items) {
    result = await fetch_item_by_serial(code);
    items = result?.items;
  }

  if (!items) {
    result = await fetch_item_by_barcode(code);
    items = result?.items;
  }


      console.log('Fetched item:', items);

      if (!items) {
        alert('This item does not exist in database.');
        return;
      }

      if (items.quantity <= 0) {
        alert(`Item "${items.itemName || items.modelNumber || 'Unnamed'}" is out of stock.`);
        return;
      }

      const exists = orderItems.some(x => x.itemDetailsId === items.itemDetailsId);
      if (exists) {
        const name = items.itemName || items.modelNumber || items.imei1 || items.serialNumber || items.barcode || 'unknown';
        alert(`Item "${name}" already added.`);
        return;
      }

      setOrderItems(prev => [items, ...prev]);
      setScannedCode('');
    } catch (err) {
      console.error('Error fetching item:', err);
      alert('Error fetching item. Please try again.');
    } finally {
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleScan();
  };

  return (
    <div className="container">
      <h2 className="title">Place Order</h2>

      <div className="form-group">
        <label htmlFor="scanner">Scan Code (IMEI / Serial / Barcode):</label>
        <input
          id="scanner"
          type="text"
          value={scannedCode}
          onChange={e => setScannedCode(e.target.value)}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          placeholder="Scan or enter item code"
          autoFocus
        />
        <button onClick={handleScan}>Add Item</button>
      </div>

      {orderItems.length > 0 && (
        <div className="added-items">
          <h3>Scanned Items</h3>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Identifier</th>
                <th>Sale Price</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((items, i) => (
                <tr key={i}>
                  <td>{items.itemName || 'Unnamed'}</td>
                  <td>{items.imei1 || items.serialNumber || items.barcode || '—'}</td>
                  <td>${items.salePrice?.toFixed(2) ?? '0.00'}</td>
                  <td>${items.cost?.toFixed(2) ?? '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;
