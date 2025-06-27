import React, { useState, useRef, useEffect } from 'react';
import {
  fetch_item_by_mn_imei,
  fetch_item_by_serial,
  fetch_item_by_barcode,
} from './Functions';

const PlaceOrder = () => {
  const [scannedCode, setScannedCode] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
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
          requestedQtyStr === null ||
          requestedQtyStr.trim() === '' ||
          isNaN(requestedQty) ||
          requestedQty <= 0 ||
          !Number.isInteger(requestedQty)
        ) {
          alert('Invalid quantity.');
          return;
        }

        if (requestedQty > availableStock) {
          const msg = `Only ${availableStock} available to add.` +
            (existingQtyForBarcode > 0 ? ` You’ve already added ${existingQtyForBarcode}.` : '');
          alert(msg);
          return;
        }

        let qtyToAllocate = requestedQty;
        const updatedOrderItems = [...orderItems];

        for (const batch of sorted) {
          if (qtyToAllocate <= 0) break;

          const existing = updatedOrderItems.find(x => x.itemDetailsId === batch.itemDetailsId);
          const alreadyQty = existing?.quantity || 0;
          const availableQty = batch.quantity - alreadyQty;

          if (availableQty <= 0) continue;

          const allocateQty = Math.min(qtyToAllocate, availableQty);
          qtyToAllocate -= allocateQty;

          if (existing) {
            existing.quantity += allocateQty;
          } else {
            updatedOrderItems.push({ ...batch, quantity: allocateQty, discount: 0 });
          }
        }

        setOrderItems(updatedOrderItems);
        setScannedCode('');
        return;
      }

      if (!items || items.quantity <= 0) {
        alert(`Item "${items?.itemName || 'Unnamed'}" is out of stock.`);
        return;
      }

      const exists = orderItems.some(x => x.itemDetailsId === items.itemDetailsId);
      if (exists) {
        const name = items.itemName || items.modelNumber || items.imei1 || items.serialNumber || items.barcode || 'unknown';
        alert(`Item "${name}" already added.`);
        return;
      }

      items.quantity = 1;
      items.discount = 0;
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

        // Reset state
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
