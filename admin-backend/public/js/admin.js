/* ═══════════════════════════════════════════════════════════════════
   Latitud Sur Admin Panel — admin.js
   ═══════════════════════════════════════════════════════════════════ */

const API = '';         // Same origin
let TOKEN = localStorage.getItem('ls_admin_token') || null;

/* ── Utility ──────────────────────────────────────────────────────── */
function toast(msg, type = 'success') {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}" style="color:${type === 'success' ? 'var(--success)' : 'var(--danger)'}"></i> ${msg}`;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3500);
}

async function api(method, path, body) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` }
    };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(`${API}${path}`, opts);
    if (r.status === 401) { logout(); return null; }
    return r.json();
}

function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }

/* ── Auth ─────────────────────────────────────────────────────────── */
async function initAuth() {
    const cfgRes = await fetch('/api/auth/config').catch(() => null);
    if (!cfgRes || !cfgRes.ok) {
        document.getElementById('login-error').textContent = 'Error de configuración del servidor.';
        document.getElementById('login-error').style.display = 'block';
        return;
    }
    const { clientId } = await cfgRes.json();

    google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleLogin,
        auto_select: false
    });
    google.accounts.id.renderButton(document.getElementById('google-btn'), {
        theme: 'filled_black', size: 'large', width: 300, text: 'signin_with'
    });
}

async function handleGoogleLogin(response) {
    const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
    });
    const data = await res.json();
    if (!res.ok) {
        const el = document.getElementById('login-error');
        el.textContent = data.error || 'Error al iniciar sesión';
        el.style.display = 'block';
        return;
    }
    TOKEN = data.token;
    localStorage.setItem('ls_admin_token', TOKEN);
    showApp(data);
}

function logout() {
    TOKEN = null;
    localStorage.removeItem('ls_admin_token');
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
}

async function checkExistingSession() {
    if (!TOKEN) return false;
    const res = await api('GET', '/api/auth/verify');
    if (!res || !res.valid) { TOKEN = null; localStorage.removeItem('ls_admin_token'); return false; }
    return res.user;
}

function showApp(user) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('user-name').textContent = user.name || user.email;
    document.getElementById('user-email').textContent = user.email || '';
    const avatar = document.getElementById('user-avatar');
    if (user.picture) avatar.src = user.picture;
    loadAllSections();
}

/* ── Navigation ───────────────────────────────────────────────────── */
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
        item.classList.add('active');
        document.getElementById(`panel-${item.dataset.section}`).classList.add('active');
    });
});

/* ── Image upload (with previewUrl fix) ───────────────────────────── */
async function uploadImage(input, folder, urlFieldId, previewId) {
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`/api/upload/${folder}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${TOKEN}` },
        body: formData
    });
    const data = await res.json();

    if (!res.ok) { toast(data.error || 'Error al subir imagen', 'error'); return; }

    // Populate URL field with the relative path (stored in content.json)
    document.getElementById(urlFieldId).value = data.url;

    // Show preview using previewUrl (absolute, same domain as admin backend)
    if (previewId) {
        const img = document.getElementById(previewId);
        img.src = data.previewUrl || data.url;
    }
    toast('Imagen subida correctamente');
}

// Update preview when URL is typed manually
function wireUrlPreview(urlFieldId, previewId) {
    const input = document.getElementById(urlFieldId);
    const img = document.getElementById(previewId);
    if (!input || !img) return;
    input.addEventListener('input', () => { if (input.value) img.src = input.value; });
}

/* ── Load all sections ────────────────────────────────────────────── */
async function loadAllSections() {
    await Promise.all([loadHero(), loadServicios(), loadNosotros(), loadTrabajos(), loadContacto(), loadConfig()]);
}

/* ══ HERO ═══════════════════════════════════════════════════════════ */
let heroData = {};

async function loadHero() {
    heroData = await api('GET', '/api/content/hero') || {};
    document.getElementById('hero-title').value = heroData.title || '';
    document.getElementById('hero-subtitle').value = heroData.subtitle || '';
    document.getElementById('hero-cta').value = heroData.cta || '';
    renderSlides(heroData.slides || []);
    wireUrlPreview('slide-image', 'slide-img-preview');
}

function renderSlides(slides) {
    const list = document.getElementById('slides-list');
    list.innerHTML = slides.length === 0
        ? '<p style="color:var(--text-muted);font-size:.85rem">Sin slides. Agregá uno.</p>'
        : slides.map(s => `
            <div class="item-row">
                <img class="item-row-thumb" src="${s.image}" alt="${s.alt}" onerror="this.style.display='none'" />
                <div class="item-row-info">
                    <div class="title">${s.alt || 'Sin descripción'}</div>
                    <div class="sub">${s.image}</div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary btn-sm btn-icon" onclick="openSlideModal(${s.id})"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-danger btn-sm btn-icon" onclick="deleteSlide(${s.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>`).join('');
}

