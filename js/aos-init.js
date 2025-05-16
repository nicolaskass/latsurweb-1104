document.addEventListener("DOMContentLoaded", () => {
    AOS.init({
      duration: 1000,       // Duración de la animación (ms)
      easing: 'ease-out',   // Suavidad
      once: true            // Solo una vez por scroll
    });
  });

  function toggleDescripcion(button) {
    const clickedCard = button.closest('.servicio-card-expandible');
    const allCards = document.querySelectorAll('.servicio-card-expandible');
  
    allCards.forEach(card => {
      if (card !== clickedCard) {
        card.classList.remove('expandida');
        card.querySelector('.toggle-chevron')?.classList.remove('rotate');
        card.querySelector('.toggle-chevron i')?.classList.remove('fa-chevron-up');
        card.querySelector('.toggle-chevron i')?.classList.add('fa-chevron-down');
      }
    });
  
    const icon = button.querySelector('i');
    const isExpanded = clickedCard.classList.toggle('expandida');
  
    button.classList.toggle('rotate', isExpanded);
    icon.classList.toggle('fa-chevron-down', !isExpanded);
    icon.classList.toggle('fa-chevron-up', isExpanded);
  }
  

  function enviarWhatsappDesde(btn) {
    const card = btn.closest('.servicio-card-expandible');
    const servicio = card.dataset.servicio || "uno de sus servicios";
  
    const fecha = new Date().toLocaleDateString('es-AR');
    const textoCopia = `${servicio} – ${fecha}`;
    navigator.clipboard.writeText(textoCopia).then(() => {
      console.log('Texto copiado:', textoCopia);
    });
  
    const mensaje = `Hola, quiero hacer una consulta sobre ${servicio}.`;
    const url = "https://wa.me/5492215573180?text=" + encodeURIComponent(mensaje);
    window.open(url, '_blank');
  }
  