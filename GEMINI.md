## Project Overview

This is a static website for "Latitud Sur", a surveying and topography company. The website is designed to be professional, modern, and informative, showcasing the company's services, work, and team.

The site is built using HTML, CSS, and JavaScript, with the following libraries and frameworks:

*   **Bootstrap:** For responsive layout and UI components.
*   **GSAP (GreenSock Animation Platform):** For animations, particularly in the hero section.
*   **AOS (Animate On Scroll):** For scroll animations.
*   **Swiper:** For the carousel in the "Trabajos" (Our Work) section.

The website has a modular architecture. The main `index.html` file serves as a template, and the different sections (hero, services, about us, etc.) are loaded dynamically from separate HTML files in the `/sections` directory using JavaScript. This approach keeps the codebase organized and easy to maintain.

## Building and Running

This is a static website, so there is no build process required. To run the website, simply open the `index.html` file in a web browser.

The website is fully compatible with static hosting services like Netlify and GitHub Pages.

## Development Conventions

*   **Modular Structure:** The website is divided into sections, with each section having its own HTML, CSS, and sometimes JavaScript file. This makes it easy to work on individual sections without affecting the rest of the site.
*   **Dynamic Loading:** The `assets/js/loadSections.js` script dynamically loads the sections into the `index.html` file. When adding a new section, you need to create the HTML file in the `/sections` directory and add it to the `sections` array in `loadSections.js`.
*   **CSS:** Global styles are defined in `style.css`, while section-specific styles are in their respective CSS files in the `assets/css` directory.
*   **JavaScript:** Global JavaScript is included in `index.html`. Section-specific JavaScript is also included in `index.html`.
*   **Dependencies:** The project uses CDNs for all external libraries (Bootstrap, Font Awesome, Google Fonts, AOS, Swiper, GSAP), so there is no need to install any dependencies locally.
