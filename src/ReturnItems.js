import React, { useState } from 'react';
import './styles.css';

const ReturnItems = () => {
  const [orderId, setOrderId] = useState('');
  const [notes, setNotes] = useState('');
  const [orderedItems, setOrderedItems] = useState([]);
  const [returnData, setReturnData] = useState({}); // key: itemDetailsId

  const fetchOrderItems = async () => {
    if (!orderId) return alert('Enter order ID');
    try {
      const res = await fetch(`http://localhost:5257/api/orders/get-order-items/${orderId}`);
      const data = await res.json();
      if (!Array.isArray(data)) {
        alert('Order not found');
        return;
      }
      setOrderedItems(data);
      setReturnData({});
    } catch (err) {
      console.error(err);
      alert('Failed to fetch order items');
    }
  };

  const handleChange = (id, field, value) => {
    setReturnData((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: field === 'isDamaged'
          ? value.target.checked
          : typeof value === 'object'
          ? value.target.value
          : value,
      },
    }));
  };

  const handleSubmit = async () => {
    const items = Object.entries(returnData)
      .filter(([_, val]) => val.quantity > 0)
      .map(([id, val]) => ({
        itemDetailsId: parseInt(id),
        quantity: parseInt(val.quantity),
        isDamaged: !!val.isDamaged,
        reason: val.reason || '',
      }));

    if (!orderId || items.length === 0) {
      alert('Enter order ID and at least one valid return.');
      return;
    }

    const payload = {
      orderId: parseInt(orderId),
      notes,
      items,
    };

    try {
      const res = await fetch('http://localhost:5257/api/returns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        alert('Return submitted successfully!');
        setOrderedItems([]);
        setReturnData({});
        setOrderId('');
        setNotes('');
      } else {
        alert(result.message || 'Failed to return items.');
      }
    } catch (err) {
      console.error(err);
      alert('API error.');
    }
  };

  const getDisplayValue = (val) =>
    typeof val === 'string' || typeof val === 'number'
      ? val
      : val === null || val === undefined
      ? '—'
      : JSON.stringify(val);

  return (
    <div className="container">
      <h2>Return Items</h2>
      <div>
        <label>Order ID:</label>
        <input
          type="number"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter order ID"
        />
        <button onClick={fetchOrderItems}>Load Items</button>
      </div>

      {orderedItems.length > 0 && (
        <>
          <div style={{ marginTop: '1rem' }}>
            <label>Return Notes:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
            />
          </div>

          <table border="1" cellPadding="6" style={{ marginTop: '1rem', width: '100%' }}>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Identifier</th>
                <th>Qty Ordered</th>
                <th>Qty to Return</th>
                <th>Damaged</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {orderedItems.map((item) => (
                <tr key={item.itemDetailsId}>
                  <td>{getDisplayValue(item.itemName || item.modelNumber || 'Unnamed')}</td>
                  <td>
  {
    typeof item.imei1 === 'string' && item.imei1.length > 0 ? item.imei1 :
    typeof item.serialNumber === 'string' && item.serialNumber.length > 0 ? item.serialNumber :
    typeof item.barcode === 'string' && item.barcode.length > 0 ? item.barcode :
    '—'
  }
</td>
                  <td>{getDisplayValue(item.quantity)}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max={item.quantity}
                      value={returnData[item.itemDetailsId]?.quantity || ''}
                      onChange={(e) =>
                        handleChange(item.itemDetailsId, 'quantity', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={returnData[item.itemDetailsId]?.isDamaged || false}
                      onChange={(e) =>
                        handleChange(item.itemDetailsId, 'isDamaged', e)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={returnData[item.itemDetailsId]?.reason || ''}
                      onChange={(e) =>
                        handleChange(item.itemDetailsId, 'reason', e.target.value)
                      }
                      placeholder="Reason"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleSubmit}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Submit Return
          </button>
        </>
      )}
    </div>
  );
};

export default ReturnItems;
