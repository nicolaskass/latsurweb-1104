// Ejemplo de animación con GSAP para el Hero

document.addEventListener('DOMContentLoaded', () => {
  gsap.from(".hero-title", { duration: 1, y: -50, opacity: 0, ease: "power2.out" });
  gsap.from(".hero-subtitle", { duration: 1.2, y: 50, opacity: 0, delay: 0.5, ease: "power2.out" });
});
