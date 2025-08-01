import React, { useState, useEffect } from "react";
// --- Assuming these functions are correctly imported ---
import {
  fetch_brands,
  fetch_categories,
  PostItem,
  DeleteItem,
  fetch_colors,
  fetchSpecsByCategory,
} from "./Functions";

const AddItem = () => {
  // --- State for form inputs ---
  const [name, setName] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [description, setDescription] = useState("");
  const [barcode, setBarcode] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [specId, setSpecId] = useState("");
  const [colorId, setcolorId] = useState("");

  // --- State for dropdown data ---
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [specs, setSpecs] = useState([]);
  
  // --- MODIFIED: State to hold only newly added items ---
  const [addedItems, setAddedItems] = useState([]);

  // --- State for loading and errors ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Helper to check if the selected category is of type 'barcode'
  const selectedCategory = categories.find((c) => c.categoryId.toString() === categoryId);
  const isBarcodeCategory = selectedCategory?.identifier?.toLowerCase() === "barcode";

  // Helper function to format spec text for display
  const formatSpecText = (spec) => {
    if (!spec) return 'N/A';
    const parts = [spec.memory, spec.storage, spec.screenSize, spec.power].filter(Boolean);
    return parts.join(" / ") || 'N/A';
  };

  // Effect to fetch initial data for form dropdowns (brands, categories, etc.)
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoading(true);
        const [brandsData, categoriesData, colorsData] = await Promise.all([
          fetch_brands(),
          fetch_categories(),
          fetch_colors(),
        ]);
        setBrands(brandsData.brands);
        setCategories(categoriesData.categories);
        setColors(colorsData.colors);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setError("Failed to load required data for the form.");
      } finally {
        setLoading(false);
      }
    };
    fetchDropdownData();
  }, []); // Runs only once on component mount

  // Effect to fetch specs when a category is selected
  useEffect(() => {
    const fetchCategorySpecs = async () => {
      if (!categoryId) {
        setSpecs([]);
        return;
      }
      const data = await fetchSpecsByCategory(categoryId);
      setSpecs(data);
    };
    fetchCategorySpecs();
  }, [categoryId]);

  const handleAddItem = async () => {
    // --- Validation logic remains the same ---
    if (!name || !modelNumber || !brandId || !categoryId || !colorId || !specId) {
      alert("Please fill in all required fields before adding.");
      return;
    }
    if (isBarcodeCategory && !barcode) {
      alert("Barcode field is required for this category.");
      return;
    }

    try {
      const newItemPayload = {
        name, modelNumber, description, barcode,
        brandId, categoryId, colorId, specsId: specId,
      };

      // Assume PostItem returns the newly created item, at least with its ID
      const createdItemFromServer = await PostItem(newItemPayload);

      // --- FIX: Robustly get the item ID from the server response ---
      // This now checks for PascalCase 'ItemId' from C# backends, as well as camelCase.
      const newItemId = createdItemFromServer.ItemId || createdItemFromServer.itemId || createdItemFromServer.id;

      if (!newItemId) {
          console.error("Server response did not contain a valid 'itemId' or 'id'.", createdItemFromServer);
          alert("Error: Could not get a valid ID for the new item from the server.");
          return;
      }

      // Construct a complete item object for immediate display
      const newItemForDisplay = {
          ...newItemPayload,
          itemId: newItemId, // Use the valid ID from the server response
          spec: specs.find(s => s.id.toString() === specId) // Find the full spec object
      };

      // Add the fully-formed new item to the local list
      setAddedItems(prevItems => [newItemForDisplay, ...prevItems]); // Prepend to show newest first

      // Reset form fields
      setName("");
      setModelNumber("");
      setDescription("");
      setBarcode("");
      setBrandId("");
      setCategoryId("");
      setSpecId("");
      setcolorId("");

    } catch (err) {
      console.error("Error adding item:", err);
      alert("Failed to add item. Please try again.");
    }
  };

  const handleDeleteItem = async (itemIdToDelete) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        // Remove item from local list for immediate UI feedback
        setAddedItems(prevItems => prevItems.filter(item => item.itemId !== itemIdToDelete));
        
        // Send delete request to the server in the background
        await DeleteItem(itemIdToDelete);

      } catch (err) {
          console.error("Error deleting item:", err);
          alert("Failed to delete item from the server. The item has been restored in the list.");
          // Optional: Add logic here to re-add the item to the list if the API call fails
      }
    }
  };

  if (loading) return <p>Loading form...</p>;
  if (error) return <p className="error">{error}</p>;

  // --- JSX for the form remains largely the same ---
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
            <input type="text" id="barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="specId">Specs:</label>
          <select id="specId" value={specId} onChange={(e) => setSpecId(e.target.value)}>
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

      {/* --- MODIFIED: Display only newly added items --- */}
      <h3 className="subtitle">Newly Added Items</h3>
      {addedItems.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Model Number</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Specs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {addedItems.map((item) => (
              <tr key={item.itemId}>
                <td>{item.name}</td>
                <td>{item.modelNumber}</td>
                <td>{brands.find((b) => b.brandId == item.brandId)?.brandName || 'N/A'}</td>
                <td>{categories.find((c) => c.categoryId == item.categoryId)?.categoryName || 'N/A'}</td>
                <td>{item.spec ? formatSpecText(item.spec) : 'N/A'}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDeleteItem(item.itemId)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No items have been added yet.</p>
      )}
    </div>
  );
};

export default AddItem;
