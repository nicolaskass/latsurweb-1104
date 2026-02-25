/* ═══════════════════════════════════════════════════════════════════
   Latitud Sur — main.js
   Loads sections dynamically, then overlays CMS content from the
   admin API (https://admin.latitud-sur.com.ar). Falls back
   gracefully to static HTML defaults if the API is unreachable.
   ═══════════════════════════════════════════════════════════════════ */

const ADMIN_API = 'https://admin.latitud-sur.com.ar/api/public/content';
const SECTIONS  = ['hero', 'servicios', 'nosotros', 'trabajos', 'contacto'];

/* ── Fetch CMS content (5-second timeout) ────────────────────────── */
async function fetchCmsContent() {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(ADMIN_API, { signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

/* ── Load all section HTML files ─────────────────────────────────── */
function loadAllSections() {
    return new Promise((resolve) => {
        let loaded = 0;
        SECTIONS.forEach(name => {
            fetch(`sections/${name}.html`)
                .then(r => r.text())
                .then(html => {
                    document.getElementById(name).innerHTML = html;
                    if (++loaded === SECTIONS.length) resolve();
                })
                .catch(err => {
                    console.error(`Error cargando sección ${name}:`, err);
                    if (++loaded === SECTIONS.length) resolve();
                });
        });
    });
}

/* ── CMS injectors ───────────────────────────────────────────────── */

function injectHero(hero) {
    if (!hero) return;
    const title    = document.getElementById('hero-title');
    const subtitle = document.getElementById('hero-subtitle');
    const cta      = document.getElementById('hero-cta');
    if (title    && hero.title)    title.textContent    = hero.title;
    if (subtitle && hero.subtitle) subtitle.textContent = hero.subtitle;
    if (cta      && hero.cta)      cta.textContent      = hero.cta;

    if (hero.slides && hero.slides.length) {
        const slideshow = document.getElementById('hero-slideshow');
        if (slideshow) {
            slideshow.innerHTML = hero.slides.map((s, i) =>
                `<div class="hero-slide${i === 0 ? ' active' : ''}" style="background-image:url('${s.image}')"></div>`
            ).join('');
        }
    }
}

function injectServicios(servicios) {
    const grid = document.getElementById('servicios-grid');
    if (!grid || !servicios || !servicios.length) return;
    grid.innerHTML = servicios.map(s => `
        <div class="servicio-card-expandible rounded-2xl p-8 text-center cursor-pointer">
            <div class="card-top">
                <div class="servicio-icon-wrap mb-4"><i class="fa-solid ${s.icon || 'fa-tools'} text-3xl"></i></div>
                <h5 class="text-xl font-bold mb-3">${s.title}</h5>
                <button class="toggle-chevron text-2xl transition-transform duration-300">
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
            </div>
            <div class="servicio-descripcion overflow-hidden transition-all duration-500 ease-in-out max-h-0 opacity-0">
                <p class="mt-4 text-gray-600 leading-relaxed">${s.description}</p>
                <a href="https://wa.me/5492215573180" target="_blank"
                   class="wa-btn inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors">
                    <i class="fab fa-whatsapp text-lg"></i> Consultar por WhatsApp
                </a>
            </div>
        </div>`).join('');
}

function injectNosotros(nosotros) {
    if (!nosotros) return;
    const intro = document.getElementById('nosotros-intro');
    const quote = document.getElementById('nosotros-quote');
    if (intro && nosotros.intro) intro.innerHTML = nosotros.intro;
    if (quote && nosotros.quote) quote.textContent = nosotros.quote;

    if (nosotros.team && nosotros.team.length) {
        const teamEl = document.getElementById('nosotros-team');
        if (teamEl) {
            teamEl.innerHTML = nosotros.team.map(m => `
                <div class="team-card rounded-2xl overflow-hidden w-full md:w-72 lg:w-80">
                    <div class="relative">
                        <img src="${m.photo}" class="w-full h-72 object-cover object-top" alt="${m.name}">
                        <div class="team-card-overlay absolute inset-0"></div>
                    </div>
                    <div class="p-6">
                        <p class="text-xs font-semibold text-accent tracking-widest uppercase mb-1">${m.role || ''}</p>
                        <h5 class="text-xl font-bold text-white mb-3">${m.name}</h5>
                        <p class="text-gray-400 text-sm leading-relaxed">${m.bio}</p>
                    </div>
                </div>`).join('');
        }
    }
}

function injectTrabajos(trabajos) {
    const wrapper = document.getElementById('trabajos-wrapper');
    if (!wrapper || !trabajos || !trabajos.length) return;
    wrapper.innerHTML = trabajos.map(t => `
        <div class="swiper-slide h-auto">
            <div class="trabajo-card rounded-2xl overflow-hidden h-full flex flex-col">
                <div class="relative overflow-hidden">
                    <img src="${t.image}" class="trabajo-img w-full h-52 object-cover" alt="${t.title}">
                    <div class="trabajo-img-overlay absolute inset-0"></div>
                </div>
                <div class="p-6 flex-grow">
                    <h5 class="text-lg font-bold mb-2">${t.title}</h5>
                    <p class="text-gray-500 text-sm leading-relaxed">${t.description}</p>
                </div>
            </div>
        </div>`).join('');
}

function injectContacto(contacto) {
    if (!contacto) return;

    const phoneEl     = document.getElementById('contacto-phone');
    const phoneLink   = document.getElementById('contacto-phone-link');
    const emailEl     = document.getElementById('contacto-email');
    const emailLink   = document.getElementById('contacto-email-link');
    const locationEl  = document.getElementById('contacto-location');
    const waBtn       = document.getElementById('contacto-wa-btn');
    const waFloat     = document.getElementById('wa-float');

    if (phoneEl   && contacto.phone)    phoneEl.textContent   = contacto.phone;
    if (phoneLink && contacto.phone_link) phoneLink.href      = `tel:${contacto.phone_link}`;
    if (emailEl   && contacto.email)    emailEl.textContent   = contacto.email;
    if (emailLink && contacto.email)    emailLink.href        = `mailto:${contacto.email}`;
    if (locationEl && contacto.location) locationEl.textContent = contacto.location;

    const waHref = contacto.whatsapp ? `https://wa.me/${contacto.whatsapp}` : null;
    if (waBtn && waHref)   waBtn.href   = waHref;
    if (waFloat && waHref) waFloat.href = waHref;

    if (contacto.badges && contacto.badges.length) {
        const badgesEl = document.getElementById('contacto-badges');
        if (badgesEl) {
            badgesEl.innerHTML = contacto.badges.map(b => `
                <div class="badge-card text-center p-6 rounded-2xl">
                    <i class="fas ${b.icon} text-3xl text-accent mb-3"></i>
                    <h4 class="font-bold text-white mb-1">${b.title}</h4>
                    <p class="text-gray-400 text-sm">${b.text}</p>
                </div>`).join('');
        }
    }
}

function injectSite(site) {
    if (!site) return;
    const f = site.footer || {};

    const copyright  = document.getElementById('footer-copyright');
    const footerWa   = document.getElementById('footer-whatsapp');
    const footerEmail= document.getElementById('footer-email');
    const footerFb   = document.getElementById('footer-facebook');
    const footerIg   = document.getElementById('footer-instagram');

    if (copyright && f.copyright) copyright.textContent = `© ${f.copyright}`;
    if (footerEmail && f.email)   footerEmail.href = `mailto:${f.email}`;
    if (footerWa && f.whatsapp)   footerWa.href   = `https://wa.me/${f.whatsapp}`;
    if (footerFb && f.facebook)   footerFb.href   = f.facebook;
    if (footerIg && f.instagram)  footerIg.href   = f.instagram;

    // Stats strip
    if (site.stats && site.stats.length) {
        const grid = document.getElementById('stats-grid');
        if (grid) {
            grid.innerHTML = site.stats.map(s => `
                <div class="stat-item">
                    <span class="stat-value">${s.value}</span>
                    <span class="stat-label">${s.label}</span>
                </div>`).join('');
        }
    }
}

/* ── Init components ─────────────────────────────────────────────── */
function initComponents() {
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 900, once: true, offset: 60 });
    }
    if (typeof initToggleServicios !== 'undefined') initToggleServicios();
    if (typeof Swiper !== 'undefined' && typeof SwiperInit !== 'undefined') new SwiperInit();
    if (typeof initServiceSelector !== 'undefined') initServiceSelector();
    if (typeof initHeroSlideshow !== 'undefined') initHeroSlideshow();

    // Dispatch event so index.html can start observing sections
    document.dispatchEvent(new CustomEvent('sectionsLoaded'));
}

/* ── Boot ────────────────────────────────────────────────────────── */
async function boot() {
    // Fetch CMS content and load sections in parallel
    const [cms] = await Promise.all([
        fetchCmsContent(),
        loadAllSections()
    ]);

    // Overlay CMS content on top of static HTML defaults
    if (cms) {
        injectHero(cms.hero);
        injectServicios(cms.servicios);
        injectNosotros(cms.nosotros);
        injectTrabajos(cms.trabajos);
        injectContacto(cms.contacto);
        injectSite(cms.site);
    }

    initComponents();
}

boot();
