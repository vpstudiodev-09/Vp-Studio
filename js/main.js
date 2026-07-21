/* ==========================================================================
   VP Studio — Animaciones (GSAP + ScrollTrigger)
   ========================================================================== */

// Si GSAP no llega a cargar (CDN caído), la página queda estática pero visible:
// la clase .js es la que oculta los elementos a animar.
const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

if (hasGsap) {
  document.documentElement.classList.add("js");
  gsap.registerPlugin(ScrollTrigger);
}

const mm = hasGsap ? gsap.matchMedia() : null;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lenis = null;

/* --------------------------------------------------------------------------
   Smooth scroll (Lenis) sincronizado con ScrollTrigger
   Da la inercia fluida tipo Apple/Awwwards. Si Lenis no cargó o el usuario
   pidió menos movimiento, se usa el scroll nativo y todo lo demás funciona igual.
   -------------------------------------------------------------------------- */
function smoothScroll() {
  if (reduceMotion || typeof window.Lenis === "undefined") return;

  lenis = new Lenis({
    // lerp en vez de duration: responde al instante a la rueda y
    // "aterriza" suave, sin la sensación flotante de arrastre.
    lerp: 0.14,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
  });

  // Cada frame de scroll notifica a ScrollTrigger para que todo quede sincronizado
  lenis.on("scroll", ScrollTrigger.update);

  // Usar el mismo reloj de GSAP para mover Lenis (evita dos rAF peleándose)
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* --------------------------------------------------------------------------
   Anchors: scroll suave con Lenis hacia cada sección
   -------------------------------------------------------------------------- */
function anchorLinks() {
  const navH = 56;
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id === "#" || id === "#top") {
        e.preventDefault();
        if (lenis) lenis.scrollTo(0, { duration: 1.0 });
        else window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        return;
      }
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -navH, duration: 1.0 });
      } else {
        const y = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Loader + entrada del hero
   -------------------------------------------------------------------------- */
function intro() {
  const loader = document.getElementById("loader");

  // El loader completo solo en la primera visita de la sesión;
  // después, directo al contenido (estilo Apple: cero espera).
  let seen = false;
  try {
    seen = sessionStorage.getItem("vp-intro") === "1";
    sessionStorage.setItem("vp-intro", "1");
  } catch (e) { /* modo incógnito estricto: sin sessionStorage */ }

  if (reduceMotion) {
    loader.remove();
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  if (seen) {
    loader.remove();
  } else {
    // Marca con zoom breve + cortina. Rápido: el loader no debe hacer esperar.
    tl.from(".vp-mark--loader", { scale: 0.9, autoAlpha: 0, duration: 0.45 })
      .to(".loader__tag", { opacity: 1, duration: 0.3 }, "-=0.25")
      .to(loader, {
        yPercent: -100,
        duration: 0.65,
        ease: "power4.inOut",
        delay: 0.15,
        onComplete: () => loader.remove(),
      });
  }

  // Hero: líneas del título suben desde abajo
  tl.fromTo(
    ".hero__title .line",
    { yPercent: 110, visibility: "visible" },
    { yPercent: 0, duration: 0.9, stagger: 0.09, ease: "power4.out" },
    seen ? 0 : "-=0.4"
  )
    .to("[data-hero-fade]", { opacity: 1, duration: 0.6, stagger: 0.08 }, "-=0.65");
}

/* --------------------------------------------------------------------------
   Palabra rotativa del hero (cambia texto y color de acento)
   -------------------------------------------------------------------------- */
function heroSwap() {
  const el = document.getElementById("heroSwap");
  const words = [
    { text: "sitios web", color: "#0071E3" },
    { text: "sistemas", color: "#BF5AF2" },
    { text: "automatizaciones", color: "#FF9F0A" },
    { text: "tiendas online", color: "#30D158" },
  ];
  let i = 0;

  if (reduceMotion) return;

  setInterval(() => {
    i = (i + 1) % words.length;
    const next = words[i];

    gsap
      .timeline()
      .to(el, { yPercent: -110, duration: 0.45, ease: "power3.in" })
      .add(() => {
        el.textContent = next.text;
        el.style.color = next.color;
      })
      .fromTo(
        el,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.55, ease: "power3.out" }
      );
  }, 2800);
}

/* --------------------------------------------------------------------------
   Nav: borde al scrollear + esconder al bajar / mostrar al subir
   -------------------------------------------------------------------------- */
function navBehavior() {
  const nav = document.getElementById("nav");

  ScrollTrigger.create({
    start: 60,
    onUpdate: (self) => {
      nav.classList.toggle("is-scrolled", self.scroll() > 60);
      if (reduceMotion) return;
      if (self.direction === 1 && self.scroll() > 300) {
        gsap.to(nav, { yPercent: -100, duration: 0.4, ease: "power2.out", overwrite: "auto" });
      } else {
        gsap.to(nav, { yPercent: 0, duration: 0.4, ease: "power2.out", overwrite: "auto" });
      }
    },
  });
}

/* --------------------------------------------------------------------------
   Marquee infinito
   -------------------------------------------------------------------------- */
function marquee() {
  const track = document.getElementById("marqueeTrack");
  const group = track.querySelector(".marquee__group");

  // Una sola lectura de layout (evita "layout thrashing"): calculamos cuántas
  // copias hacen falta y las agregamos todas juntas, sin re-medir en el loop.
  const groupW = group.offsetWidth;
  const needed = Math.max(2, Math.ceil((window.innerWidth + groupW) / groupW) + 1);
  const frag = document.createDocumentFragment();
  for (let i = track.children.length; i < needed; i++) {
    frag.appendChild(group.cloneNode(true));
  }
  track.appendChild(frag);

  if (reduceMotion) return;

  gsap.to(track, {
    x: () => -group.offsetWidth,
    duration: 22,
    ease: "none",
    repeat: -1,
  });
}

/* --------------------------------------------------------------------------
   Reveals al scrollear
   -------------------------------------------------------------------------- */
function reveals() {
  if (reduceMotion) {
    gsap.set("[data-reveal]", { opacity: 1, y: 0 });
    return;
  }

  ScrollTrigger.batch("[data-reveal]", {
    start: "top 92%",
    once: true,
    onEnter: (elements) => {
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        overwrite: true,
      });
    },
  });
}

