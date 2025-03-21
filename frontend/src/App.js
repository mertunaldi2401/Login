import React, { useContext } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import MainPage from './MainPage';
import Login from './Login';
import Register from './Register';

function App() {
  const { auth, logout } = useContext(AuthContext);
  const isAuthenticated = auth.user !== null;

  return (
    <div>
      {/* Üst Navigasyon */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1em',
          backgroundColor: '#f2f2f2'
        }}
      >
        {/* Sol tarafta: Mağaza ismi */}
        <div>
          <Link
            to="/"
            style={{
              fontWeight: 'bold',
              textDecoration: 'none',
              color: '#333'
            }}
          >
            Thor's Mighty Guitar Store
          </Link>
        </div>

        {/* Sağ tarafta: Login/Register veya kullanıcı bilgisi */}
        <div>
          {isAuthenticated ? (
            <>
              <span style={{ marginRight: '1em' }}>
                Logged in as <b>{auth.user}</b>
              </span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{ marginRight: '1em', textDecoration: 'none', color: '#333' }}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{ textDecoration: 'none', color: '#333' }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Sayfa Yönlendirmeleri */}
       {/* Sayfa Yönlendirmeleri */}
       <Routes>
        {/* Artık anasayfa herkes için erişilebilir */}
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;