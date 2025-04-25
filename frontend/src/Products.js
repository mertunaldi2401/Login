import React from 'react';
import { Link } from 'react-router-dom';

const products = [
  {
    id: 1,
    name: 'Fender Stratocaster',
    model: 'Strat Classic',
    serial: 'FND-002',
    category: 'Guitars',
    image: '/images/fender.jpg',
    price: 1299.99
  },
  {
    id: 4,
    name: 'Epiphone Matt Heafy Signature',
    model: '7 Strings',
    serial: 'GTR-001',
    category: 'Guitars',
    image: '/images/epiphone-m-28833_1.jpg',
    price: 899.99
  },
  {
    id: 5,
    name: 'Ibanez Tim Henson Signature',
    model: 'TOD10',
    serial: 'GTR-002',
    category: 'Guitars',
    image: '/images/ibanez-tod10.jpg',
    price: 1499.99
  },
  {
    id: 2,
    name: 'Nano Cortex',
    model: 'Nano Cortex',
    serial: 'EFF-002',
    category: 'Effects',
    image: '/images/19425051_800.jpg',
    price: 299.99
  },
  {
    id: 3,
    name: 'Neural DSP Quad Cortex',
    model: 'Quad Cortex',
    serial: 'EFF-001',
    category: 'Effects',
    image: '/images/15848351_800.jpg',
    price: 1599.99
  },
  {
    id: 6,
    name: 'Ernie Ball Paradigm',
    model: 'Paradigm Strings',
    serial: 'STR-001',
    category: 'Strings',
    image: '/images/images-2.jpeg',
    price: 19.99
  },
  {
    id: 7,
    name: 'Ernie Ball Regular Slinky',
    model: 'Regular Slinky',
    serial: 'STR-002',
    category: 'Strings',
    image: '/images/P02221_1.jpg.webp',
    price: 9.99
  }
];

const categoryStyles = {
  Guitars: {
    background: 'linear-gradient(45deg, #000000, #ff0000)',
    color: '#fff'
  },
  Effects: {
    background: 'linear-gradient(45deg, #0f2027, #203a43)',
    color: '#fff'
  },
  Strings: {
    background: 'linear-gradient(45deg, #232526, #414345)',
    color: '#fff'
  }
};

function Products({ searchQuery = '', categoryFilter = '' }) {
  const search = searchQuery.toLowerCase();

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search) ||
      product.model.toLowerCase().includes(search) ||
      product.serial.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search);

    const matchesCategory =
      !categoryFilter ||
      product.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const groupedProducts = filteredProducts.reduce((groups, product) => {
    const { category } = product;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {});

  // Debug
  console.log('Search query:', searchQuery);
  console.log('Category filter:', categoryFilter);

  const containerStyle = {
    padding: '20px',
    fontFamily: '"Metal Mania", cursive',
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
    height: '450px',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
    borderRadius: '6px',
    transition: 'transform 0.2s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
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
    color: '#ffcc00'
  };

  const productSerialStyle = {
    color: '#ccc',
    fontSize: '0.9em'
  };

  return (
    <div style={containerStyle}>
      <h1 style={mainTitleStyle}>THOR'S EPIC COLLECTION</h1>
      {Object.keys(groupedProducts).length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>
          No products match your search or category selection.
        </p>
      ) : (
        Object.keys(groupedProducts).map((category) => {
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
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div
                      style={productCardStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <img src={product.image} alt={product.name} style={productImageStyle} />
                      <h3 style={productNameStyle}>{product.name}</h3>
                      <p style={productModelStyle}>Model: {product.model}</p>
                      <p style={productSerialStyle}>Serial: {product.serial}</p>
                      <p style={productSerialStyle}>Price: ${product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default Products;
