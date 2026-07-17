# VP Studio — Landing Page

Sitio web de **VP Studio** — Consultoría y Arquitectura Digital.
Landing estática con estética minimalista tipo Apple, animaciones fluidas y smooth scroll.

## Stack

- **HTML / CSS / JavaScript** puro (sin build, sin frameworks)
- **[GSAP](https://gsap.com/)** + **ScrollTrigger** — animaciones y efectos al scrollear
- **[Lenis](https://lenis.darkroom.engineering/)** — smooth scroll con inercia
- Deploy en **[Vercel](https://vercel.com/)** (redeploy automático en cada push a `main`)

## Estructura

```
VP/
├── index.html          # Página principal
├── css/styles.css      # Estilos y sistema de marca (variables CSS)
├── js/main.js          # Animaciones e interacciones
├── assets/             # Logos e imágenes de marca
└── VP Studio Brand Kit/ # Documentación de marca (referencia)
```

## Cómo trabajar en el proyecto

No hace falta instalar nada ni compilar. Para ver el sitio localmente, abrí `index.html`
en el navegador, o levantá un servidor simple para que las rutas funcionen bien:

```bash
# con Python
python -m http.server 8000
# luego abrí http://localhost:8000
```

## Flujo de trabajo con Git (importante para trabajar de a dos)

Antes de empezar a trabajar y antes de subir cambios, **traé siempre lo último** para
no chocarte con los cambios del otro:

```bash
git pull          # traer lo último del repo
# ...hacés tus cambios...
git add -A
git commit -m "descripción del cambio"
git push          # subir tus cambios
```

Cada push a `main` dispara un redeploy automático en Vercel.

## Setup inicial (solo la primera vez, para un colaborador nuevo)

```bash
git clone https://github.com/vpstudiodev-09/Vp-Studio.git
cd Vp-Studio

# Configurá tu identidad de git (con tu nombre y email)
git config user.name "Tu Nombre"
git config user.email "tu-email@ejemplo.com"
```

---

© VP Studio — Consultoría y Arquitectura Digital
