import React, { useEffect, useState } from 'react';
import './OrderList.css';

const OrderList = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [openOrderId, setOpenOrderId] = useState(null);

  // Merr porositë
  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:4000/allorders');
      const data = await res.json();
      setAllOrders(data);
    } catch (err) {
      console.error('Gabim gjatë marrjes së porosive:', err);
    }
  };

  // Merr produktet
  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:4000/allproducts');
      const data = await res.json();
      setAllProducts(data);
    } catch (err) {
      console.error('Gabim gjatë marrjes së produkteve:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const toggleOrder = (id) => {
    setOpenOrderId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="order-list">
      <h2>📦 Porositë e fundit</h2>
      {allOrders.length === 0 ? (
        <p>Nuk ka porosi për momentin.</p>
      ) : (
        allOrders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-summary">
              <div>
                <h3>{order.name}</h3>
                <p>{new Date(order.date).toLocaleString()}</p>
              </div>
              <div>
                <p><strong>Totali:</strong> L {order.totalAmount.toFixed(2)}</p>
                <button 
                  type="button" 
                  className="toggle-btn"
                  onClick={() => toggleOrder(order._id)}
                >
                  {openOrderId === order._id ? '🔼 Mbyll' : '🔽 Shfaq detaje'}
                </button>
              </div>
            </div>

            {openOrderId === order._id && (
              <div className="order-details">
                <p><strong>Email:</strong> {order.email}</p>
                <p><strong>Tel:</strong> {order.phone}</p>
                <p><strong>Adresa:</strong> {order.address}</p>

                <h4>🛍 Produktet:</h4>
                <div className="order-products-array">
                  {Array.isArray(order.cartItems) ? order.cartItems.map((item, index) => {
  const product = allProducts.find(p => 
    p._id === item.productId || p.id === item.productId
  );

  return (
    <div key={index} className="order-product">
      <p><strong>Emri:</strong> {product?.name || 'Produkti i panjohur'}</p>
      <p><strong>Sasia:</strong> {item.quantity}</p>
      <p><strong>Shade:</strong> {item.shade || '—'}</p>
      {product?.image && (
        <img
          src={product.image}
          alt={product.name}
          className="order-product-image"
        />
      )}
    </div>
  );
}) : <p>Nuk ka produkte në këtë porosi.</p>}


                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default OrderList;
