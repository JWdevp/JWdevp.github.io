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

## `final.mp4` — the character source

This is the original the character is cut from, and the only reason it is in the
repository. **No page ever requests it** — nothing fetches it and nothing plays
it in the browser. Everything under `public/` is copied verbatim into `dist/`,
though, so the 2.8 MB does land on the deploy without ever being downloaded by a
visitor. If that ever matters, move the file out of `public/` and point
`SOURCE` in `scripts/build-character.py` at the new location; it is a build
input, not a site asset.

`scripts/build-character.py` reads it and writes `public/character/frames.webp`,
`public/character/still.webp` and `src/components/Character/manifest.json`. Keep it here unmodified so the
character can be rebuilt — at a different frame count, size or quality — without
having to source the video again.
