// Toggle de las tarjetas de Servicios

function toggleDescripcion(element) {
  const tarjetaActual = element.closest('.servicio-card-expandible');
  const todasLasTarjetas = document.querySelectorAll('.servicio-card-expandible');

  // Cerrar todas las demás
  todasLasTarjetas.forEach(t => {
    if (t !== tarjetaActual) {
      t.classList.remove('expandida');
      t.querySelector('.toggle-chevron')?.classList.remove('rotate');
    }
  });

  // Alternar la actual
  tarjetaActual.classList.toggle('expandida');
  tarjetaActual.querySelector('.toggle-chevron')?.classList.toggle('rotate');

  if (tarjetaActual.classList.contains('expandida')) {
    setTimeout(() => {
      tarjetaActual.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }
}

// Función global para inicializar eventos después de la carga dinámica
function initToggleServicios() {
  // Click en tarjeta completa (excepto toggle-chevron, a, button)
  document.querySelectorAll('.servicio-card-expandible').forEach(tarjeta => {
    tarjeta.addEventListener('click', e => {
      if (e.target.closest('a, button, .toggle-chevron')) return;
      toggleDescripcion(tarjeta);
    });
  });

  // Click en el botón de la flechita (toggle-chevron)
  document.querySelectorAll('.toggle-chevron').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation(); // Evita doble evento
      toggleDescripcion(btn);
    });
  });

  // Cerrar al hacer clic fuera de las tarjetas
  document.addEventListener('click', e => {
    if (!e.target.closest('.servicio-card-expandible')) {
      document.querySelectorAll('.servicio-card-expandible.expandida').forEach(t => {
        t.classList.remove('expandida');
        t.querySelector('.toggle-chevron')?.classList.remove('rotate');
      });
    }
  });

  console.log("ToggleServicios: eventos conectados.");
}