async function saveHeroText() {
    const data = {
        title: document.getElementById('hero-title').value,
        subtitle: document.getElementById('hero-subtitle').value,
        cta: document.getElementById('hero-cta').value
    };
    const res = await api('PUT', '/api/content/hero', data);
    if (res) { toast('Texto del hero guardado'); heroData = { ...heroData, ...res }; }
    else toast('Error al guardar', 'error');
}

function openSlideModal(id) {
    document.getElementById('slide-modal-title').textContent = id ? 'Editar slide' : 'Nuevo slide';
    document.getElementById('slide-id').value = id || '';
    const slide = id ? (heroData.slides || []).find(s => s.id === id) : null;
    document.getElementById('slide-image').value = slide?.image || '';
    document.getElementById('slide-alt').value = slide?.alt || '';
    const preview = document.getElementById('slide-img-preview');
    preview.src = slide?.image || '';
    openModal('modal-slide');
}

async function saveSlide() {
    const id = document.getElementById('slide-id').value;
    const body = {
        image: document.getElementById('slide-image').value.trim(),
        alt: document.getElementById('slide-alt').value.trim()
    };
    if (!body.image) { toast('La imagen es obligatoria', 'error'); return; }
    const endpoint = id ? `/api/content/hero/slides/${id}` : '/api/content/hero/slides';
    const method = id ? 'PUT' : 'POST';
    const res = await api(method, endpoint, body);
    if (res) {
        toast(id ? 'Slide actualizado' : 'Slide agregado');
        closeModal('modal-slide');
        await loadHero();
    } else toast('Error al guardar', 'error');
}

async function deleteSlide(id) {
    if (!confirm('¿Eliminar este slide?')) return;
    const res = await api('DELETE', `/api/content/hero/slides/${id}`);
    if (res?.success) { toast('Slide eliminado'); await loadHero(); }
    else toast('Error al eliminar', 'error');
}

/* ══ SERVICIOS ══════════════════════════════════════════════════════ */
let serviciosData = [];

async function loadServicios() {
    serviciosData = await api('GET', '/api/content/servicios') || [];
    renderServicios();
}

function renderServicios() {
    const list = document.getElementById('servicios-list');
    list.innerHTML = serviciosData.length === 0
        ? '<p style="color:var(--text-muted);font-size:.85rem">Sin servicios.</p>'
        : serviciosData.map(s => `
            <div class="item-row">
                <div class="item-row-thumb no-img"><i class="fa-solid ${s.icon || 'fa-tools'}"></i></div>
                <div class="item-row-info">
                    <div class="title">${s.title}</div>
                    <div class="sub">${s.description?.substring(0,80)}…</div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary btn-sm btn-icon" onclick="openServicioModal(${s.id})"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-danger btn-sm btn-icon" onclick="deleteServicio(${s.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>`).join('');
}

function openServicioModal(id) {
    document.getElementById('servicio-modal-title').textContent = id ? 'Editar servicio' : 'Nuevo servicio';
    document.getElementById('servicio-id').value = id || '';
    const s = id ? serviciosData.find(x => x.id === id) : null;
    document.getElementById('servicio-icon').value = s?.icon || '';
    document.getElementById('servicio-title').value = s?.title || '';
    document.getElementById('servicio-desc').value = s?.description || '';
    updateIconPreview('servicio-icon', 'servicio-icon-preview');
    document.getElementById('servicio-icon').addEventListener('input', () =>
        updateIconPreview('servicio-icon', 'servicio-icon-preview'));
    openModal('modal-servicio');
}

function updateIconPreview(inputId, previewId) {
    const val = document.getElementById(inputId).value.trim();
    const el = document.getElementById(previewId);
    el.className = `fa-solid ${val || 'fa-circle-question'}`;
}

async function saveServicio() {
    const id = parseInt(document.getElementById('servicio-id').value) || null;
    const body = {
        icon: document.getElementById('servicio-icon').value.trim(),
        title: document.getElementById('servicio-title').value.trim(),
        description: document.getElementById('servicio-desc').value.trim()
    };
    if (!body.title) { toast('El título es obligatorio', 'error'); return; }
    const res = await api(id ? 'PUT' : 'POST', id ? `/api/content/servicios/${id}` : '/api/content/servicios', body);
    if (res && !res.error) { toast(id ? 'Servicio actualizado' : 'Servicio creado'); closeModal('modal-servicio'); await loadServicios(); }
    else toast('Error al guardar', 'error');
}

