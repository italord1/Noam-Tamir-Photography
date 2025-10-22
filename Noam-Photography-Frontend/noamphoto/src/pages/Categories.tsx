import { useEffect, useState } from "react";
import styles from "../Styles/Categories.module.css";
import { Link } from "react-router-dom";

interface Category {
  name: string;
  folder: string;
}

interface Media {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
  thumbnail?: string; // optional thumbnail URL for videos
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

function Categories() {
  const [media, setMedia] = useState<Record<string, Media[]>>({});

  useEffect(() => {
    categories.forEach(async (cat) => {
      try {
        const res = await fetch(`https://noam-tamir-photography.onrender.com/api/media/${cat.folder}`);
        const data = await res.json();
        const combined: Media[] = [
          ...(data.images || []),
          ...(data.videos || []),
        ];
        setMedia((prev) => ({
          ...prev,
          [cat.folder]: combined,
        }));
      } catch (err) {
        console.error(`Error loading ${cat.name} media:`, err);
      }
    });
  }, []);

  return (
    <section className={styles.categories}>
      <h2>Photo & Video Categories</h2>
      <div className={styles.grid}>
        {categories.map((cat) => {
          const categoryMedia = media[cat.folder] || [];
          const preview = categoryMedia[5] || categoryMedia[0]; // fallback

          return (
            <div key={cat.folder} className={styles.categoryCard}>
              <Link to={`/category/${cat.folder}`}>
                {preview ? (
                  preview.type === "video" ? (
                    // Use iframe if video
                    <iframe
                      src={preview.url}
                      title={preview.name}
                      className={styles.previewVideo}
                     
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    // Use image if not video
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
