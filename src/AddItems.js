import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './styles.css';
import { fetch_itm_sup } from './Functions';
import { playBuzzer} from './Functions';
import {checkIMEIExists } from './Functions';



const AddItemDetails = () => {
  const [itemId, setItemId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [imei1, setImei1] = useState('');
  const [imei2, setImei2] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [cost, setCost] = useState('');
  //const [descriptionId, setDescriptionId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [dateReceived, setDateReceived] = useState('');
  const [items, setItems] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [barcodeData, setBarcodeData] = useState('');
  const [addedItems, setAddedItems] = useState([]); // For displaying added items
  const [modelNumber, setModelNumber] = useState([]);
  const isFieldsLocked = useRef(false);
  //const isIMEIFieldsLocked = useRef(false);
  //const isSNFieldsLocked = useRef(false);

  
  //const [isFieldsLocked, setIsFieldsLocked]= useState(false);
  const [isIMEIFieldsLocked, setisIMEIFieldsLocked] = useState();
  const [isSNFieldsLocked, setisSNFieldsLocked] = useState();
  const imeiInputRef = useRef(null);
  const snInputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const [isImeiId, setIsemiId] = useState(true);
  

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDateReceived(today);
    //fetch Items , suppliers , description data
    const fetchData = async () => {
      try {
        const { items, suppliers } = await fetch_itm_sup();
        setItems(items);
        setSuppliers(suppliers);
      } catch (error) {
        
        console.error('Error fetching data', error);
      }
    };

    fetchData();
   

  }, []);
  
  //Toggle start/stop button
  const toggleFields = () => {
    // Check if required fields are filled
    if (!itemId || !quantity || !supplierId || !dateReceived) {
      alert('Please fill in all required fields.');
      setBarcodeData('');
      setImei1('');
      return;
    }
  
    // Unlock fields and reset the form when stopping scan
    if (isFieldsLocked.current) {
      resetForm();
      setItemId('');
      setSerialNumber('');
      setSalePrice('');
      setCost('');
      setSupplierId('');
      setModelNumber('');
      setDescriptions('');
      setDateReceived(new Date().toISOString().split('T')[0]); // Reset to today's date
    }
  
    // Confirm item data before starting scan
    if (!isFieldsLocked.current) {
      const selectedItem = items.find((item) => item.itemId == itemId);
      const selectedSupplier = suppliers.find((supplier) => supplier.supplierId == supplierId);
  
      // eslint-disable-next-line no-restricted-globals
      const userConfirmed = confirm(
        'Are you sure you want to start scanning?\n' +
        `Item: ${selectedItem.name}\n` +
        `Supplier: ${selectedSupplier.supplierName}\n` +
        
        `Sale Price: ${salePrice}\n` +
        `Cost: ${cost}`
      );
  
      if (!userConfirmed) {
        return; // Stop further execution if the user cancels
      }
    }
  
    // Set IMEI fields lock state
    if (isImeiId) {
      //isIMEIFieldsLocked.current = !isIMEIFieldsLocked.current;
    setisIMEIFieldsLocked((prev) => {
    const nextState = !prev;
    
        if (!prev && imeiInputRef.current) {
          setTimeout(() => imeiInputRef.current.focus(), 0);
        }
        
      return nextState;
     });
    }
  
    // Set SN fields lock state
    else {
      //isSNFieldsLocked.current = !isSNFieldsLocked.current;
      setisSNFieldsLocked((prev) => {
      const nextState = !prev;
      
        if (!prev && snInputRef.current) {
          setTimeout(() => snInputRef.current.focus(), 0);
        }
  
       return nextState;
       });
    }
  
  
    // Toggle the isFieldsLocked state and log the updated state
    isFieldsLocked.current = !isFieldsLocked.current;
   /* setIsFieldsLocked((prev) => {
      const nextState = !prev;
     
  
      return nextState;
    });*/
  };
  useEffect(() => {
    //Handle bar code input 
      const handleBarcodeInput = (event) => {
        if (event.key === 'Enter') {
          
          if (!isFieldsLocked.current)
            {
              alert('Press Start to scan');
              setBarcodeData('');
              setImei1('');
              return;
            }
  
          if (!itemId || !imei1 ||  !quantity || !supplierId || !dateReceived) {
            alert('Please fill in all required fields');
            setBarcodeData('');
            setImei1('');
            return;
          }
       
        
  
          if (barcodeData.length !== 15) {
            playBuzzer(); // Play buzzer sound
            // Wait for 1 second before showing the alert
            setTimeout(() => {
              alert('IMEI must be exactly 15 digits');
            }, 100);
            
            setBarcodeData('');
            setImei1('');
            return;
          
          }
         
           
  
    //Submit
   
          handleSubmit();
          setBarcodeData('');
        } else if (event.key !== 'Backspace') {
          setBarcodeData((prev) => prev + event.key);
        }
  
        if (barcodeData.length === 0) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = setTimeout(() => {
            setBarcodeData('');
          }, 300);
        }
      };
      //listen to key press event 
      window.addEventListener('keydown', handleBarcodeInput);
  
      return () => {
        window.removeEventListener('keydown', handleBarcodeInput);
        clearTimeout(debounceTimerRef.current);
      };
    }, [imei1]);
  
    const resetForm = () => {
      // Reset only barcode data and IMEI fields, but keep the rest intact
      setSerialNumber('');
      setImei1('');
      setImei2('');
      setQuantity('1');
      setDateReceived(new Date().toISOString().split('T')[0]);
    };
  
  const handleSubmit = async () => {

    // Check if IMEI exists in the database before submitting
    const imeiExists = await checkIMEIExists(imei1);
    if (imeiExists) {
      playBuzzer(); // Play buzzer sound
      // Wait for 1 second before showing the alert
      setTimeout(() => {
        alert('IMEI already exists in the database!');
      }, 750);  // 1 second delay
      
      resetForm();
     return; // Stop the form submission if IMEI exists
      
    }

    // Add to the grid view state with item name
    const selectedItem = items.find((item) => item.itemId == itemId);
    const itemData = {
     itemName: selectedItem ? selectedItem.name : 'Unknown',
      imei1,
      salePrice,
      cost,
      quantity,
      
    };

    try {
    
      const newItemDetail = {
        itemId,
        serialNumber,
        imei1,
        imei2,
        salePrice,
        cost,
        supplierId,
        quantity,
        dateReceived,
      };
      

      // Make the API call to save the item
      await axios.post('http://localhost:5257/api/ItemDetails', newItemDetail);

      // Add the item to the grid (after the API call is successful)
      setAddedItems((prevItems) => [...prevItems, itemData]);

      // Reset the barcode-related fields after submitting the item
      resetForm();

      // Focus on the IMEI input field
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
      <h2 className="title">Add Items</h2>
      <form onSubmit={(e) => e.preventDefault()} className="form">
        <div className="form-group">
          <label htmlFor="itemId">Item:</label>
          <select
  id="itemId"
  value={itemId}
  onChange={(e) => { 
    
    const selectedItem = items.find((item) => item.itemId == e.target.value); // Find the selected item by itemId
    if (selectedItem) {
     setItemId(selectedItem.itemId); // Update itemId state
     setIsemiId(selectedItem.isImeiId); // Update isImeiId state
     setModelNumber(selectedItem.modelNumber);
     setDescriptions(selectedItem.description);
    } else {
      
      setItemId(''); // Optionally reset itemId if item is not found
      setIsemiId(false); // Reset isImeiId state
      setModelNumber(''); // Reset Model Number state
      // Optionally handle the case where the item is not found
    }
  }
}
  disabled={isFieldsLocked.current}
  required
>
  <option value="">Select Product</option>
  {items.map((item) => (
    <option key={item.itemId} value={item.itemId}>
      {item.name}
    </option>
  ))}
</select>
          <div className="form-group">
          <label htmlFor="Model Number">Model Number</label>
          <input
            type="text"
            id="ModelNumber"
            value={modelNumber}
            disabled = {true}
          />
        </div>
        </div>
        <div className="form-group">
          <label htmlFor="serialNumber">Serial Number:</label>
          <input
            type="text"
            id="serialNumber"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            disabled={!isSNFieldsLocked}
            ref={snInputRef}
          />
        </div>
        

        <div className="form-group"  >
          <label htmlFor="imei1">IMEI 1 (Scan to fill):</label>
          <input
            type="text"
            id="imei1"
            value={imei1}
            onChange={(e) => setImei1(e.target.value)}
            placeholder="Scan barcode here"
            autoComplete="off"
            disabled={!isIMEIFieldsLocked}
            ref={imeiInputRef}
          />
        </div>

        <div className="form-group">
          <label htmlFor="imei2">IMEI 2:</label>
          <input
            type="text"
            id="imei2"
            value={imei2}
            onChange={(e) => setImei2(e.target.value)}
            disabled={isFieldsLocked.current}
          />
        </div>

        <div className="form-group">
          <label htmlFor="salePrice">Sale Price:</label>
          <input
            type="number"
            id="salePrice"
            value={salePrice}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 5) { // Allow only up to 5 digits
                setSalePrice(value);
              }
            }}
            disabled={isFieldsLocked.current}
          />
        </div>

        <div className="form-group">
          <label htmlFor="cost">Cost:</label>
          <input
            type="number"
            id="cost"
            value={cost}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 5) { // Allow only up to 5 digits
                setCost(value);
              }
            }}
            disabled={isFieldsLocked.current}
          />
        </div>

        <div className="form-group">
          <label htmlFor="Description">Description</label>
          <input
            type="text"
            id="Description"
            value={descriptions}
            disabled = {true}
          />
        </div>

        <div className="form-group">
          <label htmlFor="supplierId">Supplier:</label>
          <select
            id="supplierId"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            required
            disabled={isFieldsLocked.current}
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
            disabled={isFieldsLocked.current}
          />
        </div>

        <button className="btn btn-success" type="button" onClick={toggleFields}>
          {isFieldsLocked.current ? 'Stop Scan' : 'Start Scan'}
        </button>
      </form>

      {/* Display Grid of Added Items */}
      <div className="added-items">
        <h3>Added Items</h3>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>IMEI 1</th>
              <th>Sale Price</th>
              <th>Cost</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {addedItems.map((item, index) => (
              <tr key={index}>
                <td>{item.itemName}</td>
                <td>{item.imei1}</td>
                <td>{item.salePrice}</td>
                <td>{item.cost}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddItemDetails;