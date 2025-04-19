import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-logo">
        <img src={logo} alt="" />
        <p>Glow Up Cosmetics</p>
      </div>
      <ul className="nav-menu">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            Home
          </NavLink>
        </li>

        <li className={`dropdown ${location.pathname.includes('/face') || location.pathname.includes('/eyes') || location.pathname.includes('/lips') ? 'active' : ''}`}>
          Products
          <ul className="dropdown-menu">
            <li>
              <NavLink to="/face" className={({ isActive }) => isActive ? 'active' : ''}>Face</NavLink>
            </li>
            <li>
              <NavLink to="/eyes" className={({ isActive }) => isActive ? 'active' : ''}>Eyes</NavLink>
            </li>
            <li>
              <NavLink to="/lips" className={({ isActive }) => isActive ? 'active' : ''}>Lips</NavLink>
            </li>
          </ul>
        </li>

        <li>
          <NavLink to="/blog" className={({ isActive }) => isActive ? 'active' : ''}>
            Blog
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
            About Us
          </NavLink>
        </li>
      </ul>

      <div className="nav-logo-cart">
        <NavLink to="/login">
          <button>Login</button>
        </NavLink>
        <NavLink to="/cart" style={{ position: 'relative' }}>
          <img src={cart_icon} alt="cart" />
          <div className="nav-cart-count">0</div>
        </NavLink>
      </div>
    </div>
  );
};

export default Navbar;