async function deleteServicio(id) {
    if (!confirm('¿Eliminar este servicio?')) return;
    const res = await api('DELETE', `/api/content/servicios/${id}`);
    if (res?.success) { toast('Servicio eliminado'); await loadServicios(); }
    else toast('Error al eliminar', 'error');
}

/* ══ NOSOTROS ═══════════════════════════════════════════════════════ */
let nosotrosData = {};

async function loadNosotros() {
    nosotrosData = await api('GET', '/api/content/nosotros') || {};
    document.getElementById('nos-intro').value = nosotrosData.intro || '';
    document.getElementById('nos-quote').value = nosotrosData.quote || '';
    renderTeam(nosotrosData.team || []);
    wireUrlPreview('team-photo', 'team-img-preview');
}

function renderTeam(team) {
    const list = document.getElementById('team-list');
    list.innerHTML = team.length === 0
        ? '<p style="color:var(--text-muted);font-size:.85rem">Sin miembros.</p>'
        : team.map(m => `
            <div class="item-row">
                <img class="item-row-thumb" src="${m.photo}" alt="${m.name}" style="border-radius:50%" onerror="this.style.display='none'" />
                <div class="item-row-info">
                    <div class="title">${m.name}</div>
                    <div class="sub">${m.role || ''}</div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary btn-sm btn-icon" onclick="openTeamModal(${m.id})"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-danger btn-sm btn-icon" onclick="deleteTeamMember(${m.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>`).join('');
}

async function saveNosotrosText() {
    const res = await api('PUT', '/api/content/nosotros', {
        intro: document.getElementById('nos-intro').value,
        quote: document.getElementById('nos-quote').value
    });
    if (res) { toast('Texto guardado'); nosotrosData = { ...nosotrosData, ...res }; }
    else toast('Error al guardar', 'error');
}

function openTeamModal(id) {
    document.getElementById('team-modal-title').textContent = id ? 'Editar miembro' : 'Nuevo miembro';
    document.getElementById('team-id').value = id || '';
    const m = id ? (nosotrosData.team || []).find(x => x.id === id) : null;
    document.getElementById('team-name').value = m?.name || '';
    document.getElementById('team-role').value = m?.role || '';
    document.getElementById('team-photo').value = m?.photo || '';
    document.getElementById('team-bio').value = m?.bio || '';
    document.getElementById('team-img-preview').src = m?.photo || '';
    openModal('modal-team');
}

async function saveTeamMember() {
    const id = parseInt(document.getElementById('team-id').value) || null;
    const body = {
        name: document.getElementById('team-name').value.trim(),
        role: document.getElementById('team-role').value.trim(),
        photo: document.getElementById('team-photo').value.trim(),
        bio: document.getElementById('team-bio').value.trim()
    };
    if (!body.name) { toast('El nombre es obligatorio', 'error'); return; }
    const res = await api(id ? 'PUT' : 'POST', id ? `/api/content/nosotros/team/${id}` : '/api/content/nosotros/team', body);
    if (res && !res.error) { toast(id ? 'Miembro actualizado' : 'Miembro agregado'); closeModal('modal-team'); await loadNosotros(); }
    else toast('Error al guardar', 'error');
}

async function deleteTeamMember(id) {
    if (!confirm('¿Eliminar este miembro?')) return;
    const res = await api('DELETE', `/api/content/nosotros/team/${id}`);
    if (res?.success) { toast('Miembro eliminado'); await loadNosotros(); }
    else toast('Error al eliminar', 'error');
}

/* ══ TRABAJOS ═══════════════════════════════════════════════════════ */
let trabajosData = [];

async function loadTrabajos() {
    trabajosData = await api('GET', '/api/content/trabajos') || [];
    renderTrabajos();
    wireUrlPreview('trabajo-image', 'trabajo-img-preview');
}

function renderTrabajos() {
    const list = document.getElementById('trabajos-list');
    list.innerHTML = trabajosData.length === 0
        ? '<p style="color:var(--text-muted);font-size:.85rem">Sin trabajos.</p>'
        : trabajosData.map(t => `
            <div class="item-row">
                <img class="item-row-thumb" src="${t.image}" alt="${t.title}" onerror="this.style.display='none'" />
                <div class="item-row-info">
                    <div class="title">${t.title}</div>
                    <div class="sub">${t.description?.substring(0,80)}…</div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary btn-sm btn-icon" onclick="openTrabajoModal(${t.id})"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-danger btn-sm btn-icon" onclick="deleteTrabajo(${t.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>`).join('');
}

