import React, { useState, useEffect } from 'react';
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
  const [quantity, setQuantity] = useState('');
  const [items, setItems] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
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
  }, []);

  const handleSubmit = async () => {
    if (!itemId || !serialNumber || !salePrice || !quantity || !descriptionId || !supplierId) {
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
    };

    try {
      await axios.post('http://localhost:5257/api/ItemDetails', newItemDetail);
      alert('Item detail added successfully!');

      // Clear form fields
      setItemId('');
      setSerialNumber('');
      setImei1('');
      setImei2('');
      setSalePrice('');
      setCost('');
      setDescriptionId('');
      setSupplierId('');
      setQuantity('');
    } catch (error) {
      console.error('Error adding item detail:', error);
      alert('Failed to add item detail.');
    }
  };

  const getItemName = (id) => {
    const item = items.find((i) => String(i.itemId) === String(id));
    return item ? item.name : 'Unknown Item';
  };

  const getSupplierName = (id) => {
    const supplier = suppliers.find((s) => String(s.supplierId) === String(id));
    return supplier ? supplier.supplierName : 'Unknown Supplier';
  };

  const getDescriptionText = (id) => {
    const description = descriptions.find((d) => String(d.descriptionId) === String(id));
    return description ? description.descriptionText : 'Unknown Description';
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
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="imei1">IMEI 1:</label>
          <input
            type="text"
            id="imei1"
            value={imei1}
            onChange={(e) => setImei1(e.target.value)}
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
            required
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
          <label htmlFor="quantity">Quantity:</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <div className="form-group full-width">
          <button type="button" onClick={handleSubmit} className="btn btn-success">
            Submit Item Detail
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddItemDetails;
