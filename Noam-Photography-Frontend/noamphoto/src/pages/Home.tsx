import "../Styles/home.css";

function Home() {
  return (
    <section className="home">
      <video
        src="https://drive.google.com/uc?export=download&id=1IaTyfuGfbBQyKt63OotgAAP_JGUwp2kL"
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
