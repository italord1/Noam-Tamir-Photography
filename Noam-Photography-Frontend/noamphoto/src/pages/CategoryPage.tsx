import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import styles from "../Styles/CategoryPage.module.css";
import {
  API_BASE_URL,
  buildDrivePreviewUrl,
  isValidCategory,
  sanitizeImageUrl,
} from "../utils/security";

interface Media {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
}

function CategoryPage() {
  const { folder } = useParams<{ folder: string }>();
  const validFolder =
    folder && isValidCategory(folder) ? folder : null;
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!validFolder) {
      setLoading(false);
      return;
    }

    async function fetchMedia() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/media/${validFolder}`);
        const data = await res.json();
        const combined: Media[] = [
          ...(data.images || []),
          ...(data.videos || []),
        ]
          .map((item: Media) => {
            if (item.type === "video") {
              const previewUrl = buildDrivePreviewUrl(item.id);
              return previewUrl ? { ...item, url: previewUrl } : null;
            }
            const safeUrl = sanitizeImageUrl(item.url);
            return safeUrl ? { ...item, url: safeUrl } : null;
          })
          .filter((item: Media | null): item is Media => item !== null);

        setMedia(combined);
      } catch {
        setMedia([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, [validFolder]);

  if (!validFolder) {
    return <Navigate to="/categories" replace />;
  }

  return (
    <section className={styles.categoryPage}>
      <Link to="/categories">← Back to Categories</Link>
      <h2>{validFolder.toUpperCase()}</h2>

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
                  src={item.url}
                  title={item.name}
                  width="100%"
                  height="300px"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  referrerPolicy="no-referrer"
                  className={styles.videoPreview}
                />
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
