import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";
import {
  fetch_brands,
  fetch_categories,
  fetch_items,
  PostItem,
  DeleteItem,
  fetch_suppliers,
  fetch_supplier_item,
  fetch_colors,
  get_items_url,
  //post_supplier_item,
  fetchSpecsByCategory,
} from "./Functions";

const AddItem = () => {
  const [name, setName] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [description, setDescription] = useState("");
  const [barcode, setBarcode] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [specId, setSpecId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [brands, setBrands] = useState([]);
  const [colors, setcolors] = useState([]);
  const [colorId, setcolorId] = useState("");
  const [categories, setCategories] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [itemssuppliers, setItemsSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFieldsLocked, setIsFieldsLocked] = useState(false);
  const [isImeiId, setIisImeiId] = useState(false);

  const selectedCategory = categories.find((c) => c.categoryId.toString() === categoryId);
  const isBarcodeCategory = selectedCategory?.identifier?.toLowerCase() === 'barcode';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          brandsData,
          categoriesData,
          itemsData,
          suppliersData,
          itemssuppliersData,
          colorsData,
        ] = await Promise.all([
          fetch_brands(),
          fetch_categories(),
          fetch_items(),
          fetch_suppliers(),
          fetch_supplier_item(),
          fetch_colors(),
        ]);
        setBrands(brandsData.brands);
        setCategories(categoriesData.categories);
        setItems(itemsData.items);
        setItemsSuppliers(itemssuppliersData);
        setSuppliers(suppliersData.suppliers);
        setcolors(colorsData.colors);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSpecs = async () => {
      if (!categoryId) {
        setSpecs([]);
        return;
      }
      const data = await fetchSpecsByCategory(categoryId);
      setSpecs(data);
    };

    fetchSpecs();
  }, [categoryId]);

  const handleAddItem = async () => {
    if (
      !name ||
      !modelNumber ||
      !brandId ||
      !categoryId ||
      !colorId ||
      (!specId && !isFieldsLocked)
    ) {
      alert("Please fill in all required fields before adding.");
      return;
    }
    if (selectedCategory.identifier == 'Barcode' && !barcode) {
      alert("barcode field is required for Barcode identified items");
      return;
    }

    try {
      const response = await fetch_items();
      const existingItemInDB = response.items.find(
        (item) => item.modelNumber === modelNumber
      );
      if (existingItemInDB) {
        alert("This model number already exists. Please use a different one.");
        return;
      }
      const newItem = {
        name,
        modelNumber,
        description,
        barcode,
        brandId,
        categoryId,
        colorId,
        specsId: specId, 
      };
      await PostItem(newItem);
      const itemsResponse = await axios.get(`${get_items_url}`);
      const createdItem = itemsResponse.data.find(
        (item) => item.modelNumber === modelNumber
      );
      /*if (createdItem) {
        await axios.post(`${post_supplier_item}`, {
          itemId: createdItem.itemId,
          supplierId: 1004,
          costPrice: 0,
          salePrice: 0,
        });
        const updatedItemsSuppliers = await fetch_supplier_item();
        setItemsSuppliers(updatedItemsSuppliers);
      }*/
      setItems(itemsResponse.data);
      setName("");
      setModelNumber("");
      setBarcode("");
      setBrandId("");
      setCategoryId("");
      setSpecId("");
      setcolorId("");
      setSupplierId("");
      setCostPrice("0");
      setSalePrice("0");
      setDescription("");
      setIisImeiId(false);
    } catch (err) {
      console.error("Error adding item:", err);
      alert("Failed to add item.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await DeleteItem(itemId);
      const response = await fetch_items();
      setItems(response.items);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="container">
      <h2 className="title">Add Product</h2>
      <div className="form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="modelNumber">Model Number:</label>
          <input type="text" id="modelNumber" value={modelNumber} onChange={(e) => setModelNumber(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="brandId">Brand:</label>
          <select id="brandId" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
            <option value="">Select a brand</option>
            {brands.map((brand) => (
              <option key={brand.brandId} value={brand.brandId}>{brand.brandName}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="categoryId">Category:</label>
          <select id="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>
            ))}
          </select>
        </div>

        {isBarcodeCategory && (
          <div className="form-group">
            <label htmlFor="barcode">Barcode:</label>
            <input
              type="text"
              id="barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Enter barcode"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="specId">Specs:</label>
          <select
  id="specId"
  value={specId}
  disabled={isFieldsLocked}
  onChange={(e) => setSpecId(e.target.value)}
>
  <option value="">Select specs</option>
  {specs
    .filter(
      (spec) =>
        (spec.memory && spec.memory.trim() !== "") ||
        (spec.storage && spec.storage.trim() !== "") ||
        (spec.screenSize && spec.screenSize.trim() !== "") ||
        (spec.power && spec.power.trim() !== "")
    )
    .map((spec) => {
      const parts = [];
      if (spec.memory && spec.memory.trim() !== "") parts.push(spec.memory);
      if (spec.storage && spec.storage.trim() !== "") parts.push(spec.storage);
      if (spec.screenSize && spec.screenSize.trim() !== "") parts.push(spec.screenSize);
      if (spec.power && spec.power.trim() !== "") parts.push(spec.power); 

      const displayText = parts.join(" / ");

      return (
        <option key={spec.id} value={spec.id}>
          {displayText}
        </option>
      );
    })}
</select>
        </div>

        <div className="form-group">
          <label htmlFor="colorId">Color:</label>
          <select id="colorId" value={colorId} onChange={(e) => setcolorId(e.target.value)}>
            <option value="">Select color</option>
            {colors.map((color) => (
              <option key={color.colorId} value={color.colorId}>{color.colorName}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-success" onClick={handleAddItem}>Add</button>
      </div>

      <h3 className="subtitle">Items List</h3>
      {items.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Model Number</th>
              <th>Description</th>
              <th>Color</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Specs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              return (
                <tr key={item.itemId}>
                  <td>{item.name}</td>
                  <td>{item.modelNumber}</td>
                  <td>{item.description}</td>
                  <td>{colors.find((c) => c.colorId == item.colorId)?.colorName}</td>
                  <td>{brands.find((b) => b.brandId == item.brandId)?.brandName}</td>
                  <td>{categories.find((c) => c.categoryId == item.categoryId)?.categoryName}</td>
                  <td>{item.specId || 'N/A'}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDeleteItem(item.itemId)}>Delete</button>
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
