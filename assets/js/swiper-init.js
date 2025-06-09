// Inicialización de Swiper para Trabajos

function SwiperInit() {
  return new Swiper(".mySwiper", {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    speed: 700,
    autoplay: window.innerWidth >= 768
      ? {
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }
      : false,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev"
    },
    breakpoints: {
      768: {
        slidesPerView: 2
      },
      992: {
        slidesPerView: 3
      }
    }
  });
}
