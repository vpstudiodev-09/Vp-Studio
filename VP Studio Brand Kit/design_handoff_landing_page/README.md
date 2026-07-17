# Handoff: VP Studio — Landing Page

## Overview
VP Studio necesita un sitio/landing page implementado a partir de su brand kit. Este paquete documenta la identidad de marca (logo, tipografía, color) para que el desarrollo de la página siga ese sistema visual.

## About the Design Files
Los archivos incluidos (`VP Studio Brand Kit.html` y los assets de logo) son **referencias de diseño creadas en HTML** — muestran la identidad visual y el sistema de marca, no código de producción para copiar directamente. La tarea es **recrear esta identidad en el framework del proyecto de destino** (React, Vue, HTML/CSS estático, etc.) usando los patrones ya establecidos en ese codebase — o, si no existe codebase aún, elegir el framework más adecuado (recomendado: Next.js/React o HTML+CSS estático para una landing simple) e implementar ahí una landing page nueva.

## Fidelity
**Alta fidelidad (hifi)** en cuanto al sistema de marca: colores, tipografía y logo son finales y deben usarse exactamente como se especifica. La landing page en sí (layout, secciones, copy) **no ha sido diseñada todavía** — este paquete es la base de marca sobre la cual Claude Code debe diseñar e implementar la página desde cero, aplicando la estética Apple (minimalista, mucho whitespace, tipografía protagonista, un solo acento de color) descrita abajo.

## Sistema de Marca

### Logo
- Wordmark "VP STUDIO" + tagline "CONSULTORÍA Y ARQUITECTURA DIGITAL", con monograma "VP" como ícono/favicon.
- Dos variantes: blanco sobre negro (`assets/logo-white-on-black.png`) y negro sobre blanco (`assets/logo-black-on-white.png`).
- Usar la versión blanca sobre fondos oscuros y la negra sobre fondos claros.
- Espacio de respeto mínimo: equivalente a la altura de la "V" del wordmark, en los cuatro lados.
- Tamaños de referencia: 192px (logo grande / header), 128px (navegación), 64px (tabs/menús), 32px (favicons/botones), 16px (favicon mínimo).

### Tipografía
- Familia única: **SF Pro** (stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif`) — estética Apple, neutral, precisión suiza.
- Escala tipográfica:
  | Uso | Tamaño | Peso |
  |---|---|---|
  | Display / H1 | 56px | Semibold (600) |
  | H2 | 40px | Semibold (600) |
  | H3 | 28px | Medium (500) |
  | Body / lead | 19px | Regular (400) |
  | Caption / small | 15px | Regular (400) |
- `letter-spacing: -0.01em` a `-0.02em` en títulos.

### Color
| Nombre | Hex | Uso |
|---|---|---|
| Blanco | `#FFFFFF` | Fondo principal |
| Gris claro | `#F5F5F7` | Fondos secundarios / secciones alternas |
| Gris | `#86868B` | Texto secundario, labels |
| Negro | `#1D1D1F` | Texto principal |
| Acento | `#0071E3` | Único color de acción — botones, links, foco. Usar con moderación |
| Línea | `#E8E8ED` | Bordes, divisores |

Regla de marca: el color nunca decora, solo guía la acción. Máximo un color de acento en toda la interfaz.

### Dirección visual general
- Estética inspirada en Apple: fondos claros, mucho whitespace, jerarquía tipográfica fuerte en vez de color/decoración.
- Bordes redondeados suaves (16–18px) en cards e imágenes.
- Sin gradientes ni sombras marcadas; bordes de 1px en `#E8E8ED` para separar secciones.
- Contenido centrado, ancho máximo de contenedor ~980px, mucho padding vertical entre secciones (120–160px).

## Assets
- `assets/logo-white-on-black.png` — lockup completo (wordmark + tagline), blanco sobre negro.
- `assets/logo-black-on-white.png` — lockup completo, negro sobre blanco.
- `assets/mark-white-on-black.png` — monograma "VP" en tarjeta negra (para favicon/ícono).
- `assets/mark-black-on-white.png` — monograma "VP" en tarjeta blanca.

## Files
- `VP Studio Brand Kit.html` — página de referencia con el sistema completo (tipografía, color, logo) tal como se ve hoy en el proyecto de diseño.
