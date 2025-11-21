// ====================================================================
// DESCRIPCIONES DE SERVICIOS PARA LA SECCIÓN DE CONTACTO
// ====================================================================
// IMPORTANTE: Estas descripciones son independientes de las tarjetas
// de servicios. Podés modificarlas aquí sin afectar el contenido
// de las tarjetas en la sección "Nuestros Servicios".
// Próximamente se expandirán para incluir más detalles.
// ====================================================================

const serviceDescriptions = {
  'estado-parcelario': {
    title: 'Estado Parcelario',
    description: 'Verificación legal y física de inmuebles. Obligatorio para escrituración y registro catastral en la Provincia de Buenos Aires.'
  },
  'deslinde': {
    title: 'Deslinde y Amojonamiento',
    description: 'Determinación de límites con mojones. Evita conflictos con vecinos y asegura la correcta delimitación de la propiedad.'
  },
  'subdivisiones': {
    title: 'Subdivisiones',
    description: 'Fraccionamiento de parcelas para herencias, desarrollos inmobiliarios o ventas. Cumplimiento técnico y legal garantizado.'
  },
  'articulo-6': {
    title: 'Artículo 6° / Decreto 947',
    description: 'Tramitación previa a construcciones o subdivisiones según Ley Provincial. Cumplimiento legal para presentación municipal.'
  },
  'relevamientos': {
    title: 'Relevamientos Topográficos',
    description: 'Obtención de datos altimétricos y planimétricos con GNSS y estación total. Esenciales para obras civiles, loteos y catastros.'
  },
  'replanteos': {
    title: 'Replanteos de Obra',
    description: 'Marcado de ejes, cotas y niveles en el terreno a partir del plano. Precisión para construcción segura y eficiente.'
  }
};

// Función para inicializar el selector de servicios
function initServiceSelector() {
  const serviceSelector = document.getElementById('service-selector');
  const descriptionBox = document.getElementById('service-description');
  const titleElement = document.getElementById('service-title');
  const textElement = document.getElementById('service-text');

  if (serviceSelector && descriptionBox && titleElement && textElement) {
    serviceSelector.addEventListener('change', function() {
      const selectedValue = this.value;

      if (selectedValue && serviceDescriptions[selectedValue]) {
        const service = serviceDescriptions[selectedValue];
        titleElement.textContent = service.title;
        textElement.textContent = service.description;
        descriptionBox.classList.remove('hidden');
      } else {
        descriptionBox.classList.add('hidden');
      }
    });
    console.log('Service selector initialized');
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initServiceSelector);
} else {
  initServiceSelector();
}
