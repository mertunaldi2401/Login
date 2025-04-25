import React, { useEffect, useState } from 'react';

const Profile = () => {
  // Profile state
  const [profile, setProfile] = useState({ name: '', email: '', address: '' });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
      })
      .then(data => {
        setProfile({ name: data.name, email: data.email, address: data.address });
      })
      .catch(err => setProfileError(err.message))
      .finally(() => setLoadingProfile(false));
  }, []);

  useEffect(() => {
    fetch('/api/profile/orders')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
      })
      .then(data => setOrders(data))
      .catch(err => setOrdersError(err.message))
      .finally(() => setLoadingOrders(false));
  }, []);

  // Overall loading / error
  if (loadingProfile || loadingOrders) return <p>Loading...</p>;
  if (profileError) return <p>Error loading profile: {profileError}</p>;
  if (ordersError)  return <p>Error loading orders: {ordersError}</p>;

  return (
    <div className="profile">
      <h2>Profile</h2>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Address:</strong> {profile.address}</p>

      <section className="past-orders">
        <h3>Past Orders</h3>
        {orders.length > 0 ? (
          <ul>
            {orders.map(order => (
              <li key={order.id} className="order-item">
                <p><strong>Order #{order.id}</strong> — {new Date(order.date).toLocaleDateString()}</p>
                <p>Total: {order.total}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no past orders.</p>
        )}
      </section>
    </div>
  );
};

export default Profile;