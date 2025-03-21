import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch all users on component mount
  useEffect(() => {
    fetch('http://localhost:5000/admin/users')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(() => setError('Failed to fetch user list.'));
  }, []);

  const deleteUser = async (username) => {
    try {
      const res = await fetch(`http://localhost:5000/admin/users/${username}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Error deleting user.');
      } else {
        setUsers(prev => prev.filter(u => u.username !== username));
      }
    } catch {
      setError('Network error. Could not delete user.');
    }
  };

  const deleteAllUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/admin/users', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Error deleting all users.');
      } else {
        setUsers([]);
      }
    } catch {
      setError('Network error. Could not delete all users.');
    }
  };

  // Back button handler to return to login/register page
  const handleBack = () => {
    navigate('/login');
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Admin Page</h2>
      <button onClick={handleBack}>Back to Login/Register</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={deleteAllUsers} style={{ margin: '1rem 0' }}>
        Delete All Users
      </button>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', minWidth: '300px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Username</th>
              <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Email</th>
              <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Hashed Password</th>
              <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.username}>
                <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{user.username}</td>
                <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{user.email}</td>
                <td style={{ border: '1px solid #ccc', padding: '0.5rem', maxWidth: '200px', overflowWrap: 'break-word' }}>
                  {user.password}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
                  <button onClick={() => deleteUser(user.username)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Admin;
