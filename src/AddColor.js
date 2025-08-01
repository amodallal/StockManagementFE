import { useState, useEffect } from "react";
import post_color from "./Functions";
import { fetch_colors } from "./Functions";

const AddColor = () => {
  const [colorName, setColorName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [colors, setColors] = useState([]);

  const loadColors = async () => {
    try {
      const result = await fetch_colors();
      setColors(result.colors); // Assumes { colors: [...] }
    } catch (err) {
      console.error("Error fetching colors:", err);
      setError("Failed to load colors.");
    }
  };

  useEffect(() => {
    loadColors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!colorName.trim()) {
      setError("Color name is required.");
      return;
    }

    try {
      const result = await post_color({ colorName });
      setMessage(`Color "${result.colorName}" added successfully.`);
      setColorName("");
      loadColors(); // refresh the list
    } catch (err) {
      if (err.response?.status === 409) {
        setError("This color already exists.");
      } else {
        setError("Failed to add color.");
      }
    }
  };

  return (
    <div className="container">
      <h2 className="title">Add Color</h2>
      <div className="form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="colorName">Color Name:</label>
            <input
              type="text"
              id="colorName"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              autoComplete="off"
              required
            />
          </div>
          <button type="submit" className="btn btn-success">Add Color</button>
        </form>

        {message && <p className="message success">{message}</p>}
        {error && <p className="message error">{error}</p>}
      </div>

      {colors.length > 0 && (
        <div className="added-items">
          <h3>Available Colors</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Color Name</th>
              </tr>
            </thead>
            <tbody>
              {colors.map((color, index) => (
                <tr key={color.colorId || index}>
                  <td>{index + 1}</td>
                  <td>{color.colorName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AddColor;
