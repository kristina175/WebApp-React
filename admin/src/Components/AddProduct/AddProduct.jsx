import React, {useState} from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'

const AddProduct = () => {
  const [image,setImage] = useState(false);
  const [productDetails,setProductDetails] = useState({
    name:" ",
    image:" ",
    category:"fytyra",
    new_price:" ",
    old_price:" "
  })

  const imageHandler =(e) =>{
    setImage(e.target.files[0]);
  }
  const changeHandler = (e) => {
    setProductDetails({...productDetails,[e.target.name]:e.target.value})
  }
  const Add_Product =async () =>{
    console.log(productDetails);
    let responseData;
    let product = productDetails;


    let formData = new FormData();
    formData.append('product',image);

    await fetch('http://localhost:4000/upload',{
      method:'POST',
      headers:{
        Accept:'application/json',
      },
      body:formData,
    }).then((resp) => resp.json()).then((data)=>{responseData=data});

    if(responseData.success)
    {
      product.image = responseData.image_url;
      console.log(product);
      await fetch('http://localhost:4000/addproduct',{
        method:'POST',
        headers:{
          Accept:'application/json',
          'Content-Type':'application/json',
        },
        body:JSON.stringify(product),

      }).then((resp)=>resp.json()).then((data)=>{
        data.success?alert("Produkti u shtua me sukses!"):alert("Deshtoi! X ")
      })
    }

  }

  return (
    
    <div className='add-product'>
      <div className="addproduct-itemfield">
       <p>Emri Produktit</p>
       <input value={productDetails.name} onChange={changeHandler} type="text" name='name' placeholder='Shkruaj këtu' />
     </div>
     <div className="addproduct-price">
      <div className="addproduct-itemfield">
        <p>Çmimi</p>
        <input value={productDetails.old_price} onChange={changeHandler} type="text" name="old_price" placeholder='Shkruaj këtu'/>
      </div>
      <div className="addproduct-itemfield">
        <p>Çmimi me Zbritje </p>
        <input value={productDetails.new_price} onChange={changeHandler} type="text" name="new_price" placeholder='Shkruaj këtu'/>
      </div>
     </div>
     <div className="addproduct-itemfield">
      <div className="selecti">
      <p>Kategoria e Produktit</p>
      <select value={productDetails.category} onChange={changeHandler} name="category" className='add-product-selector'>
        <option value="face">Fytyra</option>
        <option value="eyes">Sytë</option>
        <option value="lips">Buzët</option>
      </select>
      </div>
     </div>
     <div className="addproduct-itemfield">
      <label htmlFor="file-input">
        <img src={image?URL.createObjectURL(image):upload_area} className='addproduct-thumnail-img' alt=" "/>
      </label>
      <input onChange={imageHandler} type="file" name='image' id='file-input' hidden />
     </div>
     <button onClick={()=>{Add_Product()}} className='addproduct-btn'>SHTO</button>
    </div>
  )
}

export default AddProduct
