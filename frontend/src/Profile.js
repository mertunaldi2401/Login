import React, { useEffect, useState } from 'react';

const Profile = () => {
const [profile, setProfile] = useState({ username: '', email: '' });
const [loadingProfile, setLoadingProfile] = useState(true);
const [profileError, setProfileError] = useState(null);

const [orders, setOrders] = useState([]);
const [loadingOrders, setLoadingOrders] = useState(true);
const [ordersError, setOrdersError] = useState(null);

const token = localStorage.getItem('token');

useEffect(() => {
fetch('http://localhost:5001/users/profile', {
headers: { Authorization: `Bearer ${token}` }
})
.then(res => {
if (!res.ok) throw new Error('Failed to fetch profile');
return res.json();
})
.then(data => setProfile({ username: data.username, email: data.email }))
.catch(err => setProfileError(err.message))
.finally(() => setLoadingProfile(false));
}, []);

useEffect(() => {
fetch('http://localhost:5001/orders/history', {
headers: { Authorization: `Bearer ${token}` }
})
.then(res => {
if (!res.ok) throw new Error('Failed to fetch orders');
return res.json();
})
.then(data => setOrders(data))
.catch(err => setOrdersError(err.message))
.finally(() => setLoadingOrders(false));
}, []);

if (loadingProfile || loadingOrders) return <p style={{ padding: '2rem' }}>Loading...</p>;
if (profileError) return <p style={{ padding: '2rem', color: 'red' }}>Error loading profile: {profileError}</p>;
if (ordersError) return <p style={{ padding: '2rem', color: 'red' }}>Error loading orders: {ordersError}</p>;

return (
<div style={{
maxWidth: '900px',
margin: '2rem auto',
padding: '2rem',
background: '#fff',
borderRadius: '8px',
boxShadow: '0 0 10px rgba(0,0,0,0.1)',
fontFamily: 'Arial, sans-serif'
}}>
<h2 style={{ borderBottom: '2px solid #d50000', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>My Profile</h2>
<div style={{ marginBottom: '2rem' }}>
<p><strong>👤 Username:</strong> {profile.username}</p>
<p><strong>📧 Email:</strong> {profile.email}</p>
</div>

<h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '1rem' }}>🛒 My Orders</h3>
{orders.length > 0 ? (
<ul style={{ listStyle: 'none', padding: 0 }}>
{orders.map(order => (
<li key={order._id} style={{
marginBottom: '1rem',
padding: '1rem',
border: '1px solid #eee',
borderRadius: '5px',
background: '#fafafa'
}}>
<p><strong>🆔 Order ID:</strong> {order._id}</p>
<p><strong>📅 Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
<p><strong>💰 Total:</strong> ${order.totalPrice.toFixed(2)}</p>
<p><strong>🚚 Status:</strong>
<span style={{
marginLeft: '0.5rem',
color:
order.status === 'processing' ? '#f39c12' :
order.status === 'in-transit' ? '#3498db' :
'#2ecc71',
fontWeight: 'bold'
}}>
{order.status}
</span>
</p>
{order.status === 'processing' && (
<button
onClick={async () => {
try {
const res = await fetch(`http://localhost:5001/orders/${order._id}/cancel`, {
method: 'PATCH',
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${token}`
}
});
if (!res.ok) throw new Error('Failed to cancel order');
alert('Order successfully canceled');
// Refresh orders
const refreshed = await fetch('http://localhost:5001/orders/history', {
headers: { Authorization: `Bearer ${token}` }
});
const updatedOrders = await refreshed.json();
setOrders(updatedOrders);
} catch (err) {
alert(err.message);
}
}}
style={{
marginTop: '0.5rem',
padding: '0.4rem 0.8rem',
backgroundColor: '#e74c3c',
color: '#fff',
border: 'none',
borderRadius: '4px',
cursor: 'pointer'
}}
>
Cancel Order
</button>
)}
</li>
))}
</ul>
) : (
<p style={{ color: '#888' }}>You have no past orders.</p>
)}
</div>
);
};

export default Profile;