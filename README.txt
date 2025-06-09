============================================================
Latitud Sur - Sitio Web Profesional
============================================================

Estructura de archivos organizada y modularizada:

------------------------------------------------------------
index.html
------------------------------------------------------------
→ Archivo principal del sitio.
→ Carga dinámica las secciones mediante loadSections.js.
→ Incluye los CSS globales y por sección.
→ Incluye el footer y la navbar fija.

------------------------------------------------------------
/sections/
------------------------------------------------------------
→ Contiene las secciones principales del sitio en archivos HTML separados:

- hero.html          → sección Hero (carrusel de imágenes + título)
- servicios.html     → sección Servicios (cards expandibles)
- nosotros.html      → sección Nosotros (tarjetas del equipo)
- trabajos.html      → sección Trabajos (carrusel Swiper)
- contacto.html      → sección Contacto (info + formulario)

------------------------------------------------------------
/assets/css/
------------------------------------------------------------
→ Contiene los estilos CSS:

- style.css          → estilos globales (body, navbar, footer, curvas fondo)
- hero.css           → estilos específicos de la sección Hero
- servicios.css      → estilos de la sección Servicios
- nosotros.css       → estilos de la sección Nosotros
- trabajos.css       → estilos de la sección Trabajos
- contacto.css       → estilos de la sección Contacto

------------------------------------------------------------
/assets/js/
------------------------------------------------------------
→ Contiene los scripts JS:

- loadSections.js    → carga dinámica de las secciones en index.html
- toggleServicios.js → comportamiento de expansión/cierre en Servicios
- swiper-init.js     → inicialización del Swiper en Trabajos
- aos-init.js        → inicialización de la librería AOS
- hero.js            → animación de entrada en Hero

------------------------------------------------------------
/assets/images/
------------------------------------------------------------
→ Carpeta para todas las imágenes:

- logo.png
- icono-ls.ico
- curvas-fondo-martin.png
- Imágenes de los trabajos realizados (ruta2.jpg, saneamiento.jpg, etc.)
- Fotos del equipo (moccia.jpg, saldivar.jpg)

------------------------------------------------------------
Notas de uso:
------------------------------------------------------------

✅ El sitio es 100% compatible con Netlify y GitHub Pages.

✅ Todas las secciones se cargan dinámicamente vía JS (loadSections.js),
  por lo que se debe mantener la estructura de carpetas.

✅ Se pueden agregar nuevas secciones fácilmente:

1) Crear un nuevo archivo en /sections/ (por ejemplo: nueva-seccion.html)
2) Agregar el ID correspondiente en index.html como <div id="nueva-seccion"></div>
3) Agregar la entrada correspondiente en loadSections.js.

------------------------------------------------------------
Autor: Latitud Sur
Fecha: 2025
------------------------------------------------------------

