
import "../Styles/Categories.css";


interface Category {
  name: string;
  image: string;
}

const categories: Category[] = [
  { name: "Surfing", image: "/images/surf.jpg" },
  { name: "Windsurfing", image: "/images/wind.jpg" },
  { name: "Kitesurfing", image: "/images/kite.jpg" },
  { name: "Portraits", image: "/images/portrait.jpg" },
  { name: "Lifestyle", image: "/images/lifestyle.jpg" },
];

function Categories() {
  return (
    <section className="categories">
      <h2>Photo Categories</h2>
      <div className="grid">
        {categories.map((cat) => (
          <div key={cat.name} className="category-card">
            <img src={cat.image} alt={cat.name} />
            <h3>{cat.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;
