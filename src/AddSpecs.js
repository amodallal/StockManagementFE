import React, { useState, useEffect } from "react";
import { fetchCategories, fetchSpecs, addSpec, deleteSpec } from "./Functions";

const AddSpecs = () => {
  const [categories, setCategories] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [formData, setFormData] = useState({
    memory: "",
    storage: "",
    screenSize: "",
    power: "",
    categoryId: "",
  });

  // Load categories and existing specs on component mount.
  useEffect(() => {
    loadCategories();
    loadSpecs(); // Re-enabled loading existing specs
  }, []);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      // Robustly handle different possible API response structures.
      if (data && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.warn("Received unexpected data structure for categories:", data);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([]);
    }
  };

  const loadSpecs = async () => {
    try {
      // This should call GET /api/specs as defined in your C# controller
      const data = await fetchSpecs(); 
      
      // The API returns a flat object with 'categoryName'. We need to transform it
      // to match the nested structure { category: { categoryName: '...' } } that the table expects.
      const transformedSpecs = data.map(spec => ({
          ...spec,
          category: { categoryName: spec.categoryName }
      }));
      setSpecs(transformedSpecs || []);
    } catch (error) {
      console.error("Error loading specs:", error);
      setSpecs([]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
  if (!formData.categoryId) {
    alert("Please select a category");
    return;
  }

  try {
    const payload = {
      memory: formData.memory,
      storage: formData.storage,
      screenSize: formData.screenSize,
      power: formData.power,
      categoryId: parseInt(formData.categoryId, 10), // Only send this FK
    };

    const newSpec = await addSpec(payload);

    if (newSpec && newSpec.id) {
      const selectedCategory = categories.find(c => c.categoryId === payload.categoryId);
      const specForDisplay = {
        ...newSpec,
        category: { categoryName: selectedCategory?.categoryName || "N/A" },
      };

      setSpecs(prev => [specForDisplay, ...prev]);
      setFormData({ memory: "", storage: "", screenSize: "", power: "", categoryId: "" });
    } else {
      alert("Failed to add spec. Please check data and try again.");
    }
  } catch (error) {
    console.error("Error adding spec:", error);
    alert("An error occurred while adding the spec.");
  }
};

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this spec?")) {
      try {
        await deleteSpec(id);
        // Success message on deletion
        alert("Spec deleted successfully!");
        // Remove the spec from the local state to update the table immediately
        setSpecs(prevSpecs => prevSpecs.filter(spec => spec.id !== id));
      } catch (error) {
        console.error("Error deleting spec:", error);
        alert("Failed to delete the spec.");
      }
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Spec</h2>
      <div style={{ marginBottom: 10 }}>
        <select name="categoryId" value={formData.categoryId} onChange={handleChange}>
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
          ))}
        </select>
      </div>
      <input name="memory" placeholder="Memory" value={formData.memory} onChange={handleChange} />
      <input name="storage" placeholder="Storage" value={formData.storage} onChange={handleChange} />
      <input name="screenSize" placeholder="Screen Size" value={formData.screenSize} onChange={handleChange} />
      <input name="power" placeholder="Power" value={formData.power} onChange={handleChange} />
      <button onClick={handleAdd}>Add Spec</button>

      <h3>Specs List</h3>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>ID</th>
            <th>Memory</th>
            <th>Storage</th>
            <th>Screen Size</th>
            <th>Power</th>
            <th>Category</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {specs.map((spec) => (
            <tr key={spec.id}>
              <td>{spec.id}</td>
              <td>{spec.memory}</td>
              <td>{spec.storage}</td>
              <td>{spec.screenSize}</td>
              <td>{spec.power}</td>
              <td>{spec.category?.categoryName}</td>
              <td>
                <button style={{ background: "red", color: "white" }} onClick={() => handleDelete(spec.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {specs.length === 0 && (
            <tr><td colSpan="7">No specs available</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AddSpecs;
