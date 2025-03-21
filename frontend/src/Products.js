import React from 'react';

const products = [
  // Gitar Ürünleri
  {
    id: 1,
    name: 'Ibanez RG Series',
    model: 'RG550',
    serial: 'IBZ-001',
    category: 'Guitars',
    image: '/images/ps_main_eg_rg_genesiscollection_en.png'
  },
  {
    id: 2,
    name: 'Fender Stratocaster',
    model: 'Strat Classic',
    serial: 'FND-002',
    category: 'Guitars',
    image: '/images/1228000110250840_1.jpg.webp'
  },
  {
    id: 5,
    name: 'Epiphone Matt Heafy Signature',
    model: '7 Strings',
    serial: 'GTR-001',
    category: 'Guitars',
    image: '/images/epiphone-m-28833_1.jpg'
  },
  {
    id: 6,
    name: 'Ibanez Tim Henson Signature',
    model: 'TOD10',
    serial: 'GTR-002',
    category: 'Guitars',
    image: '/images/ibanez-tod10.jpg'
  },
  // Efekt Pedalları
  {
    id: 3,
    name: 'Neural DSP Quad Cortex',
    model: 'Quad Cortex',
    serial: 'EFF-001',
    category: 'Effects',
    image: '/images/15848351_800.jpg'
  },
  {
    id: 4,
    name: 'Nano Cortex',
    model: 'Nano Cortex',
    serial: 'EFF-002',
    category: 'Effects',
    image: '/images/19425051_800.jpg'
  },
  // Teller
  {
    id: 7,
    name: 'Ernie Ball Paradigm',
    model: 'Paradigm Strings',
    serial: 'STR-001',
    category: 'Strings',
    image: '/images/images-2.jpeg'
  },
  {
    id: 8,
    name: 'Ernie Ball Regular Slinky',
    model: 'Regular Slinky',
    serial: 'STR-002',
    category: 'Strings',
    image: '/images/P02221_1.jpg.webp'
  }
];

function Products() {
  // Ürünleri kategori bazında gruplandırma
  const groupedProducts = products.reduce((groups, product) => {
    const { category } = product;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {});

  return (
    <div style={{ padding: '20px' }}>
      <h1>Our Collection</h1>
      {Object.keys(groupedProducts).map((category) => (
        <div key={category} style={{ marginBottom: '40px' }}>
          <h2 style={{ textTransform: 'uppercase', borderBottom: '2px solid #ccc', paddingBottom: '5px' }}>
            {category}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {groupedProducts[category].map((product) => (
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
                <h3 style={{ fontSize: '1.2em', margin: '10px 0' }}>{product.name}</h3>
                <p>Model: {product.model}</p>
                <p style={{ color: '#888', fontSize: '0.9em' }}>Serial: {product.serial}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Products;