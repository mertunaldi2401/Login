import React from 'react';

// 1. Ürün Listesi
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

// 2. Kategoriye göre renk stilleri (gradient)
const categoryStyles = {
  Guitars: {
    background: 'linear-gradient(45deg, #ff9966, #ff5e62)', // Turuncu-kırmızı geçiş
    color: '#fff'
  },
  Effects: {
    background: 'linear-gradient(45deg, #f6d365, #fda085)', // Sarı-turuncu geçiş
    color: '#333'
  },
  Strings: {
    background: 'linear-gradient(45deg, #a1c4fd, #c2e9fb)', // Mavi-açık mavi geçiş
    color: '#333'
  }
};

// 3. Ana Bileşen
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

  // Stil Tanımları
  const containerStyle = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const mainTitleStyle = {
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '2.5rem',
    fontWeight: 'bold'
  };

  const categorySectionStyle = {
    marginBottom: '40px',
    borderRadius: '8px',
    padding: '10px'
  };

  const categoryTitleStyle = {
    textTransform: 'uppercase',
    fontSize: '1.5rem',
    marginBottom: '10px',
    textAlign: 'center'
  };

  const productsWrapperStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center'
  };

  const productCardStyle = {
    border: '1px solid rgba(0,0,0,0.1)',
    margin: '10px',
    padding: '15px',
    width: '220px',
    textAlign: 'center',
    backgroundColor: '#fff',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '6px',
    transition: 'transform 0.2s ease-in-out'
  };

  const productImageStyle = {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '4px'
  };

  const productNameStyle = {
    fontSize: '1.2em',
    margin: '10px 0',
    color: '#333'
  };

  const productModelStyle = {
    marginBottom: '5px',
    fontWeight: 'bold'
  };

  const productSerialStyle = {
    color: '#888',
    fontSize: '0.9em'
  };

  return (
    <div style={containerStyle}>
      <h1 style={mainTitleStyle}>Our Colorful Collection</h1>
      {Object.keys(groupedProducts).map((category) => {
        // Kategoriye ait stil varsa uygula, yoksa varsayılan
        const catStyle = categoryStyles[category] || {
          background: '#ddd',
          color: '#333'
        };

        return (
          <div
            key={category}
            style={{
              ...categorySectionStyle,
              ...catStyle
            }}
          >
            <h2 style={categoryTitleStyle}>{category}</h2>
            <div style={productsWrapperStyle}>
              {groupedProducts[category].map((product) => (
                <div
                  key={product.id}
                  style={productCardStyle}
                  // Hover efekti
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    style={productImageStyle}
                  />
                  <h3 style={productNameStyle}>{product.name}</h3>
                  <p style={productModelStyle}>Model: {product.model}</p>
                  <p style={productSerialStyle}>Serial: {product.serial}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Products;