import { useEffect, useState } from "react";
import "../Styles/About.css";
import { API_BASE_URL, sanitizeImageUrl } from "../utils/security";

interface Photo {
  category: string;
  id: string;
  name: string;
  url: string;
}

const FALLBACK_BACKGROUND =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb";

function About() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [background, setBackground] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/photos`);
        const data = await res.json();

        if (!data || !Array.isArray(data.photos)) {
          return;
        }

        const aboutImages: Photo[] = data.photos
          .filter(
            (photo: Photo) =>
              photo.category === "portrait" ||
              photo.category === "watersport" ||
              photo.category === "fashion"
          )
          .map((photo: Photo) => {
            const safeUrl = sanitizeImageUrl(photo.url);
            return safeUrl ? { ...photo, url: safeUrl } : null;
          })
          .filter((photo: Photo | null): photo is Photo => photo !== null);

        setPhotos(aboutImages.slice(0, 6));

        if (aboutImages.length > 0) {
          const randomIndex = Math.floor(Math.random() * aboutImages.length);
          setBackground(aboutImages[randomIndex].url);
        }
      } catch {
        // ignore fetch errors; page shows fallback background
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const backgroundUrl =
    sanitizeImageUrl(background) ??
    sanitizeImageUrl(FALLBACK_BACKGROUND) ??
    FALLBACK_BACKGROUND;

  return (
    <section
      className="about"
      style={{
        backgroundImage: `url(${backgroundUrl})`,
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
              <div key={photo.id} className="gallery-item">
                <img src={photo.url} alt={photo.name} loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default About;
