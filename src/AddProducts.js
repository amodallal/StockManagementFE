import React, { useState, useEffect } from "react";
// --- imports remain the same ---
import {
  fetch_brands,
  fetch_categories,
  PostItem,
  DeleteItem,
  fetch_suppliers,
  fetch_supplier_item,
  fetch_colors,
  fetchSpecsByCategory,
  get_items_url,
  fetch_items_pagination,
} from "./Functions";


const AddItem = () => {
  // --- state declarations remain the same ---
  const [name, setName] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [description, setDescription] = useState("");
  const [barcode, setBarcode] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [specId, setSpecId] = useState("");
  const [colorId, setcolorId] = useState("");
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFieldsLocked, setIsFieldsLocked] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const selectedCategory = categories.find((c) => c.categoryId.toString() === categoryId);
  const isBarcodeCategory = selectedCategory?.identifier?.toLowerCase() === "barcode";
  
  // ✅ FIX 1: Add a helper function to format spec text consistently.
  const formatSpecText = (spec) => {
    if (!spec) return 'N/A';
    const parts = [];
    if (spec.memory?.trim()) parts.push(spec.memory);
    if (spec.storage?.trim()) parts.push(spec.storage);
    if (spec.screenSize?.trim()) parts.push(spec.screenSize);
    if (spec.power?.trim()) parts.push(spec.power);
    const displayText = parts.join(" / ");
    return displayText || 'N/A'; // Return N/A if spec exists but all fields are empty
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          brandsData,
          categoriesData,
          colorsData,
        ] = await Promise.all([
          fetch_brands(),
          fetch_categories(),
          fetch_colors(),
        ]);
        setBrands(brandsData.brands);
        setCategories(categoriesData.categories);
        setColors(colorsData.colors);
        await fetchPagedItems(pageNumber, pageSize);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data.");
        setLoading(false);
      }
    };
    fetchData();
  }, [pageNumber]);

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

 const fetchPagedItems = async (page = 1, size = 10) => {
    try {
      const res = await fetch_items_pagination(1, 10, "Name", false);
      setItems(res.items);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error("Error fetching paged items:", error);
    }
  };


  // Unsorted pagination
 /* const fetchPagedItems = async (page = 1, size = 10) => {
    try {
      const res = await fetch_items_pagination(page, size);
      setItems(res.items);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error("Error fetching paged items:", error);
    }
  };*/

  const handleAddItem = async () => {
    // --- handleAddItem logic remains the same ---
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
    if (selectedCategory?.identifier === "Barcode" && !barcode) {
      alert("Barcode field is required for Barcode identified items.");
      return;
    }

    try {
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

      setName("");
      setModelNumber("");
      setDescription("");
      setBarcode("");
      setBrandId("");
      setCategoryId("");
      setSpecId("");
      setcolorId("");
      setIsFieldsLocked(false);

      await fetchPagedItems(1, pageSize);
      setPageNumber(1);
    } catch (err) {
      console.error("Error adding item:", err);
      alert("Failed to add item.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await DeleteItem(itemId);
      await fetchPagedItems(pageNumber, pageSize);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  // --- JSX for form remains the same ---
  return (
    <div className="container">
      <h2 className="title">Add Product</h2>
      <div className="form">
        {/* Input fields for name, modelNumber, description, etc. */}
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
          <select id="specId" value={specId} disabled={isFieldsLocked} onChange={(e) => setSpecId(e.target.value)}>
            <option value="">Select specs</option>
            {specs.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {formatSpecText(spec)}
              </option>
            ))}
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
        <>
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
              {items.map((item) => (
                <tr key={item.itemId}>
                  <td>{item.name}</td>
                  <td>{item.modelNumber}</td>
                  <td>{item.description}</td>
                  <td>{colors.find((c) => c.colorId == item.colorId)?.colorName || 'N/A'}</td>
                  <td>{brands.find((b) => b.brandId == item.brandId)?.brandName || 'N/A'}</td>
                  <td>{categories.find((c) => c.categoryId == item.categoryId)?.categoryName || 'N/A'}</td>
                  {/* ✅ FIX 2: Use the helper function to find and format the spec text. */}
                  <td>{item.spec ? formatSpecText(item.spec) : 'N/A'}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDeleteItem(item.itemId)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls remain the same */}
          <div style={{ marginTop: "10px" }}>
            <button
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((prev) => prev - 1)}
              className="btn btn-primary"
            >
              Previous
            </button>
            <span style={{ margin: "0 10px" }}>Page {pageNumber} of {totalPages}</span>
            <button
              disabled={pageNumber >= totalPages}
              onClick={() => setPageNumber((prev) => prev + 1)}
              className="btn btn-primary"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p>No items available.</p>
      )}
    </div>
  );
};

export default AddItem;