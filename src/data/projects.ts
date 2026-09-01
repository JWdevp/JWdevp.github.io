import type { Language } from '../i18n/translations'

/** A string that exists in every interface language. */
export type LocalizedText = Record<Language, string>

/** A list of strings that exists in every interface language. */
export type LocalizedList = Record<Language, string[]>

/** The long-form content shown when a project card is opened. */
export interface ProjectDetail {
  /** Who it was built for. Not localized — it is a proper name. */
  client?: string
  /** Body copy, one entry per paragraph. */
  body: LocalizedList
  /** Short statements of what the thing does. */
  highlights: LocalizedList
  /** Editor, tracker, CI — anything that is not part of the running product. */
  tooling?: string[]
  /**
   * Screenshots, relative to `public/` and without a leading slash, e.g.
   * `images/projects/buergermeisterverzeichnis-01.png`. An image that fails to
   * load removes itself, so the dialog never shows a broken thumbnail.
   */
  images?: string[]
}

export interface Project {
  id: string
  title: LocalizedText
  description: LocalizedText
  technologies: string[]
  /**
   * Path to a cover image inside `/public`, or `null` while the slot is still a
   * placeholder (a generated gradient is rendered instead).
   */
  image: string | null
  /**
   * Client mark shown on the card at rest, before the hover preview. Optional:
   * without one the card sets the client's name instead.
   */
  logo?: string | null
  /** Live/repository URL, or `null` when there is nothing to link to yet. */
  url: string | null
  /** Omit while a card is still a placeholder. */
  detail?: ProjectDetail
}

/**
 * ---------------------------------------------------------------------------
 * PROJECTS — replace these three placeholders with real work.
 * ---------------------------------------------------------------------------
 * For each project: write the three translations, list the technologies,
 * drop a cover image in `public/images/` and point `image` at it
 * (e.g. `image: 'images/my-project.jpg'` — no leading slash, so it keeps
 * working under any GitHub Pages base path) and set `url`. A project without a
 * `url` simply renders without its "view project" link.
 */
