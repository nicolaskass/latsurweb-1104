document.addEventListener("DOMContentLoaded", () => {
  const stages = document.querySelectorAll('.stage');

  // Etapa 1: satelital
  stages[0].style.opacity = 1;

  // Etapa 2: máscara catastro
  setTimeout(() => {
    const mask = document.querySelector('.mask-container');
    mask.style.opacity = 1;
    gsap.to(mask, {
      duration: 3,
      ease: "power2.out",
      onUpdate: function () {
        const radius = this.progress() * 400 + 50;
        mask.style.webkitMaskImage =
          `radial-gradient(circle ${radius}px at 50% 50%, black 100%, transparent 100%)`;
        mask.style.maskImage =
          `radial-gradient(circle ${radius}px at 50% 50%, black 100%, transparent 100%)`;
      }
    });
  }, 3000);

  // Etapa 3: dron
  setTimeout(() => {
    stages[2].style.opacity = 1;
  }, 7000);

  // Etapa 4: GNSS
  setTimeout(() => {
    stages[3].style.opacity = 1;
  }, 10000);

  // Etapa 5: amojonamiento
  setTimeout(() => {
    stages[4].style.opacity = 1;
  }, 13000);
});
