# Images

## `jason.jpg` — the portrait in the About section

Drop the photo here as **`jason.jpg`**. It is rendered above the "at a glance"
panel, cropped to a 4:5 portrait, and the section falls back to no image at all
if the file is missing — so nothing breaks while it is not there.

A ~1200px-wide JPEG at quality 80 is plenty; it is lazy-loaded and only ever
displayed at about 380px wide.

To use a different filename or position, see `Portrait` in
`src/components/About/About.tsx` (the `object-position` in `about.css` controls
how the crop sits on the face).

## Project covers

Cover images for `src/data/projects.ts` also live in this folder. Reference them
without a leading slash — `image: 'images/my-project.jpg'` — so they keep
working under any GitHub Pages base path.
