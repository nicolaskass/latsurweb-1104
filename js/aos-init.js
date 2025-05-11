document.addEventListener("DOMContentLoaded", () => {
    AOS.init({
      duration: 1000,       // Duración de la animación (ms)
      easing: 'ease-out',   // Suavidad
      once: true            // Solo una vez por scroll
    });
  });
  