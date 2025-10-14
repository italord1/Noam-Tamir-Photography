import { useEffect, useState } from "react";
import "../Styles/About.css";

interface Photo {
  category: string;
  id: string;
  name: string;
  url: string;
}

function About() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [background, setBackground] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/photos"); 
        const data = await res.json();

        if (!data || !Array.isArray(data.photos)) {
          console.error("Invalid response:", data);
          return;
        }

     
        const aboutImages: Photo[] = data.photos.filter(
          (photo: Photo) =>
            photo.category === "portrait" ||
            photo.category === "watersport" ||
            photo.category === "fashion"
        );

        setPhotos(aboutImages.slice(0, 6)); 

        
        if (aboutImages.length > 0) {
          const randomIndex = Math.floor(Math.random() * aboutImages.length);
          setBackground(aboutImages[randomIndex].url);
        }
      } catch (err) {
        console.error("Error fetching about photos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  return (
    <section
      className="about"
      style={{
        backgroundImage: background
          ? `url(${background})`
          : "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb')",
      }}
    >
      <div className="about-overlay"></div>

      <div className="about-content">
        <h2>About Noam</h2>
        <p>
          Noam Tamir is a photographer specializing in ocean sports and
          portraits. Her passion for the sea and human expression drives her
          work, capturing both energy and emotion in every shot.
        </p>

        {loading ? (
          <div className="loading">Loading photos...</div>
        ) : (
          <div className="about-gallery">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="gallery-item"
                style={{ backgroundImage: `url(${photo.url})` }}
              ></div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default About;
