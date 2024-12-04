
export const mappedPhotos=[]

const fetchPhotos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/photos');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const photos = data.files || [];
        mappedPhotos = photos.map(photo => ({
        id: photo.id,
        name: photo.name,
        size: photo.size ? parseInt(photo.size) : 0,
        url: `https://drive.google.com/uc?id=${photo.id}`, // Fixed URL format for Google Drive
      }));
      console.log(mappedPhotos);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }

  };
  fetchPhotos();
  