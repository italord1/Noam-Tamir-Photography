
import { fetchPhotos } from './DriveFetch.js';

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const photos = await fetchPhotos();

    // Limit the number of photos displayed (e.g., only the first 10)
    const limitedPhotos = photos.slice(0, 44);

    // Display the first limited photo as the cover
    const selectedPhoto = limitedPhotos[8];
    if (selectedPhoto) {
      const PortraitCover = document.getElementById("PortraitCover");
      if (PortraitCover) {
        PortraitCover.src = selectedPhoto.url;
        PortraitCover.alt = selectedPhoto.name;
      }
    }

    // Populate the gallery with the limited photos
    const galleryContainer = document.getElementById("lightgallery");
    if (galleryContainer) {
      galleryContainer.innerHTML = limitedPhotos.map(photo => `
        <div class="col-sm-6 col-md-4 col-lg-3 col-xl-3 item" data-src="${photo.url}">
          <a href="#"><img src="${photo.url}" alt="${photo.name}" class="img-fluid"></a>
        </div>
      `).join('');

      // Initialize lightGallery
      $('#lightgallery').lightGallery();

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
});