function openTrabajoModal(id) {
    document.getElementById('trabajo-modal-title').textContent = id ? 'Editar trabajo' : 'Nuevo trabajo';
    document.getElementById('trabajo-id').value = id || '';
    const t = id ? trabajosData.find(x => x.id === id) : null;
    document.getElementById('trabajo-image').value = t?.image || '';
    document.getElementById('trabajo-title').value = t?.title || '';
    document.getElementById('trabajo-desc').value = t?.description || '';
    document.getElementById('trabajo-img-preview').src = t?.image || '';
    openModal('modal-trabajo');
}

async function saveTrabajo() {
    const id = parseInt(document.getElementById('trabajo-id').value) || null;
    const body = {
        image: document.getElementById('trabajo-image').value.trim(),
        title: document.getElementById('trabajo-title').value.trim(),
        description: document.getElementById('trabajo-desc').value.trim()
    };
    if (!body.title) { toast('El título es obligatorio', 'error'); return; }
    const res = await api(id ? 'PUT' : 'POST', id ? `/api/content/trabajos/${id}` : '/api/content/trabajos', body);
    if (res && !res.error) { toast(id ? 'Trabajo actualizado' : 'Trabajo agregado'); closeModal('modal-trabajo'); await loadTrabajos(); }
    else toast('Error al guardar', 'error');
}

async function deleteTrabajo(id) {
    if (!confirm('¿Eliminar este trabajo?')) return;
    const res = await api('DELETE', `/api/content/trabajos/${id}`);
    if (res?.success) { toast('Trabajo eliminado'); await loadTrabajos(); }
    else toast('Error al eliminar', 'error');
}

/* ══ CONTACTO ═══════════════════════════════════════════════════════ */
let contactoData = {};

async function loadContacto() {
    contactoData = await api('GET', '/api/content/contacto') || {};
    document.getElementById('ct-phone').value = contactoData.phone || '';
    document.getElementById('ct-whatsapp').value = contactoData.whatsapp || '';
    document.getElementById('ct-email').value = contactoData.email || '';
    document.getElementById('ct-location').value = contactoData.location || '';
    renderBadges(contactoData.badges || []);
}

function renderBadges(badges) {
    const list = document.getElementById('badges-list');
    list.innerHTML = badges.length === 0
        ? '<p style="color:var(--text-muted);font-size:.85rem">Sin badges.</p>'
        : badges.map(b => `
            <div class="item-row">
                <div class="item-row-thumb no-img"><i class="fas ${b.icon || 'fa-check'}"></i></div>
                <div class="item-row-info">
                    <div class="title">${b.title}</div>
                    <div class="sub">${b.text}</div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary btn-sm btn-icon" onclick="openBadgeModal(${b.id})"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-danger btn-sm btn-icon" onclick="deleteBadge(${b.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>`).join('');
}

async function saveContacto() {
    const res = await api('PUT', '/api/content/contacto', {
        phone: document.getElementById('ct-phone').value.trim(),
        whatsapp: document.getElementById('ct-whatsapp').value.trim(),
        email: document.getElementById('ct-email').value.trim(),
        location: document.getElementById('ct-location').value.trim()
    });
    if (res) { toast('Contacto guardado'); contactoData = { ...contactoData, ...res }; }
    else toast('Error al guardar', 'error');
}

function openBadgeModal(id) {
    document.getElementById('badge-modal-title').textContent = id ? 'Editar badge' : 'Nuevo badge';
    document.getElementById('badge-id').value = id || '';
    const b = id ? (contactoData.badges || []).find(x => x.id === id) : null;
    document.getElementById('badge-icon').value = b?.icon || '';
    document.getElementById('badge-title').value = b?.title || '';
    document.getElementById('badge-text').value = b?.text || '';
    document.getElementById('badge-icon').addEventListener('input', () =>
        updateIconPreview('badge-icon', 'badge-icon-preview'));
    openModal('modal-badge');
}

async function saveBadge() {
    const id = parseInt(document.getElementById('badge-id').value) || null;
    const body = {
        icon: document.getElementById('badge-icon').value.trim(),
        title: document.getElementById('badge-title').value.trim(),
        text: document.getElementById('badge-text').value.trim()
    };
    if (!body.title) { toast('El título es obligatorio', 'error'); return; }
    const res = await api(id ? 'PUT' : 'POST', id ? `/api/content/contacto/badges/${id}` : '/api/content/contacto/badges', body);
    if (res && !res.error) { toast(id ? 'Badge actualizado' : 'Badge agregado'); closeModal('modal-badge'); await loadContacto(); }
    else toast('Error al guardar', 'error');
}

