import React, { useEffect, useState } from 'react'  
import './ListProduct.css'
import cross_icon from '../../assets/cross_icon.png'

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);  

  const fetchInfo = async () => {
    await fetch('http://localhost:4000/allproducts')
      .then((res) => res.json())
      .then((data) => setAllProducts(data));
  }

  useEffect(() => {
    fetchInfo();
  }, [])
 
  const remove_product = async (id) => {
    console.log("Po fshij produktin me ID:", id);
    await fetch('http://localhost:4000/removeproduct', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: Number(id) })
    });
    await fetchInfo();
  }
  
  

  return (
    <div className='list-product'>
      <h1>Lista e Produkteve</h1>
      <div className="listproduct-format-main">
        <p>Produktet</p>
        <p>Emri</p>
        <p>Cmimi i Vjeter</p>
        <p>Cmimi i Ri</p>
        <p>Kategoria</p>
        <p>Hiq</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product) => (
  <div key={product.id} className="listproduct-format-main listproduct-format">
    <img src={product.image} alt="" className="listproduct-product-icon" />
    <p>{product.name}</p>
    <p>L {product.old_price}</p>
    <p>L {product.new_price}</p>
    <p>{product.category}</p>
    <img onClick={() => remove_product(product.id)} className='listproduct-remove-icon' src={cross_icon} alt="Remove Product" />
  </div>
))}

      </div>
    </div>
  )
}

export default ListProduct;