export const projects: Project[] = [
  {
    id: 'project-01',
    title: {
      es: 'Bürgermeisterverzeichnis',
      en: 'Bürgermeisterverzeichnis',
      de: 'Bürgermeisterverzeichnis',
    },
    description: {
      es: 'Tabla editable para los resultados de las elecciones municipales bávaras, en la aplicación web interna del Bayerisches Landesamt für Statistik.',
      en: 'An editable table for the results of the Bavarian municipal elections, inside the internal web application of the Bayerisches Landesamt für Statistik.',
      de: 'Editierbare Tabelle für die Ergebnisse der bayerischen Kommunalwahlen, in der internen Webanwendung des Bayerischen Landesamts für Statistik.',
    },
    technologies: ['Grails', 'Groovy', 'AJAX', 'MySQL', 'MariaDB', 'Git'],
    image: null,
    logo: 'images/projects/landesamt-logo.png',
    url: null,
    detail: {
      client: 'Bayerisches Landesamt für Statistik, Fürth',
      tooling: ['IntelliJ IDEA', 'Jira', 'Bitbucket'],
      images: [
        'images/projects/buergermeisterverzeichnis-01.png',
        'images/projects/buergermeisterverzeichnis-02.png',
      ],
      body: {
        es: [
          'Para el Bayerisches Landesamt für Statistik de Fürth construí una tabla dentro de la aplicación web interna del organismo. Renderiza los resultados de las elecciones municipales, Bürgermeister y Oberbürgermeister, y permite editarlos en la propia fila mediante AJAX, sin recargar ni salir de la página.',
          'Los resultados los envía cada municipio por separado. Tras la importación manual había que revisarlos en busca de erratas, problemas de formato y datos que faltaban: una pasada que antes ocupaba a dos Sachbearbeiter durante más de dos meses.',
          'La tabla separa las elecciones principales de las segundas vueltas y las ordena por fecha. Al elegir una fecha aparece cada Landkreis y cada ciudad independiente que votó ese día. Todas las columnas se pueden filtrar y ordenar, y un botón aparte deja a la vista solo los registros marcados como incompletos, de modo que la revisión empieza justo donde falta algo.',
          'La función «Bewerber suchen» busca en la base de datos y compara con los nombres de los candidatos presentados a ese Wahltermin, así que las coincidencias aparecen sin salir de la fila.',
          'El control y la corrección de datos pasó de una media de 55 a 60 minutos por Landkreis o kreisfreie Stadt a una media de 15.',
        ],
        en: [
          'For the Bayerisches Landesamt für Statistik in Fürth I built a table into the office’s internal web application. It renders the results of the municipal elections, Bürgermeister and Oberbürgermeister, and lets them be edited in place over AJAX, without a reload and without leaving the page.',
          'The results are submitted by each municipality separately, so after the manual import they had to be checked for typos, formatting problems and missing values: a pass that had previously occupied two case workers for more than two months.',
          'The table separates main elections from run-offs and orders them by polling day. Pick a date and every Landkreis and every kreisfreie Stadt that voted on it appears. Every column filters and sorts, and a separate button leaves only the records flagged incomplete on screen, so the review starts exactly where something is missing.',
          '“Bewerber suchen” queries the database and matches against the names of the candidates standing at that Wahltermin, so the matches come back without leaving the row.',
          'Checking and correcting the data went from an average of 55 to 60 minutes per Landkreis or kreisfreie Stadt to an average of 15.',
        ],
        de: [
          'Für das Bayerische Landesamt für Statistik in Fürth habe ich eine Tabelle in die interne Webanwendung des Hauses gebaut. Sie rendert die Ergebnisse der Kommunalwahlen, Bürgermeister und Oberbürgermeister, und macht sie direkt in der Zeile per AJAX editierbar, ohne Reload und ohne die Seite zu verlassen.',
          'Die Ergebnisse melden die Gemeinden einzeln. Nach dem manuellen Import mussten sie deshalb auf Tippfehler, Formatprobleme und fehlende Angaben durchgesehen werden — eine Nachbearbeitung, die zuvor zwei Sachbearbeiter über zwei Monate beschäftigt hat.',
          'Die Tabelle trennt Hauptwahlen und Stichwahlen und sortiert sie nach Wahltag. Ist ein Datum gewählt, erscheint jeder Landkreis und jede kreisfreie Stadt, in der an diesem Tag gewählt wurde. Jede Spalte lässt sich filtern und sortieren, und ein eigener Schalter zeigt ausschließlich die als unvollständig markierten Datensätze — die Durchsicht beginnt damit genau dort, wo etwas fehlt.',
          '„Bewerber suchen“ durchsucht die Datenbank und gleicht sie mit den Namen der Bewerber ab, die zu diesem Wahltermin angetreten sind, sodass die Treffer ohne Verlassen der Zeile zurückkommen.',
          'Die Kontrolle und Korrektur der Daten ging von durchschnittlich 55 bis 60 Minuten je Landkreis oder kreisfreier Stadt auf durchschnittlich 15 Minuten zurück.',
        ],
      },
      highlights: {
        es: [
          'Edición en línea por AJAX, sin salir de la página',
          'Elecciones principales y segundas vueltas separadas, listadas por fecha',
          'Desglose por Landkreis y ciudad independiente',
          'Filtrado y ordenación en todas las columnas',
          'Un botón para aislar los registros incompletos',
          '«Bewerber suchen»: búsqueda en base de datos contra los candidatos del Wahltermin',
          'De 55-60 minutos de control por Landkreis a una media de 15',
        ],
        en: [
          'Inline editing over AJAX, without leaving the page',
          'Main elections and run-offs separated, listed by polling day',
          'Breakdown by Landkreis and kreisfreie Stadt',
          'Filtering and sorting on every column',
          'One button to isolate the records flagged incomplete',
          '“Bewerber suchen”: a database search against that Wahltermin’s candidates',
          'From 55-60 minutes of checking per Landkreis to an average of 15',
        ],
        de: [
          'Inline-Bearbeitung per AJAX, ohne die Seite zu verlassen',
          'Haupt- und Stichwahlen getrennt, nach Wahltag gelistet',
          'Aufschlüsselung nach Landkreis und kreisfreier Stadt',
          'Filtern und Sortieren in jeder Spalte',
          'Ein Schalter für die als unvollständig markierten Datensätze',
          '„Bewerber suchen“: Datenbanksuche gegen die Bewerber des Wahltermins',
          'Von 55-60 Minuten Kontrolle je Landkreis auf durchschnittlich 15',
        ],
      },
    },
  },
  {
    id: 'project-02',
    title: {
      es: 'Proyecto dos',
      en: 'Project two',
      de: 'Projekt zwei',
    },
    description: {
      es: 'Espacio reservado para el segundo proyecto. Aquí irá una descripción breve del alcance y del resultado.',
      en: 'Reserved space for the second project. A short description of the scope and the outcome will go here.',
      de: 'Platz für das zweite Projekt. Hier folgt eine kurze Beschreibung von Umfang und Ergebnis.',
    },
    technologies: ['Python', 'JavaScript', 'Git'],
    image: null,
    url: null,
  },
  {
    id: 'project-03',
    title: {
      es: 'Proyecto tres',
      en: 'Project three',
      de: 'Projekt drei',
    },
    description: {
      es: 'Espacio reservado para el tercer proyecto, donde el lado técnico y el lado gráfico se encuentran.',
      en: 'Reserved space for the third project, where the technical side and the visual side meet.',
      de: 'Platz für das dritte Projekt, in dem technische und gestalterische Seite zusammenkommen.',
    },
    technologies: ['HTML', 'CSS', 'Adobe Creative Cloud'],
    image: null,
    url: null,
  },
]
