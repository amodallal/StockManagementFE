import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";
import {
  fetch_brands,
  fetch_categories,
  fetch_items,
  PostItem,
  DeleteItem,
  fetch_capacities,
  fetch_itemscapacities,
  fetch_suppliers,
  fetch_supplier_item,
} from "./Functions";
const AddItem = () => {
  const [name, setName] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [barcode, setBarcode] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [capacityId, setCapacityId] = useState([]);
  const [supplierId, setSupplierId] = useState(""); // Supplier field
  const [costPrice, setCostPrice] = useState(""); // Cost price
  const [salePrice, setSalePrice] = useState(""); // Sale price
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [capacities, setCapacities] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // Supplier list
  const [items, setItems] = useState([]);
  const [itemscapacities, setItemCapacities] = useState([]);
  const [itemssuppliers, setItemsSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFieldsLocked, setIsFieldsLocked] = useState(false);
  let isImeiId = false;
  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          brandsData,
          categoriesData,
          itemsData,
          capacitiesData,
          itemscapacitiesData,
          suppliersData,
          itemssuppliersData,
        ] = await Promise.all([
          fetch_brands(),
          fetch_categories(),
          fetch_items(),
          fetch_capacities(),
          fetch_itemscapacities(),
          fetch_suppliers(),
          fetch_supplier_item(),
        ]);
        setBrands(brandsData.brands);
        setCategories(categoriesData.categories);
        setItems(itemsData.items);
        setCapacities(capacitiesData.capacities);
        setItemCapacities(itemscapacitiesData);
        setItemsSuppliers(itemssuppliersData);
        setSuppliers(suppliersData.suppliers); // Set suppliers
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const handleAddItem = async () => {
    if (
      !name ||
      !modelNumber ||
      !brandId ||
      !categoryId ||
      !supplierId ||
      !costPrice ||
      !salePrice ||
      (capacityId.length === 0 && !isFieldsLocked)
    ) {
      alert("Please fill in all required fields before adding.");
      return;
    }
    try {
      // Ensure model number is unique
      const response = await axios.get("http://localhost:5257/api/items");
      const existingItemInDB = response.data.find(
        (item) => item.modelNumber === modelNumber
      );
      if (existingItemInDB) {
        alert("This model number already exists. Please use a different one.");
        return;
      }
      if (categoryId === "3" || categoryId === "6") {
        isImeiId = true;
      }
      const newItem = {
        name,
        modelNumber,
        barcode,
        brandId,
        categoryId,
        isImeiId,
      };
      // Insert the item into the database
      await PostItem(newItem);
      // Fetch the newly created item
      const itemsResponse = await axios.get("http://localhost:5257/api/items");
      const createdItem = itemsResponse.data.find(
        (item) => item.modelNumber === modelNumber
      );
      if (createdItem) {
        // Add supplier, cost, and sale price to the joint table
        await axios.post("http://localhost:5257/api/items/supplier-item", {
          itemId: createdItem.itemId,
          supplierId,
          costPrice,
          salePrice,
        });
        if (!isFieldsLocked) {
          // Add capacities if fields are not locked
          await axios.post("http://localhost:5257/api/items/item-capacities", {
            ItemId: createdItem.itemId,
            CapacityIds: capacityId,
          });

        }
        // Update capasities , suppliers ,cost and sale price
        const updatedItemscapacities = await fetch_itemscapacities();
        setItemCapacities(updatedItemscapacities);
      
        const updatedItemsSuppliers = await fetch_supplier_item();
        setItemsSuppliers(updatedItemsSuppliers);
      }
      setItems(itemsResponse.data);
      // Reset fields
      setName("");
      setModelNumber("");
      setBarcode("");
      setBrandId("");
      setCategoryId("");
      setCapacityId([]);
      setSupplierId("");
      setCostPrice("");
      setSalePrice("");
      //setItemsSuppliers("");
      isImeiId = true;
    } catch (err) {
      console.error("Error adding item:", err);
      alert("Failed to add item.");
    }
  };
  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await DeleteItem(itemId);
      const response = await axios.get("http://localhost:5257/api/items");
      setItems(response.data);
    }
  };
  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p className="error">{error}</p>;
  }
  return (
    <div className="container">
      <h2 className="title">Add Product</h2>

      {/* Add Item Form */}
      <div className="form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="modelNumber">Model Number:</label>
          <input
            type="text"
            id="modelNumber"
            value={modelNumber}
            onChange={(e) => setModelNumber(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="brandId">Brand:</label>
          <select
            id="brandId"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
          >
            <option value="">Select a brand</option>
            {brands.map((brand) => (
              <option key={brand.brandId} value={brand.brandId}>
                {brand.brandName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="categoryId">Category:</label>
          <select
            id="categoryId"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setIsFieldsLocked(e.target.value === "5");
            }}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.categoryName}
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
          >
            <option value="">Select a supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.supplierId} value={supplier.supplierId}>
                {supplier.supplierName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="costPrice">Cost Price:</label>
          <input
            type="number"
            id="costPrice"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="salePrice">Sale Price:</label>
          <input
            type="number"
            id="salePrice"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="capacities">Capacities:</label>
          <select
            id="capacityId"
            value={capacityId}
            disabled={isFieldsLocked}
            onChange={(e) =>
              setCapacityId(
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
            multiple
          >
            {capacities.map((capacity) => (
              <option key={capacity.capacityID} value={capacity.capacityID}>
                {capacity.capacityName}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-success" onClick={handleAddItem}>
          Add
        </button>
      </div>
      {/* Items Grid */}
      <h3 className="subtitle">Items List</h3>
      {items.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Model Number</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Cost Price</th>
              <th>Sale Price</th>
              <th>Capacities</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
  {items.map((item) => {
    // Get suppliers for the current item
    const suppliersForItem = itemssuppliers.filter(
      (supplierItem) => supplierItem.itemId == item.itemId
    );
    return (
      <tr key={item.itemId}>
        <td>{item.name}</td>
        <td>{item.modelNumber}</td>
        <td>{brands.find((b) => b.brandId == item.brandId)?.brandName}</td>
        <td>
          {categories.find((c) => c.categoryId == item.categoryId)?.categoryName}
        </td>
        <td>
  {
    itemssuppliers
      .filter((itemSupplier) => itemSupplier.itemId === item.itemId) // Match the itemId
      .map((itemSupplier, index) => {
        const supplier = suppliers.find((supplier) => supplier.supplierId === itemSupplier.supplierId); // Find the corresponding supplier
        return (
          <div key={`${item.itemId}-${itemSupplier.supplierId}-${index}`}>
            {supplier ? supplier.supplierName : 'Unknown'} {/* Display supplier name or 'Unknown' */}
          </div>
        );
      })
  }
</td>
<td>
  {
    itemssuppliers
      .filter((supplierItem) => supplierItem.itemId === item.itemId)
      .map((supplierItem, index) => (
        <div key={`${supplierItem.itemId}-${supplierItem.supplierId}-${index}`}>
          {supplierItem.costPrice || 'N/A'}
        </div>
      ))
  }
</td>
<td>
  {
    itemssuppliers
      .filter((supplierItem) => supplierItem.itemId === item.itemId)
      .map((supplierItem, index) => (
        <div key={`${supplierItem.itemId}-${supplierItem.supplierId}-${index}`}>
          {supplierItem.salePrice || 'N/A'}
        </div>
      ))
  }
</td>
        <td>
          {itemscapacities
                    .filter((itemCapacity) => itemCapacity.itemId === item.itemId)
                    .map((itemCapacity) => (
                      <div key={`${itemCapacity.itemId}-${itemCapacity.capacityId}`}>
                        {itemCapacity.capacityName || 'Unknown'}
                      </div>
                    ))}
                </td>
        <td>
          <button
            className="btn btn-danger"
            onClick={() => handleDeleteItem(item.itemId)}
          >
            Delete
          </button>
        </td>
      </tr>
    );
  })}
</tbody>
        </table>
      ) : (
        <p>No items available.</p>
      )}
    </div>
  );
};
export default AddItem;