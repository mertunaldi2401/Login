import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [productMessage, setProductMessage] = useState('');
  const [productForm, setProductForm] = useState({
    name: '', model: '', serialNumber: '', description: '',
    quantityInStock: '', price: '', warrantyStatus: '',
    distributorInfo: '', image: '', category: '', brand: '',
    isFeatured: false, rating: '', numReviews: '',
  });

  const navigate = useNavigate();

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

  const deleteUser = async (username) => {
    try {
      const res = await fetch(`http://localhost:5001/admin/users/${username}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) setError(data.message || 'Error deleting user.');
      else setUsers(prev => prev.filter(u => u.username !== username));
    } catch {
      setError('Network error. Could not delete user.');
    }
  };

  const deleteAllUsers = async () => {
    try {
      const res = await fetch('http://localhost:5001/admin/users', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) setError(data.message || 'Error deleting all users.');
      else setUsers([]);
    } catch {
      setError('Network error. Could not delete all users.');
    }
  };

  const handleBack = () => {
    navigate('/login');
  };

  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });
      const data = await res.json();
      if (!res.ok) setProductMessage(data.message || 'Error adding product.');
      else {
        setProductMessage('Product added successfully!');
        setProductForm({
          name: '', model: '', serialNumber: '', description: '',
          quantityInStock: '', price: '', warrantyStatus: '',
          distributorInfo: '', image: '', category: '', brand: '',
          isFeatured: false, rating: '', numReviews: '',
        });
      }
    } catch {
      setProductMessage('Network error. Could not add product.');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5001/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(prev =>
          prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
        );
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.5rem', marginBottom: '0.75rem',
    borderRadius: '4px', border: '1px solid #ccc'
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      background: '#f5f5f5'
    }}>
      
      <div style={{
        flex: 1, padding: '1rem', backgroundColor: '#fff',
        borderRight: '1px solid #ddd', overflowY: 'auto'
      }}>
        <h3>User List</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button onClick={deleteAllUsers} style={{ marginBottom: '1rem', background: '#c0392b', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '5px' }}>
          Delete All Users
        </button>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {users.map(user => (
              <li key={user.username} style={{
                marginBottom: '1rem',
                padding: '0.5rem',
                border: '1px solid #eee',
                borderRadius: '5px',
                background: '#fafafa'
              }}>
                <strong>{user.username}</strong><br />
                <small>{user.email}</small><br />
                <button onClick={() => deleteUser(user.username)} style={{
                  marginTop: '0.5rem',
                  background: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ flex: 1, padding: '1.5rem' }}>
        <h3>Add Product</h3>
        <form onSubmit={handleProductSubmit}>
          {Object.entries(productForm).map(([key, val]) =>
            key === 'isFeatured' ? (
              <label key={key} style={{ display: 'block', marginBottom: '1rem' }}>
                <input type="checkbox" name={key} checked={val} onChange={handleProductChange} />
                {' '}Featured
              </label>
            ) : (
              <input
                key={key}
                type="text"
                name={key}
                placeholder={key}
                value={val}
                onChange={handleProductChange}
                style={inputStyle}
              />
            )
          )}
          <button type="submit" style={{
            background: '#2ecc71', color: '#fff', border: 'none',
            padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer'
          }}>
            Add Product
          </button>
          {productMessage && <p style={{ marginTop: '1rem' }}>{productMessage}</p>}
        </form>
      </div>

      <div style={{
        flex: 1, padding: '1rem', backgroundColor: '#f0f0f0',
        borderLeft: '1px solid #ddd', overflowY: 'auto'
      }}>
        <h3>Orders</h3>
        {Array.isArray(orders) && orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          Array.isArray(orders) && orders.map(order => (
            <div key={order._id} style={{
              background: '#fff', marginBottom: '1rem', padding: '1rem',
              borderRadius: '5px', boxShadow: '0 0 5px rgba(0,0,0,0.1)'
            }}>
              <p><strong>User:</strong> {order.user?.username || 'Unknown'}</p>
              <p><strong>Total Price:</strong> ${order.totalPrice}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                style={{ padding: '0.5rem', marginTop: '0.5rem', borderRadius: '4px' }}
              >
                <option value="processing">Processing</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          ))
        )}
        <div style={{ marginTop: '2rem' }}>
          <button onClick={handleBack} style={{
            background: '#34495e', color: '#fff', padding: '0.5rem 1rem',
            border: 'none', borderRadius: '5px', cursor: 'pointer'
          }}>
            ⬅ Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Admin;
