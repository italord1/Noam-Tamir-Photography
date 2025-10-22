import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "../Styles/CategoryPage.module.css";

interface Media {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
}

function CategoryPage() {
  const { folder } = useParams<{ folder: string }>();
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMedia() {
      if (!folder) return;
      try {
        const res = await fetch(`https://noam-tamir-photography.onrender.com/api/media/${folder}`);
        const data = await res.json();
        const combined: Media[] = [
          ...(data.images || []),
          ...(data.videos || []),
        ];
        setMedia(combined);
      } catch (err) {
        console.error(`Error loading media for ${folder}:`, err);
      } finally {
        setLoading(false);
      }
    }
    fetchMedia();
  }, [folder]);

  return (
    <section className={styles.categoryPage}>
      <Link to="/Categories">← Back to Categories</Link>
      <h2>{folder?.toUpperCase()}</h2>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : media.length === 0 ? (
        <p>No media found in this category.</p>
      ) : (
        <div className={styles.photoGrid}>
          {media.map((item) => (
            <div key={item.id} className={styles.photoCard}>
              {item.type === "video" ? (
                <iframe
                  src={`https://drive.google.com/file/d/${item.id}/preview`}
                  width="100%"
                  height="300px"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className={styles.videoPreview}
                ></iframe>
              ) : (
                <img
                  src={item.url}
                  alt={item.name}
                  className={styles.imagePreview}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default CategoryPage;
