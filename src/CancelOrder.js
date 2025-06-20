import React, { useState } from 'react';

const CancelOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setMessage('');

    if (!orderId || isNaN(orderId) || parseInt(orderId) <= 0) {
      setMessage('⚠️ Please enter a valid Order ID.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5257/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: parseInt(orderId) })
      });

      const result = await res.json(); // always try to parse the response

      if (res.ok) {
        setMessage(`✅ ${result.message}`);
      } else {
        const errorMsg = result.message || result.error || 'Unknown error occurred.';
        if (errorMsg.toLowerCase().includes('already cancelled')) {
          setMessage('⚠️ This order has already been cancelled.');
        } else if (errorMsg.toLowerCase().includes('not found')) {
          setMessage('❌ Order ID not found.');
        } else {
          setMessage(`❌ ${errorMsg}`);
        }
      }
    } catch (err) {
      console.error('API Error:', err);
      setMessage('❌ Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <h2>Cancel Order</h2>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label htmlFor="orderId">Order ID:</label>
        <input
          type="number"
          id="orderId"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter order ID to cancel"
          style={{
            padding: '0.5rem',
            width: '100%',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </div>

      <button
        onClick={handleCancel}
        disabled={loading}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold'
        }}
      >
        {loading ? 'Cancelling...' : 'Cancel Order'}
      </button>

      {message && (
        <div style={{ marginTop: '1rem', fontWeight: 'bold', color: message.includes('✅') ? 'green' : 'darkred' }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default CancelOrder;
