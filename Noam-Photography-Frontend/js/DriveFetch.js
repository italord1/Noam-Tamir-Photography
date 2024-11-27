

let cachedPhotos = null; // Global cache

export const fetchPhotos = async () => {
  if (cachedPhotos) {
    console.log("Using cached photos");
    return cachedPhotos; // Return cached photos if already fetched
  }

  try {
    const response = await fetch('http://localhost:3000/api/photos');
    const data = await response.json();
    const photos = data.files || [];
    cachedPhotos = photos.map(photo => ({
      id: photo.id,
      name: photo.name,
      size: photo.size ? parseInt(photo.size) : 0,
      url: `https://lh5.googleusercontent.com/d/${photo.id}`,
    }));
    console.log("Fetched and cached photos:", cachedPhotos);
    return cachedPhotos;
  } catch (error) {
    console.error("Error fetching photos:", error);
    return [];
  }
};
