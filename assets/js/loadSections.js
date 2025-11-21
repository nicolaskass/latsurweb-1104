// Carga dinámica de secciones con reinicialización de AOS, toggleServicios y Swiper

const sections = ['hero', 'servicios', 'nosotros', 'trabajos', 'contacto'];
let loadedCount = 0;

sections.forEach(section => {
  fetch(`sections/${section}.html`)
    .then(response => response.text())
    .then(html => {
      document.getElementById(section).innerHTML = html;
      loadedCount++;

      if (loadedCount === sections.length) {
        console.log("Todas las secciones cargadas.");

        // Reinicializar AOS
        if (typeof AOS !== 'undefined') {
          AOS.init({
            duration: 1000,
            once: true
          });
          console.log("AOS inicializado.");
        }

        // Inicializar toggleServicios
        if (typeof initToggleServicios !== 'undefined') {
          initToggleServicios();
          console.log("ToggleServicios inicializado.");
        }

        // Inicializar Swiper
        if (typeof Swiper !== 'undefined' && typeof SwiperInit !== 'undefined') {
          new SwiperInit();
          console.log("Swiper inicializado.");
        }

        // Inicializar selector de servicios en contacto
        if (typeof initServiceSelector !== 'undefined') {
          initServiceSelector();
          console.log("Service selector inicializado.");
        }

        // Inicializar hero slideshow
        if (typeof initHeroSlideshow !== 'undefined') {
          initHeroSlideshow();
          console.log("Hero slideshow inicializado.");
        }
      }
    })
    .catch(error => console.error(`Error al cargar sección ${section}:`, error));
});
