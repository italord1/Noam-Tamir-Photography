import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "../Styles/CategoryPage.module.css";


interface Photo {
    id: string;
    name: string;
    url: string;
}

function CategoryPage() {
    const { folder } = useParams<{ folder: string }>();
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPhotos() {
            if (!folder) return;
            try {
                const res = await fetch(`http://localhost:3000/api/photos/${folder}`);
                const data = await res.json();
                setPhotos(data.images || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchPhotos();
    }, [folder]);

    return (
        <section className={styles.categoryPage}>
            <Link to="/Categories">← Back to Categories</Link>
            <h2>{folder?.toUpperCase()}</h2>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className={styles.photoGrid}>
                    {photos.map((photo) => (
                        <div key={photo.id} className={styles.photoCard}>
                            <img src={photo.url} alt={photo.name} />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default CategoryPage;
