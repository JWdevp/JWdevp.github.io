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
│   ├── Character/     sprite sheet + manifest, gaze tracking
│   ├── Hero/          first screen
│   ├── About/         biography, facts panel, the four creative pillars
│   ├── Skills/        technologies by category + spoken languages
│   ├── Projects/      grid + project card   (Skills + Projects make up #work)
│   ├── Contact/       section + Web3Forms form
│   └── Layout/        footer, background ambience
├── hooks/             theme · language · section observer · scroll · reveal
├── i18n/              translations.ts  ← every interface string
├── data/              projects.ts · skills.ts
├── config/            site.ts (personal data, links) · web3forms.ts
└── styles/            tokens.css (design system) · globals.css

public/
├── character/         sprite.webp — built, do not edit by hand
└── images/            final.mp4 (character source) · portrait · project shots

scripts/
└── build-character.py final.mp4 → sprite.webp + manifest.json
```

The page has four sections — `#home`, `#work`, `#about`, `#contact` — in one
document. There is no router: navigation is smooth scrolling, and the active
item is detected with an `IntersectionObserver`.

---

## The character

A 2D character cut from `public/images/final.mp4`. There is no 3D: no Three.js,
no WebGL, no canvas. It is one `<img>` — a sprite sheet of head poses — and the
cursor chooses which pose to show.

### How the asset is built

`scripts/build-character.py` turns the video into two files:

```
public/character/sprite.webp              # the poses, one grid
src/components/Character/manifest.json    # geometry + the cursor lookup
```

```bash
python3 scripts/build-character.py --poses 36 --width 480 --quality 76
```

It needs `ffmpeg` on `PATH` and `pillow`, `numpy`, `scipy`. The video itself is
never shipped and never played in the browser — it is the reference original and
stays in the repository untouched.

What the script does, in order:

1. **Extract** all 240 frames (1280×720, 24 fps, 10 s).
2. **Measure gaze** per frame from the pupils, so poses are chosen by where the
   character is looking rather than by timestamp — the video does not spend one
   second per direction.
3. **Pick poses** by farthest-point sampling in gaze space, so the 36 kept
   frames spread over the whole range instead of clustering.
4. **Matte** each one. The backdrop is a warm grey gradient, not white, and the
   sweater is brighter than the backdrop in places and darker in others, so no
   brightness threshold works. Instead a degree-3 polynomial is fitted per
   channel to the frame borders, giving a *predicted backdrop* for every pixel;
   the silhouette is where the frame departs from that prediction, grown with a
   hysteresis threshold. Nothing keys on "is this pixel white", so the eyes,
   the sweater and the highlights survive.
5. **Unmix** the soft edge — `(pixel − (1−α)·backdrop) / α` — so no pale fringe
   survives to glow against a dark page.
6. **Compose** the sheet, each pose in a cell with an 8 px transparent gutter so
   lossy compression and sub-pixel sampling cannot bleed one pose into the next.
7. **Bake the lookup**: for each cell of a 33×33 cursor grid, the pose whose
   gaze matches. The runtime does one array read, no search.

### Cursor tracking

The pointer writes a target; a `requestAnimationFrame` loop eases the current
gaze towards it and picks a pose. Nothing runs inside the `mousemove` handler
and no React state is involved, so moving the mouse costs one assignment.

Smoothing is exponential and frame-rate independent (`1 − e^(−k·Δt)`), so it
feels the same at 60 Hz and 144 Hz. Both axes track, measured from the centre of
the character, with a radial dead zone so a parked cursor cannot make the pose
twitch.

The character never moves: no translate, no scale, no rotation, no parallax.
Only which frame is shown changes.

On a coarse pointer (`(pointer: fine)` not matching) tracking is off entirely
and the character rests at centre — there is no cursor to follow, and touch,
accelerometer and gyroscope are deliberately not used.

### Tuning

Every knob lives in `src/components/Character/characterConfig.ts`, documented in
place:

| | |
| --- | --- |
| `LAYOUT.width`, `maxWidth`, `mobileMaxWidth` | size |
| `LAYOUT.offsetX`, `offsetY` | position |
| `SENSITIVITY.x`, `.y` | how far the cursor travels for a full look |
| `DEAD_ZONE` | the still area around centre |
| `SMOOTHING` | follow speed |
| `MAX_GAZE` | how far the gaze is allowed to go |

Asset quality and pose count are arguments to the build script; `GAZE_WEIGHT_X`
in it decides how much horizontal accuracy is worth relative to vertical.

### What the source video can and cannot do

The subject never looks up-and-right, so that corner of the cursor plane has no
matching pose and is approximated by the nearest one. The lookup weights
horizontal error 2.5× vertical, because looking the wrong way left/right reads
as an error while a shallow nod does not. Vertical range on the right side is
weak for the same reason.

There are no blinks in the video, so there are none in the sprite.

---


## Translations

All interface copy lives in **`src/i18n/translations.ts`** — Spanish, English and
German. German is the default; Spanish defines the type every other language
must satisfy, so adding a key to `es` makes the compiler demand it in `en` and
`de` too.

Switching language updates the copy, `<html lang>`, the document title and the
meta description without a reload, and the choice is stored in `localStorage`
under `jw-language`.

Project titles and descriptions are content rather than interface, so they live
with the rest of the project data (see below) — already translated per language.

---

## Scroll transitions

Each top-level section owns one scrubbed GSAP timeline covering its whole
passage through the viewport: it rises and resolves as it arrives, holds at full
strength while it is being read, then settles back and dims as it leaves. One
timeline per section means the arriving and departing phases can never fight
over the same properties. Tuned in `src/hooks/useSectionTransitions.ts`.

Inside a section, `src/hooks/useReveal.ts` staggers the individual elements.

## Dark mode

Behind the gear at the top right, alongside the language island: the two slide
out together and the gear becomes a chevron that puts them back. **Light is the
default.**
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
controls.

`prefers-reduced-motion: reduce` removes every autonomous animation: the
entrance reveals, the scroll transitions, the greeting wave, the idle float, the
breathing and the blinking. The render loop itself stays live so the character's
gaze still follows the pointer — that motion is small, user-driven and stops the
moment the pointer does. (An earlier version froze the canvas entirely here,
which just looked broken.)

---

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds and deploys on every push to `main`.

### Required one-time setting

**Settings → Pages → Build and deployment → Source: `GitHub Actions`.**

This is not optional. With the default `Deploy from a branch`, GitHub publishes
the repository *as it is* — so visitors receive the development `index.html`,
whose entry point is `/src/main.tsx`, and the browser has nothing it can run.
The result is a blank white page.

You can tell which mode is active from the Actions tab. Under `Deploy from a
branch` there is a second, GitHub-generated run called **“pages build and
deployment”** alongside our **“Deploy to GitHub Pages”**. Both publish, and
whichever finishes last wins — so the site can even flip between working and
blank between deploys. Once the source is set to `GitHub Actions`, only our
workflow runs.

If the deployed page is ever blank, it says so itself: an inline fallback in
`index.html` detects that the source is being served and prints the fix on the
page after a few seconds.

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

- [ ] Real projects in `src/data/projects.ts`
- [ ] Project cover images in `public/images/`
- [ ] A public email address, if you want one shown next to the form
- [ ] A final professional description, if you want to replace the current
      About copy
- [ ] Photographs of yourself, if you want any
- [ ] An Open Graph share image (`og:image` is deliberately not set yet)
