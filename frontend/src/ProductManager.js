import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProductManager.css';

function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', quantityInStock: '' });
  const [error, setError] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [editingStockId, setEditingStockId] = useState(null);
  const [newStockValue, setNewStockValue] = useState('');
  const [productIdMap, setProductIdMap] = useState({});

  const token = localStorage.getItem('token');
  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchOrders();
    fetchReviews();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5001/products', { headers: authHeader });
      setProducts(res.data);
      const map = {};
      res.data.forEach(p => { map[p.name] = p._id; });
      setProductIdMap(map);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5001/categories', { headers: authHeader });
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5001/orders/all', { headers: authHeader });
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get('http://localhost:5001/reviews/unapproved', { headers: authHeader });
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setCategoryError("⚠️ Category name cannot be empty.");
      return;
    }
    try {
      const res = await axios.post('http://localhost:5001/categories', { name: newCategory }, { headers: authHeader });
      setCategories([...categories, res.data.category]);
      setNewCategory('');
      setCategoryError('');
    } catch (err) {
      setCategoryError('⚠️ Failed to add category. It might already exist.');
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.quantityInStock) {
      setError("⚠️ Please fill all the fields.");
      return;
    }

    // Ensure quantityInStock is a number
    const payload = {
      ...newProduct,
      quantityInStock: Number(newProduct.quantityInStock),
    };

    try {
      const res = await axios.post('http://localhost:5001/products', payload, { headers: authHeader });
      setProducts([...products, res.data.product]);
      setNewProduct({ name: '', category: '', quantityInStock: '' });
      setError('');
    } catch (err) {
      console.error('Failed to add product:', err);
      setError('⚠️ Failed to add product. Please try again.');
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      const token = localStorage.getItem('token'); // Assumes token is stored here
      await axios.delete(`http://localhost:5001/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProducts(products.filter((product) => product._id !== productId));
    } catch (err) {
      if (err.response?.status === 403) {
        console.error('Permission denied: Not a product manager');
      } else if (err.response?.status === 401) {
        console.error('Unauthorized: Token missing or invalid');
      } else {
        console.error('Failed to remove product:', err);
      }
    }
  };

  const handleApproveReview = async (reviewObj) => {
    try {
      // reviewObj.productId is populated (either ObjectId string or { _id, name })
      const productId =
        reviewObj.productId?._id || reviewObj.productId; // fallback

      await axios.put(
        `http://localhost:5001/products/${productId}/reviews/${reviewObj._id}/approve`,
        {},
        { headers: authHeader }
      );

      // Notify all open tabs (customers) to refresh reviews
      window.localStorage.setItem('reviewRefresh', Date.now().toString());

      // remove it from local state
      setReviews(reviews.filter(r => r._id !== reviewObj._id));
    } catch (err) {
      console.error('Failed to approve review:', err);
      alert('Could not approve review.');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:5001/orders/${orderId}/status`,
        { status: newStatus },
        { headers: authHeader }
      );
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err.response?.data || err.message);
    }
  };

  return (
    <div className="product-manager-container">
      <h1>Product Manager</h1>

      <div className="category-section">
        <h2>Categories</h2>
        <ul>
          {categories.map(category => (
            <li key={category._id}>{category.name}</li>
          ))}
        </ul>
        <input
          type="text"
          placeholder="New Category Name"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
        />
        <button onClick={handleAddCategory}>Add Category</button>
        {categoryError && <p className="error-message">{categoryError}</p>}
      </div>

      <div className="add-product-form">
        <h2>Add Product</h2>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={handleInputChange}
        />
        <select name="category" value={newProduct.category} onChange={handleInputChange}>
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category.name}>{category.name}</option>
          ))}
        </select>
        <input
          type="text"
          name="quantityInStock"
          placeholder="Quantity In Stock"
          value={newProduct.quantityInStock}
          onChange={handleInputChange}
        />
        <button onClick={handleAddProduct}>Add Product</button>
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="product-list">
        <h2>Current Products</h2>
        <ul>
          {products.map((product) => (
            <li key={product._id}>
              {product.name} - {product.category} - ${product.price} - Stock: {product.quantityInStock}
              <button onClick={() => handleRemoveProduct(product._id)}>Remove</button>
              {editingStockId === product._id ? (
                <span style={{ marginLeft: '1em' }}>
                  <input
                    type="number"
                    min={0}
                    value={newStockValue}
                    onChange={e => setNewStockValue(e.target.value)}
                    style={{ width: 60 }}
                  />
                  <button
                    onClick={async () => {
                      try {
                        await axios.patch(`http://localhost:5001/products/${product._id}/stock`,
                          { quantityInStock: Number(newStockValue) },
                          { headers: authHeader }
                        );
                        setEditingStockId(null);
                        setNewStockValue('');
                        fetchProducts();
                      } catch (err) {
                        alert('Failed to update stock');
                      }
                    }}
                    style={{ marginLeft: 4 }}
                  >
                    Save
                  </button>
                  <button onClick={() => setEditingStockId(null)} style={{ marginLeft: 4 }}>Cancel</button>
                </span>
              ) : (
                <button
                  style={{ marginLeft: '1em' }}
                  onClick={() => {
                    setEditingStockId(product._id);
                    setNewStockValue(product.quantityInStock);
                  }}
                >
                  Update Stock
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="delivery-list">
        <h2>Orders / Deliveries</h2>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product(s)</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Delivery Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const hasProductB = order.items.some(it => it.product.name === 'Product B');

              const addr = order.deliveryAddress;
              const addressLine = addr
                ? `${addr.address}, ${addr.city}, ${addr.province}, ${addr.country} (${addr.postalCode})`
                : '-';

              return (
                <tr key={order._id} className={hasProductB ? 'highlight-row' : ''}>
                  <td>{order._id}</td>
                  <td>{order.user?.username || order.user}</td>
                  <td>
                    {order.items.map(it => (
                      <div key={it.product._id}>{it.product.name}</div>
                    ))}
                  </td>
                  <td>
                    {order.items.map(it => (
                      <div key={it.product._id}>{it.quantity}</div>
                    ))}
                  </td>
                  <td>${order.totalPrice.toFixed(2)}</td>
                  <td>{addressLine}</td>
                  <td>{order.status}</td>
                  <td>
                    {order.status !== 'delivered' && (
                      <button onClick={() => updateOrderStatus(order._id, 'delivered')}>
                        Mark Delivered
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="review-list">
        <h2>Unapproved Reviews</h2>
        <ul className="unapproved-review-list">
          {reviews.length === 0 ? (
            <li>No unapproved reviews.</li>
          ) : (
            reviews.map((review) => (
              <li key={review._id} style={{ marginBottom: '1rem' }}>
                <strong>{review.productId?.name || review.productId}</strong>{' '}
                — by {review.userId?.username || review.userId} <br />
                Rating: {review.rating} ★ <br />
                Comment: <em>{review.comment || '(no comment)'}</em>{' '}
                <button
                  className="review-action-btn"
                  onClick={() => handleApproveReview(review)}
                  style={{ marginLeft: 8 }}
                >
                  Approve
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default ProductManager;
