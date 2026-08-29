/**
 * Every user-facing string of the interface lives here.
 * Components never hardcode copy — they read it through `useLanguage()`.
 *
 * To edit the wording of the site, edit this file only.
 * Project titles/descriptions are content rather than UI chrome and live,
 * already localised, in `src/data/projects.ts`.
 */

export const LANGUAGES = ['es', 'en', 'de'] as const
export type Language = (typeof LANGUAGES)[number]

export const DEFAULT_LANGUAGE: Language = 'de'

/** BCP-47 codes used for the <html lang> attribute. */
export const HTML_LANG: Record<Language, string> = {
  es: 'es',
  en: 'en',
  de: 'de',
}

const es = {
  meta: {
    title: 'Jason Wiersum — Portfolio',
    description:
      'Jason Wiersum — Anwendungsentwickler certificado por la IHK en Nürnberg. Software, diseño y creatividad en un mismo perfil.',
  },
  a11y: {
    skipToContent: 'Saltar al contenido',
    mainNavigation: 'Navegación principal',
    languageSelector: 'Seleccionar idioma',
    switchToDark: 'Activar modo oscuro',
    switchToLight: 'Activar modo claro',
    openInNewTab: 'Se abre en una pestaña nueva',
    character3d:
      'Escena tridimensional decorativa: un personaje que saluda y sigue el cursor.',
  },
  nav: {
    home: 'Inicio',
    about: 'Sobre mí',
    projects: 'Proyectos',
    contact: 'Escríbeme',
  },
  hero: {
    greeting: '¡Hola, soy Jason!',
    tagline: 'Si estás viendo esto, tienes buen gusto.',
    role: 'Anwendungsentwickler · Certificado por la IHK desde julio de 2026',
    triad: 'Software · Diseño · Creatividad',
    location: 'Nürnberg, Bayern · Alemania',
    intro:
      'Desarrollo aplicaciones con una mirada de diseñador: pienso el producto entero, no solo el código que lo sostiene.',
    ctaProjects: 'Ver proyectos',
    ctaContact: 'Escríbeme',
    scrollHint: 'Desplázate',
  },
  about: {
    eyebrow: 'Sobre mí',
    title: 'Tecnología con criterio de diseño.',
    lead: 'Anwendungsentwickler certificado por la IHK desde julio de 2026, con tres años previos de formación en Ingeniería de Diseño Industrial y Desarrollo del Producto.',
    paragraphs: [
      'Vivo y trabajo en Nürnberg (Bayern). Mi formación como Anwendungsentwickler me dio la base técnica: estructura, lógica, arquitectura y un método claro para construir software que se mantiene en el tiempo.',
      'Antes de eso pasé tres años estudiando Ingeniería de Diseño Industrial y Desarrollo del Producto. De ahí viene la otra mitad: la manera de mirar un problema, de iterar una idea y de cuidar el detalle hasta que el resultado se siente bien usado.',
      'Esa combinación es lo que ofrezco. Entiendo cómo se construye el software y también cómo se piensa y se diseña un producto — dos conversaciones que normalmente ocurren en mesas distintas.',
    ],
    pillarsTitle: 'Lo que aporta el background creativo',
    pillars: [
      {
        title: 'Creatividad aplicada',
        text: 'Buscar la solución que nadie había puesto sobre la mesa, y saber defenderla.',
      },
      {
        title: 'Pensamiento de diseño',
        text: 'Empezar por la persona que va a usarlo y trabajar hacia atrás hasta el código.',
      },
      {
        title: 'Resolución de problemas',
        text: 'Descomponer lo complejo en piezas manejables y ordenarlas por impacto.',
      },
      {
        title: 'Visión de producto',
        text: 'Entender por qué existe lo que estoy construyendo, no solo cómo funciona.',
      },
    ],
    factsTitle: 'En breve',
    facts: [
      { label: 'Nombre', value: 'Jason Wiersum' },
      { label: 'Ubicación', value: 'Nürnberg, Bayern (Alemania)' },
      { label: 'Perfil', value: 'Anwendungsentwickler (IHK)' },
      { label: 'Enfoque', value: 'Software · Diseño · Creatividad' },
    ],
  },
  skills: {
    eyebrow: 'Stack',
    title: 'Herramientas con las que trabajo.',
    lead: 'Tecnologías que uso de forma habitual, agrupadas por lo que hacen. Sin porcentajes: una herramienta se conoce o no se conoce.',
    categories: {
      programming: 'Programación',
      frameworks: 'Frameworks Java',
      versionControl: 'Control de versiones',
      tools: 'Herramientas',
      creative: 'Creatividad',
    },
    photoshopNote: '15 años de experiencia',
    languagesTitle: 'Idiomas',
    languages: [
      { name: 'Español', level: 'Nativo' },
      { name: 'Inglés', level: 'Nativo' },
      { name: 'Alemán', level: 'C1 · Verhandlungssicher' },
    ],
  },
  projects: {
    eyebrow: 'Proyectos',
    title: 'Trabajo seleccionado.',
    lead: 'Espacio reservado para los proyectos. Estas tarjetas son marcadores de posición y se sustituirán por trabajo real.',
    placeholderBadge: 'Marcador de posición',
    viewProject: 'Ver proyecto',
    comingSoon: 'Próximamente',
  },
  contact: {
    eyebrow: 'Escríbeme',
    title: '¿Hablamos?',
    lead: 'Si tienes un proyecto, una vacante o simplemente una idea que quieras comentar, el mensaje llega directo a mi correo.',
    form: {
      name: 'Nombre',
      namePlaceholder: 'Cómo te llamas',
      email: 'Email',
      emailPlaceholder: 'tu@email.com',
      message: 'Mensaje',
      messagePlaceholder: 'Cuéntame en qué estás pensando…',
      submit: 'Enviar mensaje',
      sending: 'Enviando…',
      required: 'Obligatorio',
    },
    status: {
      success: '¡Mensaje enviado! Gracias por escribirme.',
      error: 'No se ha podido enviar el mensaje. Inténtalo de nuevo, por favor.',
      network:
        'Sin conexión con el servidor. Comprueba tu red e inténtalo de nuevo.',
      retry: 'Reintentar',
      sendAnother: 'Enviar otro mensaje',
    },
    validation: {
      name: 'Escribe tu nombre.',
      email: 'Escribe un email válido.',
      message: 'Escribe un mensaje de al menos 10 caracteres.',
    },
    elsewhere: 'También estoy aquí',
    linkedin: 'LinkedIn',
    github: 'GitHub',
  },
  footer: {
    tagline: 'Software · Diseño · Creatividad',
    location: 'Nürnberg, Bayern',
    rights: 'Todos los derechos reservados.',
    backToTop: 'Volver arriba',
  },
}