/* --------------------------------------------------------------------------
   Proceso: sección oscura pineada con pasos que se activan al scrollear
   -------------------------------------------------------------------------- */
function process() {
  const steps = gsap.utils.toArray(".process__step");
  const bar = document.getElementById("processBar");

  steps[0].classList.add("is-active");

  if (reduceMotion) {
    steps.forEach((s) => s.classList.add("is-active"));
    gsap.set(bar, { scaleX: 1 });
    return;
  }

  mm.add("(min-width: 901px)", () => {
    const st = ScrollTrigger.create({
      trigger: "#processPin",
      start: "top top",
      end: "+=" + steps.length * 520,
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => {
        gsap.set(bar, { scaleX: self.progress });
        const idx = Math.min(
          steps.length - 1,
          Math.floor(self.progress * steps.length)
        );
        steps.forEach((s, i) => s.classList.toggle("is-active", i <= idx));
      },
    });
    return () => st.kill();
  });

  // Mobile: sin pin, cada paso se activa al entrar en viewport
  mm.add("(max-width: 900px)", () => {
    const triggers = steps.map((step) =>
      ScrollTrigger.create({
        trigger: step,
        start: "top 75%",
        onEnter: () => step.classList.add("is-active"),
      })
    );
    gsap.set(bar, { scaleX: 1 });
    return () => triggers.forEach((t) => t.kill());
  });
}

/* --------------------------------------------------------------------------
   Cards: seguimiento del mouse (glow) + tilt sutil
   -------------------------------------------------------------------------- */
function cardEffects() {
  if (reduceMotion || !window.matchMedia("(hover: hover)").matches) return;

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    const setRX = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power2.out" });
    const setRY = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power2.out" });

    gsap.set(card, { transformPerspective: 800 });

    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;

      // glow que sigue al cursor (variables CSS del ::before)
      card.style.setProperty("--mx", px * 100 + "%");
      card.style.setProperty("--my", py * 100 + "%");

      setRX((0.5 - py) * 6);
      setRY((px - 0.5) * 6);
    });

    card.addEventListener("mouseleave", () => {
      setRX(0);
      setRY(0);
    });
  });
}

