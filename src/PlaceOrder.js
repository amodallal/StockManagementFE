import React, { useState, useRef, useEffect } from 'react';
import {
  fetch_item_by_scanned_code,
} from './Functions';

const PlaceOrder = () => {
  const [scannedCode, setScannedCode] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [bulkEnabled, setBulkEnabled] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch('http://localhost:5257/api/customers');
        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        console.error('Failed to fetch customers:', err);
      }
    };
    fetchCustomers();
  }, []);

  const handleScan = async () => {
    const code = scannedCode.trim();
    if (!code) return;

    try {
      const items = await fetch_item_by_scanned_code(code);

      if (!items || items.length === 0) {
        alert('This item does not exist in the database.');
        setScannedCode(''); // ✅ clear input

        return;
      }

      const sorted = [...items].sort(
        (a, b) => new Date(a.dateReceived) - new Date(b.dateReceived)
      );

      const firstItem = sorted[0];
      const identifier = firstItem.categoryIdentifier?.toLowerCase();

      // For Imei or sn: only 1, no duplicates
      if (identifier === 'imei' || identifier === 'sn') {
        const alreadyAdded = orderItems.some(x => x.itemDetailsId === firstItem.itemDetailsId);
        if (alreadyAdded) {
          alert('This item has already been added to the current order.');
          return;
        }

        setOrderItems([...orderItems, { ...firstItem, quantity: 1, discount: 0 }]);
        setScannedCode('');
        return;
      }

      // For barcode: default quantity = 1, or prompt if bulk is enabled
      const totalStock = sorted.reduce((sum, item) => sum + item.quantity, 0);
      if (totalStock <= 0) {
        alert('Item is out of stock in the system.');
        return;
      }

      const itemDetailIds = new Set(sorted.map((i) => i.itemDetailsId));
      const existingQty = orderItems
        .filter((x) => itemDetailIds.has(x.itemDetailsId))
        .reduce((sum, x) => sum + x.quantity, 0);

      const availableStock = totalStock - existingQty;
      if (availableStock <= 0) {
        alert('All available stock for this item has already been added to the current order.');
        return;
      }

      let requestedQty = 1;

      if (bulkEnabled) {
        const requestedQtyStr = prompt(`Available stock: ${availableStock}\nEnter quantity to add:`, '1');
        const qty = Number(requestedQtyStr);

        if (
          requestedQtyStr === null ||
          requestedQtyStr.trim() === '' ||
          isNaN(qty) ||
          qty <= 0 ||
          !Number.isInteger(qty)
        ) {
          alert('Invalid quantity. Defaulting to 1.');
        } else if (qty > availableStock) {
          alert(`Only ${availableStock} available to add.`);
          return;
        } else {
          requestedQty = qty;
        }
      }

      let qtyToAllocate = requestedQty;
      const updatedOrderItems = [...orderItems];

      for (const batch of sorted) {
        if (qtyToAllocate <= 0) break;

        const existing = updatedOrderItems.find(x => x.itemDetailsId === batch.itemDetailsId);
        const alreadyQty = existing?.quantity || 0;
        const batchAvailableQty = batch.quantity - alreadyQty;

        if (batchAvailableQty <= 0) continue;

        const allocateQty = Math.min(qtyToAllocate, batchAvailableQty);
        qtyToAllocate -= allocateQty;

        if (existing) {
          existing.quantity += allocateQty;
        } else {
          updatedOrderItems.push({ ...batch, quantity: allocateQty, discount: 0 });
        }
      }

      setOrderItems(updatedOrderItems);
      setScannedCode('');
    } catch (err) {
      console.error('Error fetching scanned item:', err);
      alert('Failed to scan item.');
    } finally {
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleScan();
  };

  const totalSalePrice = orderItems.reduce((sum, item) =>
    sum + ((item.salePrice - (item.discount || 0)) * item.quantity), 0
  );
  const discountedPrice = totalSalePrice - discount;
  const vat = discountedPrice * 0.11;
  const grandTotal = discountedPrice + vat;

  const placeOrder = async () => {
    const employee = JSON.parse(localStorage.getItem('employee'));
    if (!employee || !employee.employeeId) {
      alert("You're not logged in.");
      return;
    }

    const payload = {
      customerId: parseInt(selectedCustomerId),
      statusId: 13,
      orderDiscount: discount,
      employeeId: employee.employeeId,
      items: orderItems.map(item => ({
        itemDetailsId: item.itemDetailsId,
        quantity: item.quantity,
        discount: item.discount || 0,
        salePrice: item.salePrice
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
        alert(`Order placed successfully! Order ID: ${result.orderId ?? 'N/A'}`);

        const customer = customers.find(c => c.customerId == selectedCustomerId);

        const invoiceHTML = `
          <html>
            <head>
              <title>Invoice #${result.orderId}</title>
              <style>
                body { font-family: Arial; padding: 20px; }
                h2 { text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                th { background: #f0f0f0; }
                .totals { margin-top: 20px; font-weight: bold; }
              </style>
            </head>
            <body>
              <h2>Invoice - Order #${result.orderId}</h2>
              <p><strong>Customer:</strong> ${customer?.firstName} ${customer?.lastName}</p>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Identifier</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItems.map(item => `
                    <tr>
                      <td>${item.itemName}</td>
                      <td>${item.imei1 || item.serialNumber || item.barcode || '-'}</td>
                      <td>${item.quantity}</td>
                      <td>$${item.salePrice.toFixed(2)}</td>
                      <td>$${(item.discount || 0).toFixed(2)}</td>
                      <td>$${((item.salePrice - (item.discount || 0)) * item.quantity).toFixed(2)}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
              <div class="totals">
                <p>Total: $${totalSalePrice.toFixed(2)}</p>
                <p>Discount: $${discount.toFixed(2)}</p>
                <p>VAT (11%): $${vat.toFixed(2)}</p>
                <p>Grand Total: $${grandTotal.toFixed(2)}</p>
              </div>
              <script>window.onload = () => { window.print(); }</script>
            </body>
          </html>
        `;

        const win = window.open('', '_blank');
        win.document.open();
        win.document.write(invoiceHTML);
        win.document.close();

        setOrderItems([]);
        setDiscount(0);
        setScannedCode('');
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
        <label>Select Customer:</label>
        <select
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
        >
          <option value="">-- Select Customer --</option>
          {customers.map(c => (
            <option key={c.customerId} value={c.customerId}>
              {c.firstName} {c.lastName} ({c.phoneNumber})
            </option>
          ))}
        </select>
      </div>

      <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
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

      <div style={{ marginTop: '0.5rem' }}>
        <label>
          <input
            type="checkbox"
            checked={bulkEnabled}
            onChange={(e) => setBulkEnabled(e.target.checked)}
          />
          Enable bulk quantity input
        </label>
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
                <th>Qty</th>
                <th>Total Price</th>
                <th>Unit Discount</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, i) => (
                <tr key={i}>
                  <td>{item.itemName}</td>
                  <td>{item.imei1 || item.serialNumber || item.barcode || '-'}</td>
                  <td>{item.supplierName}</td>
                  <td>{new Date(item.dateReceived).toLocaleDateString()}</td>
                  <td>{item.quantity}</td>
                  <td>${item.salePrice.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      value={item.discount ?? 0}
                      min="0"
                      max={item.salePrice}
                      step="0.01"
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        const updated = [...orderItems];
                        updated[i].discount = val;
                        setOrderItems(updated);
                      }}
                    />
                  </td>
                  <td>
                    ${((item.salePrice - (item.discount || 0)) * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
            <p>Total Price: ${totalSalePrice.toFixed(2)}</p>
            <p>VAT (11%): ${vat.toFixed(2)}</p>
         {/* 
<p>
  Order Discount: $
  <input
    type="number"
    value={discount}
    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
    placeholder="0"
    style={{ width: '80px' }}
  />
</p> 
*/}
            <p>Grand Total: ${grandTotal.toFixed(2)}</p>
          </div>

          <button onClick={placeOrder} style={{ marginTop: '1rem' }}>
            Place Order
          </button>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;