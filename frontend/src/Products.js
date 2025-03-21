import React from 'react';

// 1. Ürün Listesi
const products = [
  // Gitar Ürünleri
  {
    id: 1,
    name: 'Fender Stratocaster',
    model: 'Strat Classic',
    serial: 'FND-002',
    category: 'Guitars',
    image: '/images/1228000110250840_1.jpg.webp'
  },
  {
    id: 4,
    name: 'Epiphone Matt Heafy Signature',
    model: '7 Strings',
    serial: 'GTR-001',
    category: 'Guitars',
    image: '/images/epiphone-m-28833_1.jpg'
  },
  {
    id: 5,
    name: 'Ibanez Tim Henson Signature',
    model: 'TOD10',
    serial: 'GTR-002',
    category: 'Guitars',
    image: '/images/ibanez-tod10.jpg'
  },
  // Efekt Pedalları
  {
    id: 2,
    name: 'Nano Cortex',
    model: 'Nano Cortex',
    serial: 'EFF-002',
    category: 'Effects',
    image: '/images/19425051_800.jpg'
  },
  {
    id: 3,
    name: 'Neural DSP Quad Cortex',
    model: 'Quad Cortex',
    serial: 'EFF-001',
    category: 'Effects',
    image: '/images/15848351_800.jpg'
  },
  // Teller
  {
    id: 6,
    name: 'Ernie Ball Paradigm',
    model: 'Paradigm Strings',
    serial: 'STR-001',
    category: 'Strings',
    image: '/images/images-2.jpeg'
  },
  {
    id: 7,
    name: 'Ernie Ball Regular Slinky',
    model: 'Regular Slinky',
    serial: 'STR-002',
    category: 'Strings',
    image: '/images/P02221_1.jpg.webp'
  }
];

// 2. Kategoriye göre gradient stilleri
const categoryStyles = {
  Guitars: {
    // Siyah ve kırmızı arasında geçiş
    background: 'linear-gradient(45deg, #000000, #ff0000)',
    color: '#fff'
  },
  Effects: {
    background: 'linear-gradient(45deg, #0f2027, #203a43)', // Koyu teal tonları
    color: '#fff'
  },
  Strings: {
    background: 'linear-gradient(45deg, #232526, #414345)', // Koyu gri tonları
    color: '#fff'
  }
};

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
    fontFamily: '"Metal Mania", cursive', // Google Fonts'tan ekleyebilirsiniz
    color: '#fff'
  };

  const mainTitleStyle = {
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '3rem',
    fontWeight: 'bold',
    textShadow: '2px 2px 5px rgba(0,0,0,0.7)'
  };

  const categorySectionStyle = {
    marginBottom: '40px',
    borderRadius: '8px',
    padding: '10px'
  };

  const categoryTitleStyle = {
    textTransform: 'uppercase',
    fontSize: '1.8rem',
    marginBottom: '10px',
    textAlign: 'center',
    textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
  };

  const productsWrapperStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center'
  };

  const productCardStyle = {
    border: '1px solid #333',
    margin: '10px',
    padding: '15px',
    width: '220px',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Koyu, şeffaf zemin
    color: '#fff',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
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
    color: '#fff'
  };

  const productModelStyle = {
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#ffcc00' // Altın rengi vurgu
  };

  const productSerialStyle = {
    color: '#ccc',
    fontSize: '0.9em'
  };

  return (
    <div style={containerStyle}>
      <h1 style={mainTitleStyle}>THOR'S EPIC COLLECTION</h1>
      {Object.keys(groupedProducts).map((category) => {
        // Kategoriye ait özel stil varsa uygula, yoksa varsayılan
        const catStyle = categoryStyles[category] || {
          background: '#333',
          color: '#fff'
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
                  // Hover efekti: hafif büyütme
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