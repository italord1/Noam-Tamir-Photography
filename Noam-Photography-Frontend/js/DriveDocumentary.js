



document.addEventListener("DOMContentLoaded", () => {
  const fetchPhotos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/photos');
      const data = await response.json();
      const photos = data.files || [];
      const mappedPhotos = photos.map(photo => ({
        id: photo.id,
        name: photo.name,
        size: photo.size ? parseInt(photo.size) : 0,
        url: `https://lh5.googleusercontent.com/d/${photo.id}`,
      }));

      // Limit the number of photos displayed (e.g., only the first 10)
      const limitedPhotos = mappedPhotos.slice(111,150);

      // Display the first limited photo as the cover
      const selectedPhoto = limitedPhotos[1];
      if (selectedPhoto) {
        const DocumentaryCover = document.getElementById("DocumentaryCover");
        if (DocumentaryCover) {
          DocumentaryCover.src = selectedPhoto.url;
          DocumentaryCover.alt = selectedPhoto.name;
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




  
  
  
  
  
  
  
  