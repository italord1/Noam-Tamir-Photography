import { Link } from "react-router-dom";
import "../Styles/navbar.css";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";


function Navbar() {

  const [isOpen, setIsOpen] = useState(false);


  return (
     <nav className="navbar">
      <div className="logo">Noam Tamir Photography</div>

      {/* Icon */}
      <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
       {isOpen ? <FaTimes size={26} color="#f5f5f5" /> : <FaBars size={26} color="#f5f5f5" />}
      </div>

      <ul className={`nav-links ${isOpen ? "active" : ""}`}>
        <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
        <li><Link to="/categories" onClick={() => setIsOpen(false)}>Categories</Link></li>
        <li><Link to="/about" onClick={() => setIsOpen(false)}>About</Link></li>
        <li><Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;