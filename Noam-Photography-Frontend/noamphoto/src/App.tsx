import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";


import Home from "./pages/Home";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Contact from "./pages/Contact";

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* navbar */}
        <nav className="navbar">
          <div className="logo">Noam Tamir Photography</div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li>
              <a 
                href="https://instagram.com/noamtamirphoto" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <img src="/instagram.svg" alt="Instagram" className="insta-icon" />
              </a>
            </li>
          </ul>
        </nav>

        {/* main content */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        {/* footer */}
        <footer className="footer">
          © {new Date().getFullYear()} Noam Tamir Photography | Built by Itai Glipoliti
        </footer>
      </div>
    </Router>
  );
}

export default App;
