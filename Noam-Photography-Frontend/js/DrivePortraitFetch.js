
document.addEventListener("DOMContentLoaded", () => {
  
    const fetchPhotos = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/photos');
        const data = await response.json();

        const photos = data.files || [];
        const mappedPhotos = photos.map(photo => {
          return {
            id: photo.id,
            name: photo.name,
            size: photo.size ? parseInt(photo.size) : 0,
            url: `https://lh5.googleusercontent.com/d/${photo.id}`
          };
        });
  
        const selectedPhoto = mappedPhotos[8];
        if (selectedPhoto) {
          const waterSportCover = document.getElementById("PortraitCover");
          if (waterSportCover) {
            waterSportCover.src = selectedPhoto.url;
            waterSportCover.alt = selectedPhoto.name;
          }
        }
  
        const galleryContainer = document.getElementById("lightgallery");
        if (galleryContainer) {
          galleryContainer.innerHTML = mappedPhotos.map(photo => `
            <div class="col-sm-6 col-md-4 col-lg-3 col-xl-3 item" data-src="${photo.url}">
              <a href="#"><img src="${photo.url}" alt="${photo.name}" class="img-fluid"></a>
            </div>
          `).join('');
  
          $('#lightgallery').lightGallery();
  
          // Reinitialize lightGallery after adding photos
          if (window.lightGallery) {
            lightGallery(galleryContainer, {
              selector: '.item',
              mode: 'lg-slide',
            });
          } else {
            console.error("lightGallery is not loaded.");
          }
        }
      } catch (error) {
        console.error("Error fetching photos:", error);
      }
    };
  
    fetchPhotos();
  });
  













  
  
  
  
  