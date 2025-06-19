import React, { useState, useRef } from 'react';
import {
  fetch_item_by_mn_imei,
  fetch_item_by_serial,
  fetch_item_by_barcode,
} from './Functions';

const PlaceOrder = () => {
  const [scannedCode, setScannedCode] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [discount, setDiscount] = useState(0);
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
        const barcodeItems = result?.items;

        if (!barcodeItems || !Array.isArray(barcodeItems) || barcodeItems.length === 0) {
          alert('This item does not exist in database.');
          return;
        }

        const sorted = [...barcodeItems].sort(
          (a, b) => new Date(a.dateReceived) - new Date(b.dateReceived)
        );

        const totalStock = sorted.reduce((sum, b) => sum + b.quantity, 0);

        if (totalStock <= 0) {
          alert('Item is out of stock in the system.');
          return;
        }

        const barcodeItemIds = new Set(barcodeItems.map((b) => b.itemDetailsId));

        const existingQtyForBarcode = orderItems
          .filter((x) => barcodeItemIds.has(x.itemDetailsId))
          .reduce((sum, x) => sum + x.quantity, 0);

        const availableStock = totalStock - existingQtyForBarcode;

        if (availableStock <= 0) {
          alert('All available stock for this item has already been added to the current order.');
          return;
        }
      const requestedQtyStr = prompt(
      `Available stock: ${availableStock}\nEnter quantity to add:`,
      '1'
        );

    const requestedQty = Number(requestedQtyStr);

if (
  requestedQtyStr === null || // Cancel pressed
  requestedQtyStr.trim() === '' ||
  isNaN(requestedQty) ||
  requestedQty <= 0 ||
  !Number.isInteger(requestedQty)
) {
  alert('Invalid quantity.');
  return;
}

       if (requestedQty > availableStock) {
  const baseMsg = `Only ${availableStock} available to add.`;
  const alreadyAdded = existingQtyForBarcode > 0
    ? ` You’ve already added ${existingQtyForBarcode} of this item.`
    : '';
  alert(baseMsg + alreadyAdded);
  return;
}

        let qtyToAllocate = requestedQty;
        const updatedOrderItems = [...orderItems];

        for (const batch of sorted) {
          if (qtyToAllocate <= 0) break;

          const existing = updatedOrderItems.find(
            (x) => x.itemDetailsId === batch.itemDetailsId
          );
          const alreadyQty = existing?.quantity || 0;
          const availableQty = batch.quantity - alreadyQty;

          if (availableQty <= 0) continue;

          const allocateQty = Math.min(qtyToAllocate, availableQty);
          qtyToAllocate -= allocateQty;

          if (existing) {
            existing.quantity += allocateQty;
          } else {
            updatedOrderItems.push({ ...batch, quantity: allocateQty });
          }
        }

        setOrderItems(updatedOrderItems);
        setScannedCode('');
        return;
      }

      if (!items) {
        alert('This item does not exist in database.');
        return;
      }

      if (items.quantity <= 0) {
        alert(
          `Item "${items.itemName || items.modelNumber || 'Unnamed'}" is out of stock.`
        );
        return;
      }

      const exists = orderItems.some(
        (x) => x.itemDetailsId === items.itemDetailsId
      );
      if (exists) {
        const name =
          items.itemName ||
          items.modelNumber ||
          items.imei1 ||
          items.serialNumber ||
          items.barcode ||
          'unknown';
        alert(`Item "${name}" already added.`);
        return;
      }

      items.quantity = 1;
      setOrderItems((prev) => [items, ...prev]);
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

  const totalSalePrice = orderItems.reduce(
    (sum, item) => sum + item.salePrice * item.quantity,
    0
  );
  const vat = totalSalePrice * 0.11;
  const grandTotal = totalSalePrice + vat - discount;

  const placeOrder = async () => {
    const payload = {
      customerId: 1,
      statusId: 13,
      orderDiscount: discount,
      items: orderItems.map((item) => ({
        itemDetailsId: item.itemDetailsId,
        quantity: item.quantity,
        discount: 0,
        salePrice: item.salePrice,
      })),
    };

    try {
      const res = await fetch('http://localhost:5257/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        alert('Order placed successfully!');
        setOrderItems([]);
        setDiscount(0);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (err) {
      console.error('Place Order Error:', err);
      alert('Failed to place order.');
    }
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
          onChange={(e) => setScannedCode(e.target.value)}
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
                <th>Supplier</th>
                <th>Date Received</th>
                <th>Quantity</th>
                <th>Sale Price</th>
                <th>Cost</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, i) => (
                <tr key={i}>
                  <td>{item.itemName || 'Unnamed'}</td>
                  <td>{item.imei1 || item.serialNumber || item.barcode || '—'}</td>
                  <td>{item.supplierName}</td>
                  <td>{new Date(item.dateReceived).toLocaleDateString()}</td>
                  <td>{item.quantity}</td>
                  <td>${item.salePrice?.toFixed(2) ?? '0.00'}</td>
                  <td>${item.cost?.toFixed(2) ?? '0.00'}</td>
                  <td>${((item.salePrice ?? 0) * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="total-summary" style={{ marginTop: '1rem', fontWeight: 'bold' }}>
            <div>Total Sale Price: ${totalSalePrice.toFixed(2)}</div>
            <div>VAT (11%): ${vat.toFixed(2)}</div>
            <div>
              Discount: $
              <input
                type="number"
                value={discount}
                onChange={(e) => {
                  const val = e.target.value;
                  setDiscount(val === '' ? '' : parseFloat(val) || 0);
                }}
                onFocus={(e) => {
                  if (discount === 0) e.target.select();
                }}
                placeholder="0"
                style={{ width: '80px', marginLeft: '0.5rem' }}
              />
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              Grand Total: ${grandTotal.toFixed(2)}
            </div>
          </div>

          <button
            onClick={placeOrder}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              fontWeight: 'bold',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;
