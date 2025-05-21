import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProductManager.css';

function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', stock: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchDeliveries();
    fetchReviews();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5001/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5001/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const res = await axios.get('http://localhost:5001/deliveries');
      setDeliveries(res.data);
    } catch (err) {
      console.error('Failed to fetch deliveries:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get('http://localhost:5001/reviews/unapproved');
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.stock) {
      setError("⚠️ Please fill all the fields.");
      return;
    }

    try {
      const res = await axios.post('http://localhost:5001/products', newProduct);
      setProducts([...products, res.data]);
      setNewProduct({ name: '', category: '', price: '', stock: '' });
      setError('');
    } catch (err) {
      console.error('Failed to add product:', err);
      setError('⚠️ Failed to add product. Please try again.');
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:5001/products/${productId}`);
      setProducts(products.filter((product) => product._id !== productId));
    } catch (err) {
      console.error('Failed to remove product:', err);
    }
  };

  const handleApproveReview = async (reviewId) => {
    try {
      await axios.post(`http://localhost:5001/reviews/approve/${reviewId}`);
      setReviews(reviews.filter((review) => review._id !== reviewId));
    } catch (err) {
      console.error('Failed to approve review:', err);
    }
  };

  const handleDeliveryStatusUpdate = async (deliveryId) => {
    try {
      await axios.patch(`http://localhost:5001/deliveries/${deliveryId}`, { status: 'Delivered' });
      fetchDeliveries();
    } catch (err) {
      console.error('Failed to update delivery status:', err);
    }
  };

  return (
    <div className="product-manager-container">
      <h1>Product Manager</h1>

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
          name="price"
          placeholder="Price"
          value={newProduct.price}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="stock"
          placeholder="Stock"
          value={newProduct.stock}
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
              {product.name} - {product.category} - ${product.price} - Stock: {product.stock}
              <button onClick={() => handleRemoveProduct(product._id)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="delivery-list">
        <h2>Delivery List</h2>
        <ul>
          {deliveries.map((delivery) => (
            <li key={delivery._id}>
              Order ID: {delivery._id}, Total Price: ${delivery.totalPrice}, Status: {delivery.status}
              <button onClick={() => handleDeliveryStatusUpdate(delivery._id)}>Mark as Delivered</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="review-list">
        <h2>Unapproved Reviews</h2>
        <ul>
          {reviews.map((review) => (
            <li key={review._id}>
              {review.text} - {review.user}
              <button onClick={() => handleApproveReview(review._id)}>Approve</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ProductManager;
