import "../Styles/home.css";
import myVideo from "../assets/videos/קייט בגבעה.mp4"

function Home() {
  return (
    <section className="home">
      <video
        src={myVideo}
        autoPlay
        loop
        muted
        playsInline
        className="home-video"
      />

      <div className="hero-content">
        <h1>Capturing the movement of life through the lens</h1>
        <p>Water sports • Portraits • Video • Drone • Fashion</p>
        <a href="/categories" className="btn">Explore Gallery</a>
      </div>
    </section>
  );
}

export default Home;

