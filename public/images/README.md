# Images

## The portrait in the About section

The current file is **`sanfran.grey.wide.jpg`**. It is rendered above the
"at a glance" panel, cropped to a 4:5 portrait, and the section falls back to no
image at all if the file is missing — so a rename never breaks the layout, it
just hides the figure.

To swap it, drop the new file in this folder and update `portrait` in
`src/config/site.ts`.

A ~1200px-wide JPEG at quality 80 is plenty; it is lazy-loaded and only ever
displayed at about 380px wide.

How the crop sits on the face is the `object-position` on `.about__portrait img`
in `about.css`.

## Project covers

Cover images for `src/data/projects.ts` also live in this folder. Reference them
without a leading slash — `image: 'images/my-project.jpg'` — so they keep
working under any GitHub Pages base path.
