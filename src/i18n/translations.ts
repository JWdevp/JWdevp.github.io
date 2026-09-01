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
    title: 'Jason Wiersum — Anwendungsentwickler',
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
    openSettings: 'Abrir ajustes',
    closeSettings: 'Cerrar ajustes',
    character: 'Ilustración decorativa: un personaje que sigue el cursor con la mirada.',
  },
  nav: {
    home: 'Inicio',
    work: 'Trabajo',
    about: 'Sobre mí',
    contact: 'Escríbeme',
  },
  hero: {
    greeting: '¡Hola, soy Jason!',
    tagline: 'Si estás viendo esto, tienes buen gusto.',
    ctaProjects: 'Ver proyectos',
    ctaContact: 'Escríbeme',
  },
  about: {
    eyebrow: 'Sobre mí',
    title: 'Técnica con estilo.',
    lead: 'Anwendungsentwickler certificado por la IHK desde julio de 2026, con tres años previos de formación en Ingeniería de Diseño Industrial y Desarrollo del Producto.',
    paragraphs: [
      'Soy español y vivo en Alemania desde 2012. Vivo y trabajo en Nürnberg (Bayern), y mi formación como Anwendungsentwickler me dio la base técnica: estructura, lógica, arquitectura y un método claro para construir software que se mantiene en el tiempo.',
      'Antes de eso estudié tres años Ingeniería de Diseño Industrial y Desarrollo del Producto en la Universidad de Málaga (UMA), sin llegar a obtener la titulación. De ahí viene la otra mitad: la manera de mirar un problema, de iterar una idea y de cuidar el detalle hasta que el resultado se siente bien usado.',
      'Después vinieron seis años en la gastronomía y otros seis como kaufmännischer Angestellter. Con esa experiencia detrás decidí reorientarme siguiendo una de mis pasiones: la programación.',
      'Esa combinación es lo que ofrezco. Entiendo cómo se construye el software y también cómo se piensa y se diseña un producto — dos conversaciones que normalmente ocurren en mesas distintas.',
    ],
    closing:
      'Desarrollo aplicaciones con una mirada de diseñador: pienso el producto entero, no solo el código que lo sostiene.',
    portraitAlt: 'Jason Wiersum',
    factsTitle: 'En breve',
    facts: [
      { label: 'Nombre', value: 'Jason Wiersum' },
      { label: 'Ubicación', value: 'Nuremberg, Baviera, Alemania' },
      {
        label: 'Perfil',
        value: 'Fachinformatiker für Anwendungsentwicklung (IHK)',
      },
    ],
    languagesTitle: 'Idiomas',
    languages: [
      { name: 'Español', level: 'Nativo' },
      { name: 'Inglés', level: 'Nativo' },
      { name: 'Alemán', level: 'C1 · Verhandlungssicher' },
    ],
  },
  skills: {
    eyebrow: 'Stack',
    title: 'Herramientas con las que trabajo.',
    categories: {
      programming: 'Programación',
      frameworks: 'Frameworks Java',
      versionControl: 'Control de versiones',
      tools: 'Herramientas',
      design: 'Diseño',
    },
  },
  projects: {
    eyebrow: 'Trabajo',
    title: 'Trabajo seleccionado.',
    viewProject: 'Ver proyecto',
    openDetail: 'Abrir proyecto',
    back: 'Volver al índice',
    client: 'Cliente',
    highlights: 'Qué hace',
    stack: 'Stack',
    tooling: 'Herramientas',
    visitSite: 'Visitar el sitio',
  },
  contact: {
    title: '¿Hablamos?',
    lead: 'Si tienes un proyecto, una vacante o simplemente una idea que quieras comentar, el mensaje llega directo a mi correo.',
    form: {
      name: 'Nombre',
      email: 'Email',
      message: 'Mensaje',
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
    title: 'Jason Wiersum — Anwendungsentwickler',
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
    openSettings: 'Open settings',
    closeSettings: 'Close settings',
    character: 'Decorative illustration: a character whose gaze follows the cursor.',
  },
  nav: {
    home: 'Home',
    work: 'Work',
    about: 'About',
    contact: 'Get in touch',
  },
  hero: {
    greeting: "Hi, I'm Jason!",
    tagline: "If you're seeing this, you have good taste.",
    ctaProjects: 'See projects',
    ctaContact: 'Get in touch',
  },
  about: {
    eyebrow: 'About',
    title: 'Engineering with style.',
    lead: 'IHK-certified Anwendungsentwickler since July 2026, with three prior years of study in Industrial Design Engineering and Product Development.',
    paragraphs: [
      'I am Spanish and have lived in Germany since 2012. I live and work in Nürnberg, Bavaria, and training as an Anwendungsentwickler gave me the technical foundation: structure, logic, architecture and a clear method for building software that keeps working over time.',
      'Before that I spent three years studying Industrial Design Engineering and Product Development at the Universidad de Málaga (UMA), without completing the degree. That is where the other half comes from — how to look at a problem, iterate an idea and stay with the details until the result actually feels good to use.',
      'Then came six years in hospitality and another six as a kaufmännischer Angestellter. With that behind me I decided to change direction and follow one of my passions: programming.',
      'That combination is what I bring. I understand how software is built and also how a product is thought through and designed — two conversations that usually happen at separate tables.',
    ],
    closing:
      'I build applications with a designer’s eye: I think about the whole product, not only the code holding it up.',
    portraitAlt: 'Jason Wiersum',
    factsTitle: 'At a glance',
    facts: [
      { label: 'Name', value: 'Jason Wiersum' },
      { label: 'Location', value: 'Nuremberg, Bavaria, Germany' },
      {
        label: 'Profile',
        value: 'Fachinformatiker für Anwendungsentwicklung (IHK)',
      },
    ],
    languagesTitle: 'Languages',
    languages: [
      { name: 'Spanish', level: 'Native' },
      { name: 'English', level: 'Native' },
      { name: 'German', level: 'C1 · Verhandlungssicher' },
    ],
  },
  skills: {
    eyebrow: 'Stack',
    title: 'Tools I work with.',
    categories: {
      programming: 'Programming',
      frameworks: 'Java frameworks',
      versionControl: 'Version control',
      tools: 'Tools',
      design: 'Design',
    },
  },
  projects: {
    eyebrow: 'Work',
    title: 'Selected work.',
    viewProject: 'View project',
    openDetail: 'Open project',
    back: 'Back to the overview',
    client: 'Client',
    highlights: 'What it does',
    stack: 'Stack',
    tooling: 'Tooling',
    visitSite: 'Visit the site',
  },
  contact: {
    title: 'Let’s talk.',
    lead: 'If you have a project, a role or simply an idea worth discussing, the message lands straight in my inbox.',
    form: {
      name: 'Name',
      email: 'Email',
      message: 'Message',
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
    title: 'Jason Wiersum — Anwendungsentwickler',
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
    openSettings: 'Einstellungen öffnen',
    closeSettings: 'Einstellungen schließen',
    character: 'Dekorative Illustration: eine Figur, deren Blick dem Mauszeiger folgt.',
  },
  nav: {
    home: 'Home',
    work: 'Work',
    about: 'Über mich',
    contact: 'Kontakt',
  },
  hero: {
    greeting: 'Hallo, ich bin Jason!',
    tagline: 'Wenn du das hier siehst, hast du guten Geschmack.',
    ctaProjects: 'Projekte ansehen',
    ctaContact: 'Schreib mich an',
  },
  about: {
    eyebrow: 'Über mich',
    title: 'Technik mit Style.',
    lead: 'Anwendungsentwickler, IHK-zertifiziert seit Juli 2026, davor drei Jahre Studium im Bereich Industriedesign-Ingenieurwesen und Produktentwicklung.',
    paragraphs: [
      'Ich bin Spanier und lebe seit 2012 in Deutschland. Ich lebe und arbeite in Nürnberg, Bayern, und die Ausbildung zum Anwendungsentwickler hat mir das technische Fundament gegeben: Struktur, Logik, Architektur und eine klare Methode, um Software zu bauen, die auch später noch trägt.',
      'Davor habe ich drei Jahre Industriedesign-Ingenieurwesen und Produktentwicklung an der Universidad de Málaga (UMA) studiert, ohne den Abschluss zu erwerben. Daher kommt die andere Hälfte: wie man ein Problem betrachtet, eine Idee iteriert und am Detail bleibt, bis sich das Ergebnis im Gebrauch richtig anfühlt.',
      'Danach kamen sechs Jahre in der Gastronomie und weitere sechs als kaufmännischer Angestellter. Mit dieser Erfahrung im Rücken habe ich mich neu orientiert und bin einer meiner Leidenschaften gefolgt: dem Programmieren.',
      'Genau diese Kombination bringe ich mit. Ich verstehe, wie Software gebaut wird — und ebenso, wie ein Produkt gedacht und gestaltet wird. Zwei Gespräche, die sonst an getrennten Tischen stattfinden.',
    ],
    closing:
      'Ich entwickle Anwendungen mit dem Blick eines Gestalters: Ich denke das ganze Produkt, nicht nur den Code darunter.',
    portraitAlt: 'Jason Wiersum',
    factsTitle: 'Kurz gefasst',
    facts: [
      { label: 'Name', value: 'Jason Wiersum' },
      { label: 'Ort', value: 'Nürnberg, Bayern' },
      {
        label: 'Profil',
        value: 'Fachinformatiker für Anwendungsentwicklung (IHK)',
      },
    ],
    languagesTitle: 'Sprachen',
    languages: [
      { name: 'Spanisch', level: 'Muttersprache' },
      { name: 'Englisch', level: 'Muttersprache' },
      { name: 'Deutsch', level: 'C1 · Verhandlungssicher' },
    ],
  },
  skills: {
    eyebrow: 'Stack',
    title: 'Womit ich arbeite.',
    categories: {
      programming: 'Programmierung',
      frameworks: 'Java-Frameworks',
      versionControl: 'Versionsverwaltung',
      tools: 'Werkzeuge',
      design: 'Design',
    },
  },
  projects: {
    eyebrow: 'Work',
    title: 'Ausgewählte Arbeiten.',
    viewProject: 'Projekt ansehen',
    openDetail: 'Projekt öffnen',
    back: 'Zurück zur Übersicht',
    client: 'Auftraggeber',
    highlights: 'Was sie kann',
    stack: 'Stack',
    tooling: 'Werkzeuge',
    visitSite: 'Website besuchen',
  },
  contact: {
    title: 'Reden wir?',
    lead: 'Ob Projekt, Stelle oder einfach eine Idee, über die du sprechen möchtest — die Nachricht landet direkt in meinem Postfach.',
    form: {
      name: 'Name',
      email: 'E-Mail',
      message: 'Nachricht',
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
