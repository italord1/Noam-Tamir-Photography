import { useEffect, useState } from "react";
import "../Styles/Categories.css";

interface Category {
  name: string;
  folder: string;
}

interface Photo {
  id: string;
  name: string;
  url: string;
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
  const [photos, setPhotos] = useState<Record<string, Photo[]>>({});

  useEffect(() => {
    // Fetch images for each category
    categories.forEach(async (cat) => {
      try {
        const res = await fetch(`http://localhost:3000/api/photos/${cat.folder}`);
        const data = await res.json();
        setPhotos((prev) => ({
          ...prev,
          [cat.folder]: data.images || [],
        }));
      } catch (err) {
        console.error(`Error loading ${cat.name} photos:`, err);
      }
    });
  }, []);

 console.log(photos)

  return (
    <section className="categories">
      <h2>Photo Categories</h2>
      <div className="grid">
        {categories.map((cat) => {
          const categoryPhotos = photos[cat.folder] || [];
        
          const preview = categoryPhotos[5]?.url;
         
          return (
            <div key={cat.folder} className="category-card">
              {preview ? (
                <img src={preview} alt={cat.name} />
              ) : (
                <div className="loading">Loading...</div>
              )}
              <h3>{cat.name}</h3>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Categories;
