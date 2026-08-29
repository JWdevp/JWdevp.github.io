# Jason Wiersum — Portfolio

Single-page personal portfolio: React + TypeScript + Vite, a Three.js character
in the hero, GSAP for all motion, three languages, light/dark themes and a real
contact form powered by Web3Forms. Deployed to GitHub Pages.

---

## Running it

```bash
npm install     # install dependencies
npm run dev     # dev server at http://localhost:5173
npm run build   # type-check + production build into dist/
npm run preview # serve the production build locally
```

Node 20 or newer.

---

## What is where

```
src/
├── components/
│   ├── Navigation/    FloatingNavigation · LanguageSwitcher · ThemeToggle
│   ├── Character/     the 3D scene, GLB loader, placeholder, pointer tracking
│   ├── Hero/          first screen
│   ├── About/         biography, facts panel, the four creative pillars
│   ├── Skills/        technologies by category + spoken languages
│   ├── Projects/      grid + project card
│   ├── Contact/       section + Web3Forms form
│   └── Layout/        footer, background ambience
├── hooks/             theme · language · section observer · scroll · reveal
├── i18n/              translations.ts  ← every interface string
├── data/              projects.ts · skills.ts
├── config/            site.ts (personal data, links) · web3forms.ts
└── styles/            tokens.css (design system) · globals.css
```

The page has four sections — `#home`, `#about`, `#projects`, `#contact` — in one
document. There is no router: navigation is smooth scrolling, and the active
item is detected with an `IntersectionObserver`.

---

## The 3D character

### Where to put the model

```
public/models/character.glb
```

The file is **not** in the repository. Until it exists, an abstract 3D
placeholder is shown that waves, breathes and tracks the cursor exactly like the
real model will. Drop the GLB in and it is picked up automatically — no code
change. (`public/models/README.md` repeats this next to the folder.)

### Animations

The character runs a small state machine:

```
INITIALIZING → GREETING → IDLE → TRACKING
```

* **Greeting** — a clip whose name contains `greet`, `wave`, `hello`, `hallo` or
  `salud`. Played once. The transition out of it is driven by the animation
  mixer's own `finished` event, i.e. the real clip length, not a guessed
  `setTimeout`.
* **Idle** — a clip containing `idle`, `breath`, `stand` or `loop`. Cross-faded
  in when the greeting ends and looped from there.
* **Tracking** — enabled only once the greeting is over, and blended in over
  0.8 s so it never snaps on.

Missing clips degrade quietly: with no greeting the character starts in idle;
with no clips at all it simply stands there.

### Cursor tracking

`src/components/Character/useMouseTracking.ts` normalises the pointer to
`-1…1`, applies frame-rate-independent exponential damping, and never touches
React state — nothing in the render loop causes a re-render.

Amplitude is layered per body part so the motion reads as a person looking at
something rather than a prop being rotated. Limits live in the same file:

```ts
MAX_EYE_ROTATION   0.34 rad   // eyes move most
MAX_HEAD_ROTATION  0.42 rad
MAX_NECK_ROTATION  0.16 rad
MAX_TORSO_ROTATION 0.06 rad   // barely moves
DAMPING            5.2        // higher = snappier
```

Vertical range is `VERTICAL_SCALE` (0.62) of the horizontal one — necks nod less
than they turn.

On touch devices there is no cursor, so tracking falls back to a slow
figure-eight drift instead of pretending to follow something.

### Bone names

Bones are discovered by name, case-insensitively, ignoring `mixamorig:`
prefixes and any `.`, `_`, `-` or spaces. Recognised out of the box:

| Part | Names it looks for |
| --- | --- |
| Head | `Head`, `head`, `Kopf`, `cabeza`, … |
| Neck | `Neck`, `neck`, `Hals`, `cuello`, … |
| Torso | `Spine`, `Chest`, `UpperChest`, `torso`, `body` |
| Eyes | `LeftEye`/`RightEye`, `Eye_L`/`Eye_R`, `eye.l`/`eye.r`, or a single `Eyes` node |

To support a differently named rig, add the name to `BONE_CANDIDATES` in
`src/components/Character/bones.ts`. A missing bone is skipped, never an error.

---

## Translations

All interface copy lives in **`src/i18n/translations.ts`** — Spanish, English and
German. Spanish is the default and also defines the type every other language
must satisfy, so adding a key to `es` makes the compiler demand it in `en` and
`de` too.

Switching language updates the copy, `<html lang>`, the document title and the
meta description without a reload, and the choice is stored in `localStorage`
under `jw-language`.

Project titles and descriptions are content rather than interface, so they live
with the rest of the project data (see below) — already translated per language.

---

## Dark mode

Toggle at the top right, next to the language island. **Light is the default.**
The choice is stored in `localStorage` under `jw-theme`, and a tiny inline
script in `index.html` applies it before first paint so there is no flash.

Colours are design tokens in `src/styles/tokens.css`: light values on `:root`,
dark values on `[data-theme="dark"]`. Components never hardcode a colour, so
adjusting the palette is a single-file job.

---

## Projects

Edit **`src/data/projects.ts`**. Each entry has:

```ts
{
  id: 'project-01',
  title:       { es: '…', en: '…', de: '…' },
  description: { es: '…', en: '…', de: '…' },
  technologies: ['Java', 'Spring'],
  image: 'images/my-project.jpg', // file in public/images — no leading slash
  url: 'https://…',               // null while there is nothing to link to
  placeholder: false,             // true shows the "placeholder" badge
}
```

The three current entries are placeholders and are visibly marked as such.
Cover images go in `public/images/`; without one, a generated cover is used.

---

## Contact form (Web3Forms)

The form posts with `fetch` to `https://api.web3forms.com/submit` — the page is
never left, and loading / success / error are all rendered inline. There is no
backend.

**To change the destination inbox**, replace the access key in
**`src/config/web3forms.ts`**:

```ts
export const WEB3FORMS_ACCESS_KEY = '…'   // get one at https://web3forms.com
export const WEB3FORMS_SUBJECT    = 'Neue Nachricht über dein Portfolio'
export const WEB3FORMS_FROM_NAME  = 'Portfolio-Kontaktformular'
```

The key is visible in the built JavaScript. That is how Web3Forms is designed to
work for static sites: the key only permits submissions to the inbox it is bound
to. A hidden honeypot field filters out most bots.

Social links (LinkedIn, GitHub) are in `src/config/site.ts`.

---

## Accessibility

Keyboard navigable throughout, with a skip link, visible focus rings, labelled
form fields, `aria-live` feedback on submit and `aria-label`s on the icon-only
controls. `prefers-reduced-motion: reduce` removes the entrance animations, the
greeting and the cursor tracking, and drops the 3D canvas to a single rendered
frame.

---

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds and deploys on every push to `main`.

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub
Actions**.

The workflow derives the Vite base path from the repository name, so nothing is
hardcoded:

* `<owner>.github.io` → served at `/`
* any other repository → served at `/<repo>/`

To build with a specific base path locally:

```bash
BASE_PATH=/my-repo/ npm run build
```

---

## Still to add

Nothing below is invented or filled in with placeholder facts — these are yours
to supply:

- [ ] `public/models/character.glb` — the rigged character with `Greeting` and
      `Idle` clips
- [ ] Real projects in `src/data/projects.ts`
- [ ] Project cover images in `public/images/`
- [ ] A public email address, if you want one shown next to the form
- [ ] A final professional description, if you want to replace the current
      About copy
- [ ] Photographs of yourself, if you want any
- [ ] An Open Graph share image (`og:image` is deliberately not set yet)
