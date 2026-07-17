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
    duration: 1.15,
    // easing exponencial: arranca rápido y "aterriza" muy suave
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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
        if (lenis) lenis.scrollTo(0, { duration: 1.3 });
        else window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        return;
      }
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -navH, duration: 1.3 });
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

  if (reduceMotion) {
    loader.remove();
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  // La marca aparece con un leve zoom y baja la tagline
  tl.from(".vp-mark--loader", { scale: 0.86, autoAlpha: 0, duration: 0.8, ease: "power3.out" })
    .to(".loader__tag", { opacity: 1, duration: 0.5 }, "-=0.35")
    .to(loader, {
      yPercent: -100,
      duration: 0.9,
      ease: "power4.inOut",
      delay: 0.35,
      onComplete: () => loader.remove(),
    })
    // Hero: líneas del título suben desde abajo
    .fromTo(
      ".hero__title .line",
      { yPercent: 110, visibility: "visible" },
      { yPercent: 0, duration: 1.1, stagger: 0.12, ease: "power4.out" },
      "-=0.45"
    )
    .to("[data-hero-fade]", { opacity: 1, duration: 0.9, stagger: 0.12 }, "-=0.7");
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
    start: "top 86%",
    once: true,
    onEnter: (elements) => {
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.12,
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
  const setX = gsap.quickTo(dot, "x", { duration: 0.25, ease: "power3.out" });
  const setY = gsap.quickTo(dot, "y", { duration: 0.25, ease: "power3.out" });

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
   Init
   -------------------------------------------------------------------------- */
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
