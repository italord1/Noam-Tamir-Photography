document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = 'AIzaSyBUIjankElrqZPBhzxLmsQYEE9Q0bXmMGE';
  const FOLDER_ID = '12vkb8Vlfqde-RBV7TbLioG99WDKVyWNJ';

  const fetchPhotos = async () => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType,size)`
      );
      const data = await response.json();
      const photos = data.files;

      const mappedPhotos = photos.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size ? parseInt(file.size) : 0,
        url: `https://lh5.googleusercontent.com/d/${file.id}`
      }));

      const selectedPhoto = mappedPhotos[31];
      if (selectedPhoto) {
        const waterSportCover = document.getElementById("WaterSportCover");
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