/* --------------------------------------------------------------------------
   Botones magnéticos
   -------------------------------------------------------------------------- */
function magnetic() {
  if (reduceMotion || !window.matchMedia("(hover: hover)").matches) return;

  document.querySelectorAll("[data-magnetic]").forEach((btn) => {
    const setX = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
    const setY = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });

    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      setX((e.clientX - (r.left + r.width / 2)) * 0.3);
      setY((e.clientY - (r.top + r.height / 2)) * 0.3);
    });

    btn.addEventListener("mouseleave", () => {
      setX(0);
      setY(0);
    });
  });
}

/* --------------------------------------------------------------------------
   Cursor custom
   -------------------------------------------------------------------------- */
function cursor() {
  if (reduceMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const dot = document.getElementById("cursor");
  const setX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power2.out" });
  const setY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power2.out" });

  window.addEventListener("mousemove", (e) => {
    dot.classList.add("is-active");
    setX(e.clientX);
    setY(e.clientY);
  });

  document.querySelectorAll("[data-hover], a, button").forEach((el) => {
    el.addEventListener("mouseenter", () => dot.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => dot.classList.remove("is-hover"));
  });

  document.addEventListener("mouseleave", () => dot.classList.remove("is-active"));
}

/* --------------------------------------------------------------------------
   Parallax sutil de los orbes del hero
   -------------------------------------------------------------------------- */
function heroParallax() {
  if (reduceMotion) return;

  gsap.to(".hero__orb--a", {
    y: 120,
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
  });
  gsap.to(".hero__orb--b", {
    y: -100,
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
  });
}

/* --------------------------------------------------------------------------
   Menú mobile (hamburger)
   -------------------------------------------------------------------------- */
function mobileMenu() {
  const burger = document.getElementById("navBurger");
  const menu   = document.getElementById("mobileMenu");
  const overlay = document.getElementById("mobileOverlay");
  if (!burger || !menu || !overlay) return;

  function open() {
    burger.classList.add("is-open");
    menu.classList.add("is-open");
    overlay.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function close() {
    burger.classList.remove("is-open");
    menu.classList.remove("is-open");
    overlay.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  burger.addEventListener("click", () =>
    burger.classList.contains("is-open") ? close() : open()
  );
  overlay.addEventListener("click", close);
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
}

/* --------------------------------------------------------------------------
   Carruseles mobile: slide con GSAP, peek del siguiente card,
   auto-advance, swipe táctil, flechas y dots
   -------------------------------------------------------------------------- */
function initCarousels() {
  // interval = tiempo de lectura por card (el avance solo corre si el carrusel está a la vista)
  const CONFIGS = [
    { id: "cardsCarousel",      itemSel: ".card",      interval: 4500 },
    { id: "principlesCarousel", itemSel: ".principle", interval: 5200 },
  ];
  const isMobile = () => window.innerWidth <= 640;

  CONFIGS.forEach(({ id, itemSel, interval }) => {
    const track = document.getElementById(id);
    if (!track) return;
    const items = Array.from(track.querySelectorAll(itemSel));
    if (items.length < 2) return;

    // === Wrapper de viewport (overflow hidden) ===
    const viewport = document.createElement("div");
    viewport.className = "c-viewport";
    track.parentNode.insertBefore(viewport, track);
    viewport.appendChild(track);

    // === UI: flechas + dots ===
    const ui = document.createElement("div");
    ui.className = "c-ui";
    ui.innerHTML = `
      <button class="c-arrow c-arrow--prev" aria-label="Anterior">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.6"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="c-dots">
        ${items.map((_, i) =>
          `<button class="c-dot${i === 0 ? " is-active" : ""}" aria-label="Slide ${i + 1}"></button>`
        ).join("")}
      </div>
      <button class="c-arrow c-arrow--next" aria-label="Siguiente">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="1.6"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>`;
    viewport.parentNode.insertBefore(ui, viewport.nextSibling);

    const dots    = Array.from(ui.querySelectorAll(".c-dot"));
    const prevBtn = ui.querySelector(".c-arrow--prev");
    const nextBtn = ui.querySelector(".c-arrow--next");

    let current    = 0;
    let autoTimer  = null;
    let resumeTimer = null;
    let touchStartX = 0;
    let inView     = false;

    // Offset en px al que debe moverse el track para mostrar el slide idx
    function getOffset(idx) {
      const baseLeft = items[0].offsetLeft;
      return -(items[idx].offsetLeft - baseLeft);
    }

    function setActive(idx) {
      current = idx;
      dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));

      if (!hasGsap || reduceMotion) return;
      // Destacar card activa, atenuar las demás
      items.forEach((item, i) => {
        gsap.to(item, {
          opacity: i === idx ? 1 : 0.38,
          scale:   i === idx ? 1 : 0.96,
          duration: 0.45,
          ease: "power2.out",
        });
      });
    }

    function goTo(idx, animate = true) {
      setActive(idx);
      if (!isMobile()) return;

      const x = getOffset(idx);
      if (!hasGsap) {
        track.style.transform = `translateX(${x}px)`;
        return;
      }
      if (animate && !reduceMotion) {
        gsap.to(track, { x, duration: 0.62, ease: "power2.inOut" });
      } else {
        gsap.set(track, { x });
      }
    }

    const next = () => goTo((current + 1) % items.length);
    const prev = () => goTo((current - 1 + items.length) % items.length);

    function startAuto() {
      if (reduceMotion || !isMobile() || !inView) return;
      clearInterval(autoTimer);
      // setInterval espera un ciclo completo antes del 1er avance → tiempo de lectura en la card actual
      autoTimer = setInterval(next, interval);
    }
    const pauseAuto   = () => { clearInterval(autoTimer); autoTimer = null; };
    const resumeDelay = () => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(startAuto, 2800);
    };

    // Botones
    prevBtn.addEventListener("click", () => { pauseAuto(); prev(); resumeDelay(); });
    nextBtn.addEventListener("click", () => { pauseAuto(); next(); resumeDelay(); });
    dots.forEach((d, i) => d.addEventListener("click", () => { pauseAuto(); goTo(i); resumeDelay(); }));

    // Swipe táctil
    track.addEventListener("touchstart", (e) => {
      pauseAuto();
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener("touchend", (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 45) diff > 0 ? next() : prev();
      resumeDelay();
    }, { passive: true });

    // Reset al pasar a desktop
    const mq = window.matchMedia("(max-width: 640px)");
    mq.addEventListener("change", (e) => {
      if (e.matches) {
        // Double rAF para que el flex layout esté calculado
        requestAnimationFrame(() => requestAnimationFrame(() => {
          goTo(0, false);
          if (inView) startAuto();
        }));
      } else {
        pauseAuto();
        if (hasGsap) gsap.set(track, { x: 0, clearProps: "transform" });
        items.forEach(item => {
          if (hasGsap) gsap.set(item, { opacity: 1, scale: 1, clearProps: "opacity,scale" });
        });
      }
    });

    // Solo avanza cuando el carrusel está bien a la vista (no mientras scrolleás hacia él)
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            inView = true;
            if (!isMobile()) return;
            // Empezar siempre desde la primera card al llegar
            goTo(0, false);
            startAuto();
          } else {
            inView = false;
            pauseAuto();
            clearTimeout(resumeTimer);
          }
        },
        { threshold: 0.45, rootMargin: "0px 0px -8% 0px" }
      ).observe(viewport);
    }

    // Solo posicionar en slide 0; el auto-advance lo dispara el IntersectionObserver
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (isMobile()) goTo(0, false);
    }));
  });
}

