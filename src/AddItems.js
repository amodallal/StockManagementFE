import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './styles.css';
import { playBuzzer } from './Functions';
import { checkIMEIExists } from './Functions';
import { checkSNExists } from './Functions';
import { fetchFilteredSuppliers, fetchFilteredProducts, postItemDetail } from './Functions';



const AddItemDetails = () => {
  const [itemId, setItemId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [imei1, setImei1] = useState('');
  const [imei2, setImei2] = useState('');
  const [barcode, setBarcode] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [cost, setCost] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [dateReceived, setDateReceived] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [lockedBarcode, setLockedBarcode] = useState('');
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [addedItems, setAddedItems] = useState([]);
  const [modelNumber, setModelNumber] = useState('');
  const [description, setDescription] = useState('');
  const [identifier, setIdentifier] = useState(null);
  const [searchSupplier, setSearchSupplier] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [supplierSelected, setSupplierSelected] = useState(false);
  const [productSelected, setProductSelected] = useState(false);

  const snInputRef = useRef(null);
  const imeiInputRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const quantityInputRef = useRef(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDateReceived(today);
  }, []);



const handleSupplierSearchChange = async (e) => {
  const value = e.target.value;
  setSearchSupplier(value);
  setSupplierSelected(false);

  if (value.trim().length >= 2) {
    const data = await fetchFilteredSuppliers(value);
    setSuppliers(data);
  } else {
    setSuppliers([]);
  }
};
const handleProductSearchChange = async (e) => {
  const value = e.target.value;
  setSearchProduct(value);
  setProductSelected(false);

  if (value.trim().length >= 2) {
    const data = await fetchFilteredProducts(value);
    setItems(data);
  } else {
    setItems([]);
  }
};

  const handleSupplierSelect = (supplier) => {
    setSupplierId(supplier.supplierId);
    setSearchSupplier(supplier.supplierName);
    setSupplierSelected(true);
    setSuppliers([]);
  };

  const handleItemSelect = (item) => {
  if (!supplierId || !salePrice || !cost) {
    alert('Please fill Supplier, Sale Price, and Cost before selecting an item.');
    return;
  }

  setItemId(item.itemId);
  setModelNumber(item.modelNumber || '');
  setDescription(item.description || '');
  setIdentifier(item.identifier?.toLowerCase() || null);

  // ✅ Set the searchProduct first
  setSearchProduct(item.name);

  // ✅ Then lock
  setProductSelected(true);

  setItems([]);

  if (item?.identifier?.toLowerCase() === 'barcode') {
    setLockedBarcode(item.barcode || '');
  } else {
    setLockedBarcode('');
  }

  setSerialNumber('');
  setImei1('');
  setImei2('');
  setBarcode('');
  setQuantity(1);

  setTimeout(() => {
    if (item.identifier?.toLowerCase() === 'sn') snInputRef.current?.focus();
    if (item.identifier?.toLowerCase() === 'imei') imeiInputRef.current?.focus();
    if (item.identifier?.toLowerCase() === 'barcode') barcodeInputRef.current?.focus();
  }, 100);
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
    setSearchSupplier('');
    setSearchProduct('');
    setSupplierSelected(false);
    setProductSelected(false);
    setLockedBarcode('');
    setItems([]);
    setSuppliers([]);
  };

  const handleSubmit = async () => {
    if (!identifier) {
      alert('Please select a product first.');
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
          alert('This IMEI already exists!');
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
          alert('This serial number already exists!');
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
        } else if (isNaN(quantity) || Number(quantity) < 1) {
          playBuzzer();
          alert('Quantity must be at least 1.');
          isValid = false;
          quantityInputRef.current?.focus();
        } else if (barcode.trim() !== lockedBarcode.trim()) {
          playBuzzer();
          alert('Scanned barcode does not match expected barcode!');
          isValid = false;
        } else {
          submissionData = { barcode };
        }
        barcodeInputRef.current?.focus();
        break;

      default:
        alert('Invalid identifier.');
        isValid = false;
        break;
    }

    if (!isValid) return;

    const newItemDetail = {
      itemId,
      supplierId,
      salePrice,
      cost,
      quantity: String(quantity),
      dateReceived,
      ...submissionData,
    };

    try {
      await postItemDetail(newItemDetail);

      const displayItem = {
        itemName: searchProduct,
        ...newItemDetail,
      };

      setAddedItems((prev) => [displayItem, ...prev]);

      setSerialNumber('');
      setImei1('');
      setImei2('');
      setBarcode('');
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
        <div className="grid">
          <div>
            <div className="form-group">
              <label htmlFor="searchSupplier">Search Supplier:</label>
              <input
                type="text"
                id="searchSupplier"
                value={searchSupplier}
                onChange={handleSupplierSearchChange}
                autoComplete="off"
              />
              {suppliers.length > 0 && !supplierSelected && (
                <div className="search-results">
                  {suppliers.map((supplier) => (
                    <div
                      key={supplier.supplierId}
                      className="search-result"
                      onClick={() => handleSupplierSelect(supplier)}
                    >
                      {supplier.supplierName}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="salePrice">Sale Price:</label>
              <input
                type="number"
                id="salePrice"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label htmlFor="cost">Cost:</label>
              <input
                type="number"
                id="cost"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label htmlFor="dateReceived">Date Received:</label>
              <input
                type="date"
                id="dateReceived"
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
                required
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <div className="form-group">
              <label htmlFor="searchProduct">Search Product:</label>
              <input
                type="text"
                id="searchProduct"
                value={searchProduct}
                onChange={handleProductSearchChange}
                autoComplete="off"
                disabled={productSelected}
              />
              {items.length > 0 && !productSelected && (
                <div className="search-results">
                  {items.map((item) => (
                    <div
                      key={item.itemId}
                      className="search-result"
                      onClick={() => handleItemSelect(item)}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="ModelNumber">Model Number</label>
              <input type="text" id="ModelNumber" value={modelNumber} disabled autoComplete="off" />
            </div>
            <div className="form-group">
              <label htmlFor="Description">Description</label>
              <input type="text" id="Description" value={description} disabled autoComplete="off" />
            </div>
            <button type="button" onClick={handleReset} className="btn btn-success">
              Clear Form
            </button>
          </div>
        </div>
      </div>

      {identifier && (
        <div className="scan-section">
          <h3>Scan Item ({identifier.toUpperCase()})</h3>
          {identifier === 'barcode' && (
            <>
              <div className="form-group">
                <label htmlFor="lockedBarcode">Expected Barcode:</label>
                <input
                  type="text"
                  id="lockedBarcode"
                  value={lockedBarcode}
                  disabled
                  className="locked-barcode"
                  autoComplete="off"
                />
              </div>
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
                  autoComplete="off"
                />
              </div>
            </>
          )}
          <div className="form-group">
            <label htmlFor="barcode">Barcode:</label>
            <input
              type="text"
              id="barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyPress={handleKeyPress}
              ref={barcodeInputRef}
              disabled={identifier !== 'barcode'}
              placeholder={identifier !== 'barcode' ? 'NA' : 'Scan Barcode'}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="serialNumber">Serial Number:</label>
            <input
              type="text"
              id="serialNumber"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              ref={snInputRef}
              disabled={identifier !== 'sn'}
              placeholder={identifier !== 'sn' ? 'NA' : 'Enter Serial Number'}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="imei1">IMEI 1:</label>
            <input
              type="text"
              id="imei1"
              value={imei1}
              onChange={(e) => setImei1(e.target.value)}
              onKeyPress={handleKeyPress}
              ref={imeiInputRef}
              disabled={identifier !== 'imei'}
              placeholder={identifier !== 'imei' ? 'NA' : 'Scan IMEI 1'}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="imei2">IMEI 2:</label>
            <input
              type="text"
              id="imei2"
              value={imei2}
              onChange={(e) => setImei2(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={identifier !== 'imei'}
              placeholder={identifier !== 'imei' ? 'NA' : 'Enter/Scan IMEI 2 (Optional)'}
              autoComplete="off"
            />
          </div>
        </div>
      )}

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
