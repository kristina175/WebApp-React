import React from 'react'
import './Admin.css'
import Sidebar from '../../Components/Sidebar/Sidebar'
import { Routes ,Route} from 'react-router-dom'
import AddProduct from '../../Components/AddProduct/AddProduct'
import ListProduct from '../../Components/ListProduct/ListProduct';
import OrderList from '../../Components/OrderList/OrderList';

const Admin = () => {
  return (
    <div className='admin'>
      <Sidebar/>
      
      <Routes>
        
        <Route path='/addproduct' element={<AddProduct/>}/>
        <Route path='/listproduct' element={<ListProduct/>}/>
        <Route path='/orderslist' element={<OrderList/>}/>

      </Routes>
    </div>
  )
}

export default Admin
