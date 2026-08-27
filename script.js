/* ============================================
   Jason Wiersum — Portfolio
   Tema, idioma y navegación deslizante
   ============================================ */

(function () {
  "use strict";

  /* --------------------------------------------
     Almacenamiento tolerante a fallos
     (modo incógnito puede bloquear localStorage)
     -------------------------------------------- */
  const store = {
    get(key) {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch (e) { /* sin persistencia */ }
    }
  };

  /* --------------------------------------------
     Traducciones
     -------------------------------------------- */
  const i18n = {
    de: {
      "nav.start": "Start",
      "nav.about": "Über mich",
      "nav.projects": "Projekte",
      "nav.contact": "Kontakt",

      "hero.eyebrow": "Entwicklung & Webdesign",
      "hero.name": "Hey, ich bin Jason!",
      "hero.lead": "Ich gestalte Websites und setze sie selbst um. Aus dem Designstudium bringe ich das Auge mit, aus der Ausbildung zum Fachinformatiker den Code — beides landet im selben Projekt statt in zwei getrennten Übergaben.",

      "facts.education.label": "Ausbildung",
      "facts.education.title": "Fachinformatiker (IHK)",
      "facts.education.text": "Anwendungsentwicklung, abgeschlossen im Juli 2026.",
      "facts.design.label": "Gestaltung",
      "facts.design.title": "Über 15 Jahre Photoshop",
      "facts.design.text": "Designstudium, Adobe Creative Cloud, Layout und Bildbearbeitung.",
      "facts.tech.label": "Technik",
      "facts.tech.title": "HTML, CSS, JavaScript",
      "facts.tech.text": "Dazu Java-basierte Frameworks, SQL und Git.",
      "facts.lang.label": "Sprachen",
      "facts.lang.title": "DE · EN · ES",
      "facts.lang.text": "Deutsch verhandlungssicher, Englisch und Spanisch als Muttersprachen.",

      "contact.head": "Kontakt & Profile",
      "link.write": "Schreib mich an",
      "link.write.meta": "Kontakt",
      "link.email.meta": "E-Mail",
      "link.linkedin.meta": "Profil",
      "link.github.meta": "Code",

      "about.eyebrow": "Ein paar Worte",
      "about.title": "Über mich",
      "about.lead": "Platzhalter — hier kommt eine kurze Einleitung darüber, wer ich bin und was mich antreibt.",
      "about.h1": "Mein Weg",
      "about.p1": "Platzhalter-Text. Hier beschreibe ich meinen Weg vom Designstudium zur Softwareentwicklung und was mich an der Kombination beider Welten reizt.",
      "about.h2": "Wie ich arbeite",
      "about.p2": "Platzhalter-Text. Hier steht später, wie ich an Projekte herangehe, was mir bei der Zusammenarbeit wichtig ist und woran ich gerne arbeite.",
      "about.h3": "Abseits vom Schreibtisch",
      "about.p3": "Platzhalter-Text. Hier kommen persönliche Interessen und Hobbys hin.",
      "about.aside.head": "Auf einen Blick",
      "about.aside.1": "Platzhalter — Standort",
      "about.aside.2": "Platzhalter — Schwerpunkt",
      "about.aside.3": "Platzhalter — Verfügbarkeit",
      "about.aside.4": "Platzhalter — Interessen",

      "projects.eyebrow": "Zwei Arbeiten",
      "projects.title": "Projekte",
      "projects.lead": "Konzeptarbeiten, in denen ich Gestaltung und Umsetzung selbst verantwortet habe — vom ersten Wireframe bis zum fertigen HTML und CSS.",
      "proj1.meta1": "Relaunch-Konzept",
      "proj1.meta2": "Steuerkanzlei",
      "proj1.title": "Kanzlei-Website, neu gedacht",
      "proj1.text": "Viele Kanzlei-Websites erklären, was eine Steuerberatung ist — aber nicht, warum man genau diese anrufen sollte. Das Konzept räumt die Startseite auf, stellt Leistungen und Ansprechpartner nach vorn und macht die Kontaktaufnahme zum sichtbaren Ziel der Seite.",
      "proj2.meta1": "Konzept & Umsetzung",
      "proj2.meta2": "E-Commerce",
      "proj2.title": "Onlineshop mit klarem Weg zur Kasse",
      "proj2.text": "Ein Shop-Konzept, das die Produktseite als Entscheidungshilfe behandelt: Bild, Preis und Verfügbarkeit ohne Umwege, ein durchgehendes Raster über Übersicht, Detailseite und Warenkorb.",
      "proj.cta": "Projekt ansehen",
      "proj.thumb": "Vorschau folgt",

      "contact.eyebrow": "Schreib mir",
      "contact.title": "Kontakt",
      "contact.lead": "Ob Projektanfrage, Stellenangebot oder einfach eine Frage — schreib mir kurz, ich melde mich zeitnah zurück.",
      "form.name": "Name",
      "form.email": "E-Mail",
      "form.subject": "Betreff",
      "form.message": "Nachricht",
      "form.send": "Nachricht senden",
      "form.note": "Deine Angaben werden ausschließlich zur Beantwortung deiner Anfrage verwendet.",
      "contact.side": "Direkt erreichbar",
      "link.email": "E-Mail",

      "foot.left": "Jason Wiersum · Nürnberg",
      "foot.right": "Gestaltet und gebaut in HTML & CSS",
      "a11y.theme": "Zwischen hellem und dunklem Modus wechseln",
      "a11y.skip": "Zum Inhalt springen"
    },

    en: {
      "nav.start": "Start",
      "nav.about": "About",
      "nav.projects": "Projects",
      "nav.contact": "Contact",

      "hero.eyebrow": "Development & Web Design",
      "hero.name": "Hey, I'm Jason!",
      "hero.lead": "I design websites and build them myself. My design studies gave me the eye, my training as a software developer gave me the code — both end up in the same project instead of two separate handovers.",

      "facts.education.label": "Training",
      "facts.education.title": "Software Developer (IHK)",
      "facts.education.text": "Application development, completed in July 2026.",
      "facts.design.label": "Design",
      "facts.design.title": "15+ years of Photoshop",
      "facts.design.text": "Design studies, Adobe Creative Cloud, layout and image editing.",
      "facts.tech.label": "Tech",
      "facts.tech.title": "HTML, CSS, JavaScript",
      "facts.tech.text": "Plus Java-based frameworks, SQL and Git.",
      "facts.lang.label": "Languages",
      "facts.lang.title": "DE · EN · ES",
      "facts.lang.text": "Fluent German, native English and Spanish.",

      "contact.head": "Contact & profiles",
      "link.write": "Drop me a line",
      "link.write.meta": "Contact",
      "link.email.meta": "Email",
      "link.linkedin.meta": "Profile",
      "link.github.meta": "Code",

      "about.eyebrow": "A few words",
      "about.title": "About me",
      "about.lead": "Placeholder — a short intro about who I am and what drives me goes here.",
      "about.h1": "My path",
      "about.p1": "Placeholder text. Here I describe my path from design studies to software development, and what draws me to combining both worlds.",
      "about.h2": "How I work",
      "about.p2": "Placeholder text. This will cover how I approach projects, what matters to me in collaboration, and the kind of work I enjoy.",
      "about.h3": "Away from the desk",
      "about.p3": "Placeholder text. Personal interests and hobbies go here.",
      "about.aside.head": "At a glance",
      "about.aside.1": "Placeholder — location",
      "about.aside.2": "Placeholder — focus",
      "about.aside.3": "Placeholder — availability",
      "about.aside.4": "Placeholder — interests",

      "projects.eyebrow": "Two pieces",
      "projects.title": "Projects",
      "projects.lead": "Concept work where I handled both design and implementation — from the first wireframe to the finished HTML and CSS.",
      "proj1.meta1": "Relaunch concept",
      "proj1.meta2": "Tax consultancy",
      "proj1.title": "A law firm website, rethought",
      "proj1.text": "Many consultancy websites explain what a tax advisor does — but not why you should call this one. The concept clears up the homepage, puts services and contacts up front, and makes getting in touch the visible goal of the page.",
      "proj2.meta1": "Concept & build",
      "proj2.meta2": "E-commerce",
      "proj2.title": "An online shop with a clear path to checkout",
      "proj2.text": "A shop concept that treats the product page as a decision aid: image, price and availability without detours, and one consistent grid across listing, detail page and cart.",
      "proj.cta": "View project",
      "proj.thumb": "Preview coming",

      "contact.eyebrow": "Get in touch",
      "contact.title": "Contact",
      "contact.lead": "Whether it's a project enquiry, a job offer or just a question — drop me a line and I'll get back to you shortly.",
      "form.name": "Name",
      "form.email": "Email",
      "form.subject": "Subject",
      "form.message": "Message",
      "form.send": "Send message",
      "form.note": "Your details will only be used to answer your enquiry.",
      "contact.side": "Reach me directly",
      "link.email": "Email",

      "foot.left": "Jason Wiersum · Nuremberg",
      "foot.right": "Designed and built in HTML & CSS",
      "a11y.theme": "Switch between light and dark mode",
      "a11y.skip": "Skip to content"
    },

    es: {
      "nav.start": "Inicio",
      "nav.about": "Sobre mí",
      "nav.projects": "Proyectos",
      "nav.contact": "Contacto",

      "hero.eyebrow": "Programación y diseño web",
      "hero.name": "¡Hola, soy Jason!",
      "hero.lead": "Diseño páginas web y las desarrollo yo mismo. De mis estudios de diseño traigo el ojo; de mi formación como desarrollador, el código — ambos acaban en el mismo proyecto en vez de en dos entregas separadas.",

      "facts.education.label": "Formación",
      "facts.education.title": "Desarrollador de software (IHK)",
      "facts.education.text": "Desarrollo de aplicaciones, finalizado en julio de 2026.",
      "facts.design.label": "Diseño",
      "facts.design.title": "Más de 15 años con Photoshop",
      "facts.design.text": "Estudios de diseño, Adobe Creative Cloud, maquetación y edición de imagen.",
      "facts.tech.label": "Técnica",
      "facts.tech.title": "HTML, CSS, JavaScript",
      "facts.tech.text": "Además de frameworks basados en Java, SQL y Git.",
      "facts.lang.label": "Idiomas",
      "facts.lang.title": "DE · EN · ES",
      "facts.lang.text": "Alemán profesional, inglés y español nativos.",

      "contact.head": "Contacto y perfiles",
      "link.write": "Escríbeme",
      "link.write.meta": "Contacto",
      "link.email.meta": "Correo",
      "link.linkedin.meta": "Perfil",
      "link.github.meta": "Código",

      "about.eyebrow": "Unas palabras",
      "about.title": "Sobre mí",
      "about.lead": "Marcador de posición — aquí irá una breve introducción sobre quién soy y qué me mueve.",
      "about.h1": "Mi trayectoria",
      "about.p1": "Texto de ejemplo. Aquí describiré mi recorrido desde los estudios de diseño hasta el desarrollo de software, y qué me atrae de combinar ambos mundos.",
      "about.h2": "Cómo trabajo",
      "about.p2": "Texto de ejemplo. Aquí explicaré cómo enfoco los proyectos, qué valoro en la colaboración y en qué disfruto trabajando.",
      "about.h3": "Fuera del escritorio",
      "about.p3": "Texto de ejemplo. Aquí irán intereses personales y aficiones.",
      "about.aside.head": "De un vistazo",
      "about.aside.1": "Marcador — ubicación",
      "about.aside.2": "Marcador — especialidad",
      "about.aside.3": "Marcador — disponibilidad",
      "about.aside.4": "Marcador — intereses",

      "projects.eyebrow": "Dos trabajos",
      "projects.title": "Proyectos",
      "projects.lead": "Trabajos conceptuales en los que me encargué tanto del diseño como del desarrollo — desde el primer wireframe hasta el HTML y CSS finales.",
      "proj1.meta1": "Concepto de relanzamiento",
      "proj1.meta2": "Asesoría fiscal",
      "proj1.title": "La web de una asesoría, repensada",
      "proj1.text": "Muchas webs de asesorías explican qué hace un asesor fiscal, pero no por qué llamar precisamente a esa. El concepto despeja la portada, pone por delante los servicios y las personas de contacto, y convierte el contacto en el objetivo visible de la página.",
      "proj2.meta1": "Concepto y desarrollo",
      "proj2.meta2": "Comercio electrónico",
      "proj2.title": "Una tienda online con un camino claro a la compra",
      "proj2.text": "Un concepto de tienda que trata la ficha de producto como una ayuda a la decisión: imagen, precio y disponibilidad sin rodeos, y una retícula constante entre listado, ficha y carrito.",
      "proj.cta": "Ver proyecto",
      "proj.thumb": "Vista previa pendiente",

      "contact.eyebrow": "Escríbeme",
      "contact.title": "Contacto",
      "contact.lead": "Ya sea una propuesta de proyecto, una oferta de trabajo o simplemente una duda — escríbeme y te respondo enseguida.",
      "form.name": "Nombre",
      "form.email": "Correo electrónico",
      "form.subject": "Asunto",
      "form.message": "Mensaje",
      "form.send": "Enviar mensaje",
      "form.note": "Tus datos se usarán únicamente para responder a tu consulta.",
      "contact.side": "Contacto directo",
      "link.email": "Correo electrónico",

      "foot.left": "Jason Wiersum · Núremberg",
      "foot.right": "Diseñado y construido en HTML y CSS",
      "a11y.theme": "Cambiar entre modo claro y oscuro",
      "a11y.skip": "Saltar al contenido"
    }
  };

  /* --------------------------------------------
     Tema
     -------------------------------------------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    store.set("theme", theme);
  }

  function initTheme() {
    const saved = store.get("theme");
    const prefersDark = window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || "light");

    const btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;

    btn.addEventListener("click", function () {
      const current = document.documentElement.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  /* --------------------------------------------
     Idioma
     -------------------------------------------- */
  function applyLang(lang) {
    const dict = i18n[lang] || i18n.de;

    document.documentElement.lang = lang;
    store.set("lang", lang);

    // Texto visible
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });

    // Atributos (aria-label, placeholder, …)
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      // Formato: "aria-label:a11y.theme"
      el.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
        const parts = pair.split(":");
        if (parts.length === 2 && dict[parts[1].trim()]) {
          el.setAttribute(parts[0].trim(), dict[parts[1].trim()]);
        }
      });
    });

    // Botones de idioma
    document.querySelectorAll("[data-lang]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === lang);
    });

    // La anchura de los enlaces cambia con el idioma
    positionPill(false);
  }

  function initLang() {
    applyLang(store.get("lang") || "de");

    document.querySelectorAll("[data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-lang"));
      });
    });
  }

  /* --------------------------------------------
     Píldora deslizante de la isla
     -------------------------------------------- */
  const island = document.querySelector(".island");
  const pill = document.querySelector(".island__pill");

  function positionPill(animate) {
    if (!island || !pill) return;

    const active = island.querySelector("a.is-active");
    if (!active) return;

    // Si animate es false, desactivamos transiciones para posicionamiento instantáneo
    pill.style.transition = animate ? "" : "none";

    const linkRect = active.getBoundingClientRect();
    const islandRect = island.getBoundingClientRect();
    const left = linkRect.left - islandRect.left;

    pill.style.width = active.offsetWidth + "px";
    pill.style.transform = `translate3d(${left}px, 0, 0)`;

    if (!animate) {
      // Fuerza un reflow previo a restaurar la transición
      void pill.offsetWidth;
      pill.style.transition = "";
    }

    pill.classList.add("is-ready");
  }

  function initIsland() {
    if (!island || !pill) return;

    positionPill(false);

    island.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function (event) {
        if (link.classList.contains("is-active")) {
          event.preventDefault();
          return;
        }

        event.preventDefault();

        // Actualiza clases
        island.querySelectorAll("a").forEach(a => a.classList.remove("is-active"));
        link.classList.add("is-active");

        // Ejecuta el deslizamiento suave (animación acelerada por GPU)
        positionPill(true);

        // Cambia de página al terminar la transición rápida
        const target = link.getAttribute("href");
        window.setTimeout(function () {
          window.location.href = target;
        }, 250);
      });
    });

    window.addEventListener("resize", function () {
      positionPill(false);
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        positionPill(false);
      });
    }
  }
  
  /* --------------------------------------------
     Arranque
     -------------------------------------------- */
  function init() {
    initTheme();
    initIsland();
    initLang();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
