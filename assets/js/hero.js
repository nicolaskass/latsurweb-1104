// Hero slideshow y animaciones

function initHeroSlideshow() {
  // Animaciones de texto con GSAP
  if (typeof gsap !== 'undefined') {
    gsap.from(".hero-title", { duration: 1, y: -50, opacity: 0, ease: "power2.out" });
    gsap.from(".hero-subtitle", { duration: 1.2, y: 50, opacity: 0, delay: 0.5, ease: "power2.out" });
  }

  // Carrusel de imágenes de fondo
  const slides = document.querySelectorAll('.hero-slide');

  if (slides.length > 0) {
    let currentSlide = 0;

    function nextSlide() {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }

    // Cambiar imagen cada 4 segundos
    setInterval(nextSlide, 4000);
    console.log('Hero slideshow initialized with', slides.length, 'slides');
  } else {
    console.warn('No hero slides found');
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroSlideshow);
} else {
  initHeroSlideshow();
}
