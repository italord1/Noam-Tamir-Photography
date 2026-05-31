import { useEffect, useState } from "react";
import styles from "../Styles/Categories.module.css";
import { Link } from "react-router-dom";
import {
  API_BASE_URL,
  MEDIA_CATEGORIES,
  type MediaCategory,
  sanitizeIframeUrl,
  sanitizeImageUrl,
} from "../utils/security";

interface Category {
  name: string;
  folder: MediaCategory;
}

interface Media {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
}

const categories: Category[] = [
  { name: "Fashion", folder: "fashion" },
  { name: "Watersport", folder: "watersport" },
  { name: "Portrait", folder: "portrait" },
  { name: "Campign", folder: "campign" },
  { name: "Drone", folder: "drone" },
  { name: "Documentary", folder: "documentary" },
  { name: "Video", folder: "video" },
];

function sanitizeMediaItem(item: Media): Media | null {
  if (item.type === "video") {
    const safeUrl = sanitizeIframeUrl(item.url);
    return safeUrl ? { ...item, url: safeUrl } : null;
  }
  const safeUrl = sanitizeImageUrl(item.url);
  return safeUrl ? { ...item, url: safeUrl } : null;
}

function Categories() {
  const [media, setMedia] = useState<Record<string, Media[]>>({});

  useEffect(() => {
    MEDIA_CATEGORIES.forEach(async (folder) => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/media/${folder}`);
        const data = await res.json();
        const combined: Media[] = [...(data.images || []), ...(data.videos || [])]
          .map(sanitizeMediaItem)
          .filter((item): item is Media => item !== null);

        setMedia((prev) => ({
          ...prev,
          [folder]: combined,
        }));
      } catch {
        // ignore per-category errors
      }
    });
  }, []);

  return (
    <section className={styles.categories}>
      <h2>Photo & Video Categories</h2>
      <div className={styles.grid}>
        {categories.map((cat) => {
          const categoryMedia = media[cat.folder] || [];
          const preview = categoryMedia[5] || categoryMedia[0];

          return (
            <div key={cat.folder} className={styles.categoryCard}>
              <Link to={`/category/${cat.folder}`}>
                {preview ? (
                  preview.type === "video" ? (
                    <iframe
                      src={preview.url}
                      title={preview.name}
                      className={styles.previewVideo}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      sandbox="allow-scripts allow-same-origin allow-presentation"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <img
                      src={preview.url}
                      alt={preview.name}
                      className={styles.previewImage}
                    />
                  )
                ) : (
                  <div className={styles.loading}>Loading...</div>
                )}
                <h3>{cat.name}</h3>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Categories;
