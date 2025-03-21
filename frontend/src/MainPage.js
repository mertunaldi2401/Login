import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import Products from './Products';

function MainPage() {
  const { auth } = useContext(AuthContext);
  const username = auth.user ? auth.user : 'Guest';

  return (
    <div
      style={{
        // Canlı renk geçişi (gradient) arka plan
        background: 'linear-gradient(45deg, #fc466b, #3f5efb)',
        minHeight: '100vh',
        padding: '2rem',
        color: '#fff',
        fontFamily: "'Bebas Neue', sans-serif",
        // Yukarıdaki fontu kullanmak için Google Fonts veya benzeri bir kaynaktan ekleyin
      }}
    >
      {/* Sayfa Başlığı */}
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '4rem',
            margin: 0,
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
          }}
        >
          Rock Your World!
        </h1>
        <p
          style={{
            fontSize: '1.5rem',
            marginTop: '0.5rem',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
          }}
        >
          Welcome, {username}! Explore our killer collection of guitars, effects, and more.
        </p>
      </header>

      {/* Ürünler Bölümü (yarı saydam kutu) */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          borderRadius: '8px',
          padding: '2rem',
          color: '#333',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
        }}
      >
        <Products />
      </section>
    </div>
  );
}

export default MainPage;