/* --------------------------------------------------------------------------
   Init
   -------------------------------------------------------------------------- */
try { mobileMenu(); } catch (e) { console.warn("mobileMenu error:", e); }
try { initCarousels(); } catch (e) { console.warn("initCarousels error:", e); }

if (hasGsap) {
  // --- Arranque inmediato: solo lo esencial para el hero ---
  // (el scroll suave y la animación de entrada son la prioridad visual)
  smoothScroll();
  anchorLinks();
  cursor();      // solo agrega listeners, sin costo de render
  intro();       // animación de entrada del hero
  heroSwap();

  // --- Diferido: toda la maquinaria de scroll ---
  // Se arma DESPUÉS del primer pintado para no competir con la intro.
  // Como la intro dura ~2,5s, esto queda listo mucho antes de que el
  // usuario llegue a scrollear.
  const initScrollStuff = () => {
    navBehavior();
    marquee();
    reveals();
    process();
    cardEffects();
    magnetic();
    heroParallax();
    ScrollTrigger.refresh();
  };

  if (reduceMotion) {
    initScrollStuff();
  } else {
    const startDeferred = () => gsap.delayedCall(0.2, initScrollStuff);
    if (document.readyState === "complete") startDeferred();
    else window.addEventListener("load", startDeferred);
  }
}