/**
 * The shape every language must satisfy, inferred from the Spanish dictionary.
 * Add a key to `es` and the other two languages stop compiling until they
 * catch up — the structure is enforced, the wording is free.
 */
export type Translation = typeof es

const en: Translation = {
  meta: {
    title: 'Jason Wiersum — Portfolio',
    description:
      'Jason Wiersum — IHK-certified Anwendungsentwickler based in Nürnberg. Software, design and creativity in one profile.',
  },
  a11y: {
    skipToContent: 'Skip to content',
    mainNavigation: 'Main navigation',
    languageSelector: 'Select language',
    switchToDark: 'Switch to dark mode',
    switchToLight: 'Switch to light mode',
    openInNewTab: 'Opens in a new tab',
    character3d:
      'Decorative 3D scene: a character that waves and follows the cursor.',
  },
  nav: {
    home: 'Home',
    about: 'About',
    projects: 'Projects',
    contact: 'Get in touch',
  },
  hero: {
    greeting: "Hi, I'm Jason!",
    tagline: "If you're seeing this, you have good taste.",
    role: 'Anwendungsentwickler · IHK-certified since July 2026',
    triad: 'Software · Design · Creativity',
    location: 'Nürnberg, Bavaria · Germany',
    intro:
      'I build applications with a designer’s eye: I think about the whole product, not only the code holding it up.',
    ctaProjects: 'See projects',
    ctaContact: 'Get in touch',
    scrollHint: 'Scroll',
  },
  about: {
    eyebrow: 'About',
    title: 'Engineering with a designer’s judgement.',
    lead: 'IHK-certified Anwendungsentwickler since July 2026, with three prior years of study in Industrial Design Engineering and Product Development.',
    paragraphs: [
      'I live and work in Nürnberg, Bavaria. Training as an Anwendungsentwickler gave me the technical foundation: structure, logic, architecture and a clear method for building software that keeps working over time.',
      'Before that I spent three years studying Industrial Design Engineering and Product Development. That is where the other half comes from — how to look at a problem, iterate an idea and stay with the details until the result actually feels good to use.',
      'That combination is what I bring. I understand how software is built and also how a product is thought through and designed — two conversations that usually happen at separate tables.',
    ],
    pillarsTitle: 'What the creative background adds',
    pillars: [
      {
        title: 'Applied creativity',
        text: 'Finding the option nobody had put on the table, and being able to argue for it.',
      },
      {
        title: 'Design thinking',
        text: 'Starting from the person who will use it and working backwards to the code.',
      },
      {
        title: 'Problem solving',
        text: 'Breaking complexity into workable pieces and ordering them by impact.',
      },
      {
        title: 'Product vision',
        text: 'Understanding why the thing I am building exists, not only how it works.',
      },
    ],
    factsTitle: 'At a glance',
    facts: [
      { label: 'Name', value: 'Jason Wiersum' },
      { label: 'Location', value: 'Nürnberg, Bavaria (Germany)' },
      { label: 'Profile', value: 'Anwendungsentwickler (IHK)' },
      { label: 'Focus', value: 'Software · Design · Creativity' },
    ],
  },
  skills: {
    eyebrow: 'Stack',
    title: 'Tools I work with.',
    lead: 'Technologies I use regularly, grouped by what they do. No percentages — you either know a tool or you don’t.',
    categories: {
      programming: 'Programming',
      frameworks: 'Java frameworks',
      versionControl: 'Version control',
      tools: 'Tools',
      creative: 'Creative',
    },
    photoshopNote: '15 years of experience',
    languagesTitle: 'Languages',
    languages: [
      { name: 'Spanish', level: 'Native' },
      { name: 'English', level: 'Native' },
      { name: 'German', level: 'C1 · Verhandlungssicher' },
    ],
  },
  projects: {
    eyebrow: 'Projects',
    title: 'Selected work.',
    lead: 'Space reserved for the projects. These cards are placeholders and will be replaced with real work.',
    placeholderBadge: 'Placeholder',
    viewProject: 'View project',
    comingSoon: 'Coming soon',
  },
  contact: {
    eyebrow: 'Get in touch',
    title: 'Let’s talk.',
    lead: 'If you have a project, a role or simply an idea worth discussing, the message lands straight in my inbox.',
    form: {
      name: 'Name',
      namePlaceholder: 'Your name',
      email: 'Email',
      emailPlaceholder: 'you@email.com',
      message: 'Message',
      messagePlaceholder: 'Tell me what you have in mind…',
      submit: 'Send message',
      sending: 'Sending…',
      required: 'Required',
    },
    status: {
      success: 'Message sent! Thanks for getting in touch.',
      error: 'The message could not be sent. Please try again.',
      network: 'No connection to the server. Check your network and try again.',
      retry: 'Try again',
      sendAnother: 'Send another message',
    },
    validation: {
      name: 'Please enter your name.',
      email: 'Please enter a valid email address.',
      message: 'Please write a message of at least 10 characters.',
    },
    elsewhere: 'Also here',
    linkedin: 'LinkedIn',
    github: 'GitHub',
  },
  footer: {
    tagline: 'Software · Design · Creativity',
    location: 'Nürnberg, Bavaria',
    rights: 'All rights reserved.',
    backToTop: 'Back to top',
  },
}

