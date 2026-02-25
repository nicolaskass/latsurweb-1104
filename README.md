# Latitud Sur — Sitio Web y Panel de Administración

Sitio profesional de agrimensura y topografía con CMS integrado y despliegue en Docker + Traefik.

---

## Arquitectura

```
Internet
  ├─► latitud-sur.com.ar         → Nginx (sitio estático)
  └─► admin.latitud-sur.com.ar   → Node.js/Express (admin panel + API)

Volumen compartido (latsurweb-data):
  ├── content.json        ← fuente de verdad del contenido
  └── uploads/
        ├── hero/         ← imágenes del slideshow
        ├── team/         ← fotos del equipo
        └── trabajos/     ← fotos de proyectos
```

El sitio principal carga el contenido desde `https://admin.latitud-sur.com.ar/api/public/content` al iniciar.
Si la API no está disponible, usa el HTML estático como fallback automático.

---

## Despliegue en VPS

### Pre-requisitos

- Docker + Docker Compose instalados
- Red externa `web` creada: `docker network create web`
- Traefik corriendo en el VPS con certresolver `letsencrypt`
- DNS configurado:
  - `latitud-sur.com.ar` → IP del VPS
  - `admin.latitud-sur.com.ar` → IP del VPS
  - `www.latitud-sur.com.ar` → IP del VPS

### Configurar credenciales

```bash
cp .env.example .env
```

Editar `.env`:

```env
# Generar con: openssl rand -hex 64
JWT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Desde Google Cloud Console → APIs & Services → Credentials
# Authorized JavaScript origins: https://admin.latitud-sur.com.ar
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com

# Emails habilitados para acceder al panel (separados por coma)
ALLOWED_EMAILS=tu@gmail.com
```

### Desplegar

```bash
git pull
docker compose up -d --build
```

### Actualizar

```bash
git pull
docker compose up -d --build --no-deps latsurweb         # solo el sitio
docker compose up -d --build --no-deps latsurweb-admin   # solo el admin
```

---

## Panel de administración

Acceder a `https://admin.latitud-sur.com.ar` e iniciar sesión con Google.

### Secciones editables

| Sección | Contenido |
|---|---|
| **Hero** | Título, subtítulo, texto del botón CTA, imágenes del slideshow |
| **Servicios** | Icono, título y descripción de cada tarjeta |
| **Nosotros** | Texto introductorio, frase final, miembros del equipo (nombre, rol, foto, bio) |
| **Trabajos** | Proyectos del carrusel (imagen, título, descripción) |
| **Contacto** | Teléfono, email, WhatsApp, ubicación, badges de credenciales |
| **Configuración** | Footer, redes sociales, barra de estadísticas |

### Subida de imágenes

El panel permite subir imágenes directamente (máx. 5 MB, JPG/PNG/WEBP).
Las imágenes se guardan en el volumen compartido y quedan disponibles en ambos contenedores.

---

## Desarrollo local

### Sitio principal

```bash
npm install
npm run watch    # compilar Tailwind en modo watch
npm run start    # servidor local en http://localhost:3000
```

### Admin backend

```bash
cd admin-backend
npm install
# Crear admin-backend/.env con JWT_SECRET, GOOGLE_CLIENT_ID y ALLOWED_EMAILS
node server.js   # corre en http://localhost:3000
```

> **Nota:** En desarrollo, el sitio no podrá conectarse a la API del admin (distinto origen).
> El contenido por defecto del HTML estático se usará como fallback automáticamente.

---

## Estructura de archivos

```
latsurweb-1104/
├── Dockerfile                  ← Nginx para el sitio estático
├── nginx.conf                  ← Configuración de Nginx
├── docker-compose.yml          ← Orquestación (sitio + admin)
├── .env.example                ← Template de variables de entorno
├── index.html                  ← Página principal
├── tailwind.config.js
│
├── sections/                   ← Secciones HTML (fallback estático)
│   ├── hero.html
│   ├── servicios.html
│   ├── nosotros.html
│   ├── trabajos.html
│   └── contacto.html
│
├── assets/
│   ├── css/
│   │   ├── input.css           ← Fuente Tailwind (editar aquí)
│   │   └── style.css           ← CSS compilado (no editar a mano)
│   ├── js/
│   │   ├── main.js             ← Carga secciones + inyecta CMS
│   │   ├── hero.js             ← Slideshow del hero
│   │   ├── toggleServicios.js  ← Cards expandibles
│   │   ├── swiper-init.js      ← Carrusel de trabajos
│   │   └── contacto.js         ← Selector de servicios en contacto
│   └── images/
│
└── admin-backend/              ← Panel de administración (Node.js)
    ├── Dockerfile
    ├── server.js
    ├── middleware/auth.js
    ├── routes/
    │   ├── auth.js             ← Google OAuth + JWT
    │   ├── content.js          ← CRUD de todo el contenido
    │   └── upload.js           ← Subida de imágenes
    ├── data/
    │   └── content.json        ← Seed con contenido inicial
    └── public/                 ← SPA del admin
        ├── index.html
        ├── css/admin.css
        └── js/admin.js
```

---

## Stack tecnológico

**Sitio:** HTML5 · Tailwind CSS · Vanilla JS · GSAP · AOS · Swiper
**Admin:** Node.js · Express · Google OAuth 2.0 · JWT · Multer
**Infra:** Docker · Nginx · Traefik · Let's Encrypt

---

## Gestión de secretos

Nunca commitear el archivo `.env`. Está en `.gitignore`.

Para regenerar el JWT_SECRET:
```bash
openssl rand -hex 64
```

---

*Latitud Sur — Agrimensura y Topografía · La Plata, Buenos Aires*