/* --------------------------------------------------------------------------
   Formulario de contacto (envío AJAX a Formspree)
   -------------------------------------------------------------------------- */
(() => {
  const form = document.querySelector(".cta__form");
  if (!form) return;

  const status = form.querySelector("[data-form-status]");
  const submit = form.querySelector('button[type="submit"]');

  const setStatus = (msg, kind) => {
    if (!status) return;
    status.textContent = msg;
    status.classList.remove("is-ok", "is-error");
    if (kind) status.classList.add(kind);
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Si todavía no configuraste tu Form ID, avisá en vez de romper.
    if (form.action.includes("TU_FORM_ID")) {
      setStatus("El formulario todavía no está configurado. Falta el Form ID de Formspree.", "is-error");
      return;
    }

    setStatus("Enviando…", null);
    if (submit) submit.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        form.reset();
        setStatus("¡Gracias! Recibimos tu mensaje y te respondemos dentro de las 24 horas.", "is-ok");
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data?.errors?.map((x) => x.message).join(", ");
        setStatus(msg || "No pudimos enviar el mensaje. Probá de nuevo o escribinos por mail.", "is-error");
      }
    } catch {
      setStatus("Hubo un problema de conexión. Probá de nuevo o escribinos por mail.", "is-error");
    } finally {
      if (submit) submit.disabled = false;
    }
  });
})();

/* --------------------------------------------------------------------------
   CTA: el formulario aparece recién al tocar "Hablemos" (expand con GSAP)
   -------------------------------------------------------------------------- */
(() => {
  const toggle = document.querySelector("[data-cta-toggle]");
  const panel = document.querySelector("[data-cta-panel]");
  if (!toggle || !panel) return;

  const useGsap = typeof window.gsap !== "undefined" && !reduceMotion;
  const label = toggle.querySelector(".cta__toggle-label");
  const fields = panel.querySelectorAll(".form__field, .cta__submit");
  let open = false;
  let animating = false;

  const setLabel = (o) => { if (label) label.textContent = o ? "Cerrar" : "Hablemos"; };

  const focusFirst = () => {
    const first = panel.querySelector(".form__input");
    if (first) first.focus({ preventScroll: true });
  };

  const openPanel = () => {
    open = true;
    toggle.setAttribute("aria-expanded", "true");
    setLabel(true);

    if (!useGsap) {
      panel.style.height = "auto";
      panel.style.opacity = "1";
      focusFirst();
      return;
    }

    animating = true;
    gsap.set(fields, { opacity: 0, y: 18 });
    gsap.timeline({
      onComplete: () => {
        panel.style.height = "auto"; // permite crecer si cambia el contenido
        animating = false;
        focusFirst();
        if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
      },
    })
      .to(panel, { height: "auto", opacity: 1, duration: 0.6, ease: "power3.out" })
      .to(fields, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power2.out" }, "-=0.32");
  };

  const closePanel = () => {
    open = false;
    toggle.setAttribute("aria-expanded", "false");
    setLabel(false);

    if (!useGsap) {
      panel.style.height = "0";
      panel.style.opacity = "0";
      return;
    }

    animating = true;
    gsap.to(panel, {
      height: 0,
      opacity: 0,
      duration: 0.45,
      ease: "power3.inOut",
      onComplete: () => { animating = false; },
    });
  };

  toggle.addEventListener("click", () => {
    if (animating) return;
    open ? closePanel() : openPanel();
  });
})();