const de: Translation = {
  meta: {
    title: 'Jason Wiersum — Portfolio',
    description:
      'Jason Wiersum — IHK-zertifizierter Anwendungsentwickler aus Nürnberg. Software, Design und Kreativität in einem Profil.',
  },
  a11y: {
    skipToContent: 'Zum Inhalt springen',
    mainNavigation: 'Hauptnavigation',
    languageSelector: 'Sprache wählen',
    switchToDark: 'In den Dunkelmodus wechseln',
    switchToLight: 'In den Hellmodus wechseln',
    openInNewTab: 'Wird in einem neuen Tab geöffnet',
    character3d:
      'Dekorative 3D-Szene: eine Figur, die winkt und dem Mauszeiger folgt.',
  },
  nav: {
    home: 'Home',
    about: 'Über mich',
    projects: 'Projekte',
    contact: 'Kontakt',
  },
  hero: {
    greeting: 'Hallo, ich bin Jason!',
    tagline: 'Wenn du das hier siehst, hast du guten Geschmack.',
    role: 'Anwendungsentwickler · IHK-zertifiziert seit Juli 2026',
    triad: 'Software · Design · Kreativität',
    location: 'Nürnberg, Bayern · Deutschland',
    intro:
      'Ich entwickle Anwendungen mit dem Blick eines Gestalters: Ich denke das ganze Produkt, nicht nur den Code darunter.',
    ctaProjects: 'Projekte ansehen',
    ctaContact: 'Schreib mich an',
    scrollHint: 'Scrollen',
  },
  about: {
    eyebrow: 'Über mich',
    title: 'Technik mit gestalterischem Urteil.',
    lead: 'Anwendungsentwickler, IHK-zertifiziert seit Juli 2026, davor drei Jahre Studium im Bereich Industriedesign-Ingenieurwesen und Produktentwicklung.',
    paragraphs: [
      'Ich lebe und arbeite in Nürnberg, Bayern. Die Ausbildung zum Anwendungsentwickler hat mir das technische Fundament gegeben: Struktur, Logik, Architektur und eine klare Methode, um Software zu bauen, die auch später noch trägt.',
      'Davor habe ich drei Jahre Industriedesign-Ingenieurwesen und Produktentwicklung studiert. Daher kommt die andere Hälfte: wie man ein Problem betrachtet, eine Idee iteriert und am Detail bleibt, bis sich das Ergebnis im Gebrauch richtig anfühlt.',
      'Genau diese Kombination bringe ich mit. Ich verstehe, wie Software gebaut wird — und ebenso, wie ein Produkt gedacht und gestaltet wird. Zwei Gespräche, die sonst an getrennten Tischen stattfinden.',
    ],
    pillarsTitle: 'Was der gestalterische Hintergrund beiträgt',
    pillars: [
      {
        title: 'Angewandte Kreativität',
        text: 'Die Lösung finden, die noch niemand vorgeschlagen hat — und sie begründen können.',
      },
      {
        title: 'Design Thinking',
        text: 'Bei der Person anfangen, die es benutzt, und von dort zurück zum Code arbeiten.',
      },
      {
        title: 'Problemlösung',
        text: 'Komplexes in handhabbare Teile zerlegen und nach Wirkung sortieren.',
      },
      {
        title: 'Produktdenken',
        text: 'Verstehen, warum das Ding existiert, das ich baue — nicht nur, wie es funktioniert.',
      },
    ],
    factsTitle: 'Kurz gefasst',
    facts: [
      { label: 'Name', value: 'Jason Wiersum' },
      { label: 'Ort', value: 'Nürnberg, Bayern (Deutschland)' },
      { label: 'Profil', value: 'Anwendungsentwickler (IHK)' },
      { label: 'Fokus', value: 'Software · Design · Kreativität' },
    ],
  },
  skills: {
    eyebrow: 'Stack',
    title: 'Womit ich arbeite.',
    lead: 'Technologien, die ich regelmäßig einsetze, gruppiert nach ihrer Aufgabe. Ohne Prozentangaben — ein Werkzeug beherrscht man oder eben nicht.',
    categories: {
      programming: 'Programmierung',
      frameworks: 'Java-Frameworks',
      versionControl: 'Versionsverwaltung',
      tools: 'Werkzeuge',
      creative: 'Kreativ',
    },
    photoshopNote: '15 Jahre Erfahrung',
    languagesTitle: 'Sprachen',
    languages: [
      { name: 'Spanisch', level: 'Muttersprache' },
      { name: 'Englisch', level: 'Muttersprache' },
      { name: 'Deutsch', level: 'C1 · Verhandlungssicher' },
    ],
  },
  projects: {
    eyebrow: 'Projekte',
    title: 'Ausgewählte Arbeiten.',
    lead: 'Platz für die Projekte. Diese Karten sind Platzhalter und werden durch echte Arbeiten ersetzt.',
    placeholderBadge: 'Platzhalter',
    viewProject: 'Projekt ansehen',
    comingSoon: 'Demnächst',
  },
  contact: {
    eyebrow: 'Schreib mich an',
    title: 'Reden wir?',
    lead: 'Ob Projekt, Stelle oder einfach eine Idee, über die du sprechen möchtest — die Nachricht landet direkt in meinem Postfach.',
    form: {
      name: 'Name',
      namePlaceholder: 'Dein Name',
      email: 'E-Mail',
      emailPlaceholder: 'du@email.com',
      message: 'Nachricht',
      messagePlaceholder: 'Erzähl mir, worum es geht…',
      submit: 'Nachricht senden',
      sending: 'Wird gesendet…',
      required: 'Pflichtfeld',
    },
    status: {
      success: 'Nachricht gesendet! Danke für deine Nachricht.',
      error:
        'Die Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.',
      network:
        'Keine Verbindung zum Server. Prüfe dein Netzwerk und versuche es erneut.',
      retry: 'Erneut versuchen',
      sendAnother: 'Weitere Nachricht senden',
    },
    validation: {
      name: 'Bitte gib deinen Namen ein.',
      email: 'Bitte gib eine gültige E-Mail-Adresse ein.',
      message: 'Bitte schreibe eine Nachricht mit mindestens 10 Zeichen.',
    },
    elsewhere: 'Auch hier',
    linkedin: 'LinkedIn',
    github: 'GitHub',
  },
  footer: {
    tagline: 'Software · Design · Kreativität',
    location: 'Nürnberg, Bayern',
    rights: 'Alle Rechte vorbehalten.',
    backToTop: 'Nach oben',
  },
}

export const translations: Record<Language, Translation> = { es, en, de }

export const LANGUAGE_LABELS: Record<Language, string> = {
  de: 'DE',
  en: 'EN',
  es: 'ES',
}