async function deleteBadge(id) {
    if (!confirm('¿Eliminar este badge?')) return;
    const res = await api('DELETE', `/api/content/contacto/badges/${id}`);
    if (res?.success) { toast('Badge eliminado'); await loadContacto(); }
    else toast('Error al eliminar', 'error');
}

/* ══ CONFIG ══════════════════════════════════════════════════════════ */
let siteData = {};

async function loadConfig() {
    siteData = await api('GET', '/api/content/site') || {};
    const f = siteData.footer || {};
    document.getElementById('cfg-copyright').value = f.copyright || '';
    document.getElementById('cfg-email').value = f.email || '';
    document.getElementById('cfg-whatsapp').value = f.whatsapp || '';
    document.getElementById('cfg-facebook').value = f.facebook || '';
    document.getElementById('cfg-instagram').value = f.instagram || '';
    renderStats(siteData.stats || []);
}

function renderStats(stats) {
    const list = document.getElementById('stats-list');
    list.innerHTML = stats.length === 0
        ? '<p style="color:var(--text-muted);font-size:.85rem">Sin estadísticas.</p>'
        : stats.map(s => `
            <div class="item-row">
                <div class="item-row-info">
                    <div class="title" style="color:var(--accent)">${s.value}</div>
                    <div class="sub">${s.label}</div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary btn-sm btn-icon" onclick="openStatModal(${s.id})"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-danger btn-sm btn-icon" onclick="deleteStat(${s.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>`).join('');
}

async function saveConfig() {
    const res = await api('PUT', '/api/content/site', {
        footer: {
            copyright: document.getElementById('cfg-copyright').value.trim(),
            email: document.getElementById('cfg-email').value.trim(),
            whatsapp: document.getElementById('cfg-whatsapp').value.trim(),
            facebook: document.getElementById('cfg-facebook').value.trim(),
            instagram: document.getElementById('cfg-instagram').value.trim()
        }
    });
    if (res) { toast('Configuración guardada'); siteData = { ...siteData, ...res }; }
    else toast('Error al guardar', 'error');
}

function openStatModal(id) {
    document.getElementById('stat-modal-title').textContent = id ? 'Editar estadística' : 'Nueva estadística';
    document.getElementById('stat-id').value = id || '';
    const s = id ? (siteData.stats || []).find(x => x.id === id) : null;
    document.getElementById('stat-value').value = s?.value || '';
    document.getElementById('stat-label').value = s?.label || '';
    openModal('modal-stat');
}

async function saveStat() {
    const id = parseInt(document.getElementById('stat-id').value) || null;

    // Stats live inside site.stats — we manage them client-side and PUT the whole stats array
    const stats = [...(siteData.stats || [])];
    const body = {
        value: document.getElementById('stat-value').value.trim(),
        label: document.getElementById('stat-label').value.trim()
    };
    if (!body.value) { toast('El valor es obligatorio', 'error'); return; }

    if (id) {
        const idx = stats.findIndex(s => s.id === id);
        if (idx !== -1) stats[idx] = { ...stats[idx], ...body };
    } else {
        const maxId = stats.reduce((m, s) => Math.max(m, s.id || 0), 0);
        stats.push({ id: maxId + 1, ...body });
    }

    const res = await api('PUT', '/api/content/site', { stats });
    if (res) { toast(id ? 'Stat actualizada' : 'Stat agregada'); closeModal('modal-stat'); siteData = { ...siteData, ...res }; renderStats(res.stats || []); }
    else toast('Error al guardar', 'error');
}

async function deleteStat(id) {
    if (!confirm('¿Eliminar esta estadística?')) return;
    const stats = (siteData.stats || []).filter(s => s.id !== id);
    const res = await api('PUT', '/api/content/site', { stats });
    if (res) { toast('Stat eliminada'); siteData = { ...siteData, ...res }; renderStats(res.stats || []); }
    else toast('Error al eliminar', 'error');
}

/* ── Boot ─────────────────────────────────────────────────────────── */
async function boot() {
    const user = await checkExistingSession();
    if (user) {
        showApp(user);
    } else {
        // Load Google Sign-In after lib is ready
        const waitGoogle = setInterval(() => {
            if (typeof google !== 'undefined' && google.accounts) {
                clearInterval(waitGoogle);
                initAuth();
            }
        }, 100);
    }
}

boot();
