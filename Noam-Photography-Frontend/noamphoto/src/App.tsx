import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Navbar from "./components/NavBar";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";
import CategoryPage from "./pages/CategoryPage";

function App() {
  return (
    <Router>
      <div className="app-container">
       
        <Navbar />

        {/* main content */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/category/:folder" element={<CategoryPage />} />
          </Routes>
        </main>

        {/* footer */}
         <Footer />
      </div>
    </Router>
  );
}

export default App;
