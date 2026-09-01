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
│   ├── Character/     frame sheet + manifest, gaze tracking
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
├── character/         frames.webp · still.webp — built, do not edit by hand
└── images/            final.mp4 (character source) · portrait · project shots

scripts/
└── build-character.py final.mp4 → frames.webp + still.webp + manifest.json
```

The page has four sections — `#home`, `#work`, `#about`, `#contact` — in one
document. There is no router: navigation is smooth scrolling, and the active
item is detected with an `IntersectionObserver`.

---

## The character

A 2D character taken from `public/images/final.mp4`. There is no 3D: no
Three.js, no WebGL, no canvas. It is one `<img>` — a sheet holding the clip's
frames in order — and the cursor decides where in the clip to be.

### The idea

The cursor does not pick a picture. It picks a **position in the clip**, and the
runtime walks there **one frame at a time**. Every step is therefore two frames
that were filmed next to each other, so what plays is movement that was actually
recorded: the head turning, not a cut between two stills.

That is the whole difference from the first attempt, which kept 36 poses chosen
for how different they looked and jumped to the best match. Measured on the
frames themselves:

| | mean pixel difference per step | p99 |
| --- | --- | --- |
| adjacent recorded frames | 1.6 / 255 | 24 |
| every 2nd frame (what ships) | 2.7 | 42 |
| 36 poses chosen by appearance | 10.0 | 132 |

Nothing crossfades — two frames are never mixed, so there is no ghosting. The
smoothness comes from the steps being small, not from blending.

### Why not the video element

Driving `video.currentTime` from an animation frame does not work: seeks are
asynchronous and coalesce, so the element presents a small fraction of the
frames asked for. A sheet is one decode and then a transform per frame, which is
exact and costs nothing per step.

### How the asset is built

`scripts/build-character.py` turns the video into three files:

```
public/character/frames.webp              # the clip, in order, one sheet
public/character/still.webp               # one frame, for touch devices
src/components/Character/manifest.json    # sheet geometry + per-frame gaze
```

```bash
python3 scripts/build-character.py                    # 120 frames, 400px
python3 scripts/build-character.py --frames 240 --width 400   # smoother, ~4 MB
```

It needs `ffmpeg` on `PATH` and `pillow`, `numpy`, `scipy`. The video is never
shipped to the browser and never played — it is the reference original.

What the script does:

1. **Extract** all 240 frames (1280×720, 24 fps, 10 s).
2. **Keep N of them evenly spaced, in filming order.** Not a selection by
   appearance — that is the point.
3. **Measure gaze** per frame from the pupils, so the runtime knows where each
   frame is looking.
4. **Matte** each one. The backdrop is a warm grey gradient, not white, and the
   sweater is brighter than it in places and darker in others, so no brightness
   threshold works. A degree-3 polynomial is fitted per channel to the frame
   borders to predict the backdrop, and the silhouette is where the frame
   departs from that prediction. Nothing keys on "is this pixel white", so the
   eyes, the sweater and the highlights survive.
5. **Unmix** the soft edge — `(pixel − (1−α)·backdrop) / α` — so no pale fringe
   glows against a dark page.
6. **Compose** the sheet, each frame in a cell with an 8 px transparent gutter
   so compression and sub-pixel sampling cannot bleed one frame into the next.

### Size, and why touch devices do not pay it

120 frames at 400 px is a 4576×4620 sheet — 2.0 MB, 21 megapixels, about 80 MB
decoded. Desktop handles that comfortably; a phone would not, and iOS silently
downsamples very large images, which would break the sheet's alignment.

It never has to. Tracking needs a cursor, so on a coarse pointer the sheet is
never fetched and `still.webp` (21 KB) is shown instead.

Raising `--frames` improves smoothness and costs roughly linearly: 240 frames at
400 px is about 4 MB and 41 MP, which is past what is comfortable to hold
decoded. 120 is the balance point.

### Cursor tracking

The pointer writes a target; a `requestAnimationFrame` loop eases the current
gaze towards it, picks the frame to aim for, and steps towards it. Nothing runs
inside the `mousemove` handler and no React state is involved.

Gaze smoothing is exponential and frame-rate independent (`1 − e^(−k·Δt)`), so
it feels the same at 60 Hz and 144 Hz. Both axes track, measured from the centre
of the character, with a radial dead zone so a parked cursor cannot make the
character drift.

`MAX_TRAVEL` caps how fast the clip may run. That cap is what guarantees the
walk passes through the frames in between rather than skipping over them.

The character never moves: no translate, no scale, no rotation, no parallax.
Only which frame is shown changes.

### Tuning

Every knob lives in `src/components/Character/characterConfig.ts`, documented in
place:

| | |
| --- | --- |
| `LAYOUT.width`, `maxWidth`, `mobileMaxWidth` | size |
| `LAYOUT.offsetX`, `offsetY` | position |
| `SENSITIVITY.x`, `.y` | how far the cursor travels for a full look |
| `DEAD_ZONE` | the still area around centre |
| `SMOOTHING` | how fast the aimed-at gaze follows the pointer |
| `FOLLOW`, `MAX_TRAVEL` | how fast the character walks there |
| `LOCALITY` | preference for a nearby frame over a distant equal match |

Frame count, size and quality are arguments to the build script.

### What the source video can and cannot do

The subject never looks up-and-right, so that corner of the cursor plane has no
matching frame and the nearest sensible one is used. The gaze match weights
horizontal error 2.5× vertical (`GAZE_WEIGHT_X`), because looking the wrong way
left/right reads as an error while a shallow nod does not.

There are no blinks in the clip, so there are none on the page.

One pair of kept frames spans a fast head movement and steps further than the
rest (0.61 of gaze against a 0.14 average). It is real recorded motion, and even
that step changes fewer pixels than the *average* step of the old pose-based
build.

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
