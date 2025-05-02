import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import ShopCategory from './Pages/ShopCategory';
import Product from './Pages/Products';
import Cart from './Pages/Cart';
import LoginSignup from './Pages/LoginSignup';
import Blog from './Pages/Blog';
import About from './Pages/About.jsx';

function App() {
  return (
    <BrowserRouter>

      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/face' element={<ShopCategory category="face" />} />
        <Route path='/eyes' element={<ShopCategory category="eyes" />} />
        <Route path='/lips' element={<ShopCategory category="lips" />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/login' element={<LoginSignup />} />
        <Route path='/blog' element={<Blog />} />
        <Route path='/about' element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
