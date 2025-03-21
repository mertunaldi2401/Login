import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import Products from './Products';

function MainPage() {
  const { auth } = useContext(AuthContext);
  // Eğer kullanıcı giriş yapmamışsa "Guest" olarak göster
  const username = auth.user ? auth.user : "friend";

  return (
    <div style={{ padding: '20px' }}>
      {/* Hoşgeldiniz Bölümü */}
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1>Welcome to Thor's Mighty Guitar Shop, {username}!</h1>
        <p>Check out our latest guitar collection.</p>
      </header>

      {/* Gitar Ürünlerinin Listelendiği Bölüm */}
      <Products />
    </div>
  );
}

export default MainPage;