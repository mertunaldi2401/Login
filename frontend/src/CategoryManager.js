import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext";

function CategoryManager() {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5001/categories");
      const data = await res.json();
      setCategories(data);
    } catch {
      setError("Failed to load categories.");
    }
  };

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await fetch("http://localhost:5001/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory.trim() }),
      });
      if (res.ok) {
        setNewCategory("");
        fetchCategories();
      }
    } catch {
      setError("Could not add category.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5001/categories/${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchCategories();
    } catch {
      setError("Could not delete category.");
    }
  };

  useEffect(() => {
    if (user?.role === "product-manager") {
      fetchCategories();
    }
  }, [user]);

  if (user?.role !== "product-manager") {
    return <p style={{ padding: "1rem", color: "gray" }}>Access denied.</p>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>📂 Category Manager</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", marginTop: "1rem", gap: "1rem" }}>
        <input
          type="text"
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          style={{ flex: 1, padding: "0.5rem", borderRadius: "4px" }}
        />
        <button onClick={handleAdd} style={{ padding: "0.5rem 1rem" }}>
          Add
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
        {categories.map((cat) => (
          <li
            key={cat._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0.5rem",
              background: "#f9f9f9",
              borderBottom: "1px solid #ddd",
            }}
          >
            <span>{cat.name}</span>
            <button
              onClick={() => handleDelete(cat._id)}
              style={{
                background: "transparent",
                border: "none",
                color: "red",
                cursor: "pointer",
              }}
              title="Delete"
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryManager;