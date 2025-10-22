import { Link } from "react-router-dom";
import "../Styles/home.css";

function Home() {
  return (
    <section className="home">
      <video
        src="https://res.cloudinary.com/dhgluhvky/video/upload/v1761125035/kite_bageva_ybn72h.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="home-video"
      />
      <div className="hero-content">
        <h1>Capturing the movement of life through the lens</h1>
        <p>Water sports • Portraits • Video • Drone • Fashion</p>
        <Link to="/categories" className="btn">Explore Gallery</Link>
      </div>
    </section>
  );
}

export default Home;


