import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import ProductList from './components/ProductList';

function Admin() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [productMessage, setProductMessage] = useState('');
  const [productForm, setProductForm] = useState({
    name: '', model: '', serialNumber: '', description: '',
    quantityInStock: '', price: '', warrantyStatus: '',
    distributorInfo: '', image: '', category: '', brand: '',
    isFeatured: false, rating: '', numReviews: '',
  });

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isManager = user?.role === 'product-manager';

  useEffect(() => {
    fetch('http://localhost:5001/admin/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => setError('Failed to fetch user list.'));
  }, []);

  useEffect(() => {   
    fetch('http://localhost:5001/orders/all')
      .then(res => res.json())
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => console.error('Failed to fetch orders'));
  }, []);

  useEffect(() => {   
    fetch('http://localhost:5001/reviews/unapproved')
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(() => setError('Failed to fetch reviews'));
  }, []);

  useEffect(() => {
    if (isManager) {
      fetch('http://localhost:5001/deliveries')
        .then(res => res.json())
        .then(data => setDeliveries(Array.isArray(data) ? data : []))
        .catch(() => console.error('Failed to fetch deliveries'));
    }
  }, [isManager]);

  useEffect(() => {
    if (isManager) {
      fetch('http://localhost:5001/products')
        .then(res => res.json())
        .then(data => setProducts(Array.isArray(data) ? data : []))
        .catch(() => console.error('Failed to fetch products'));
    }
  }, [isManager]);

  const handleBack = () => {
    navigate('/login');
  };

  const handleProductManager = () => {
    navigate('/productmanager');
  };

  const handleSalesManager = () => {
    navigate('/salesmanager');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif', background: '#f5f5f5' }}>
      
      <div style={{ flex: 1, padding: '1rem', backgroundColor: '#fff', borderRight: '1px solid #ddd', overflowY: 'auto' }}>
        <h3>User List</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button onClick={handleBack} style={{ marginBottom: '1rem', background: '#c0392b', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '5px' }}>
          Back to Login
        </button>
        
        <button onClick={handleProductManager} style={{ marginBottom: '1rem', background: '#2980b9', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '5px' }}>
          Product Manager
        </button>

        <button onClick={handleSalesManager} style={{ marginBottom: '1rem', background: '#27ae60', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '5px' }}>
          Sales Manager
        </button>

        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {users.map(user => (
              <li key={user.username} style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px solid #eee', borderRadius: '5px', background: '#fafafa' }}>
                <strong>{user.username}</strong><br />
                <small>{user.email}</small>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ flex: 1, padding: '1rem', backgroundColor: '#f0f0f0', borderLeft: '1px solid #ddd', overflowY: 'auto' }}>
        <h3>Orders</h3>
        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          orders.map(order => (
            <div key={order._id} style={{ background: '#fff', marginBottom: '1rem', padding: '1rem', borderRadius: '5px', boxShadow: '0 0 5px rgba(0,0,0,0.1)' }}>
              <p><strong>User:</strong> {order.user?.username || 'Unknown'}</p>
              <p><strong>Total Price:</strong> ${order.totalPrice}</p>
              <p><strong>Status:</strong> {order.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Admin;
