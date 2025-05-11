document.addEventListener("DOMContentLoaded", () => {
    AOS.init({
      duration: 1000,       // Duración de la animación (ms)
      easing: 'ease-out',   // Suavidad
      once: true            // Solo una vez por scroll
    });
  });

  function toggleDescripcion(button) {
    const card = button.closest('.servicio-card-expandible');
    const icon = button.querySelector('i');
  
    card.classList.toggle('expandida');
    button.classList.toggle('rotate');
  
    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
  }
  