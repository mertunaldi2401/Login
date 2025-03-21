import React from 'react';

const products = [
  {
    id: 1,
    name: 'Ibanez RG Series',
    model: 'RG550',
    serial: 'IBZ-001',
    // Resmi public/images klasörüne koyduğunuzu varsayıyoruz.
    image: '/images/ps_main_eg_rg_genesiscollection_en.png'
  },
  {
    id: 2,
    name: 'Fender Stratocaster',
    model: 'Strat Classic',
    serial: 'FND-002',
    image: '/images/1228000110250840_1.jpg.webp'
  },
  // Gerekirse daha fazla ürün ekleyebilirsiniz
];

function Products() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Our Guitar Collection</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {products.map(product => (
          <div 
            key={product.id} 
            style={{ 
              border: '1px solid #ddd', 
              margin: '10px', 
              padding: '15px', 
              width: '250px', 
              textAlign: 'center',
              backgroundColor: '#fff',
              boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <img 
              src={product.image} 
              alt={product.name} 
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '5px' }}
            />
            <h2 style={{ fontSize: '1.2em', margin: '10px 0' }}>{product.name}</h2>
            <p>Model: {product.model}</p>
            <p style={{ color: '#888', fontSize: '0.9em' }}>Serial: {product.serial}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;