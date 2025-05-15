import React, { useEffect, useState } from 'react';
import './OrderList.css'; // Importo stilin CSS

const OrderList = () => {
  const [allorders, setAllOrders] = useState([]);

  // Funksioni për të marrë të gjitha porositë
  const fetchOrders = async () => {
    await fetch('http://localhost:4000/allorders')
      .then((res) => res.json())
      .then((data) => setAllOrders(data));
  };

  useEffect(() => {
    fetchOrders();  // Thirrja për të marrë porositë
  }, []);
  console.log(allorders);  // Kontrolloni nëse janë të dhëna në console

  return (
    <div className="order-list">
      <h2>Porositë e Kryera</h2>
      <div className="order-list-header">
        <p>Emri</p>
        <p>Adresa</p>
        <p>Email</p>
        <p>Numri i Telefonit</p>
        <p>Data</p>
        <p>Detaje të tjera</p>
      </div>
      <div className="order-list-items">
        <hr />
        {allorders.map((order) => (
          <div key={order._id} className="order-list-item">
            <p>{order.name}</p>
            <p>{order.address}</p>
            <p>{order.email}</p>
            <p>{order.phone}</p>
            <p>{new Date(order.date).toLocaleString()}</p>
            <p>{JSON.stringify(order.cartItems)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderList;
