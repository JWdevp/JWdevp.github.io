# Project screenshots

Put screenshots of a project here, then list them in that project's `detail.images`
array in `src/data/projects.ts`:

```ts
detail: {
  images: [
    'images/projects/buergermeisterverzeichnis-01.png',
    'images/projects/buergermeisterverzeichnis-02.png',
  ],
}
```

Paths are relative to `public/` and carry **no leading slash**, so they keep
working under any GitHub Pages base path.

They are shown in a responsive grid inside the project dialog, at roughly
600–900px wide on a desktop. PNG for interface screenshots, JPEG for anything
photographic; around 1600px wide is plenty. A file that fails to load removes
itself, so an entry that is not there yet breaks nothing.

The **first** image in the list does double duty: it is also the hover preview
on the project card in the grid, cross-faded in over the client's mark. Wide
screenshots work well there — the card crops from the top-left.

## Client mark on the card

At rest the card shows the client's name, set in type. To show a logo instead,
put the file here and point `logo` at it in `src/data/projects.ts`:

```ts
logo: 'images/projects/landesamt-logo.png',
```

A transparent PNG or an SVG works best. A logo that fails to load falls back to
the client's name, so pointing at a file that is not there yet breaks nothing.

**The Bürgermeisterverzeichnis card already points at
`landesamt-logo.png`** — put the Landesamt PNG here under exactly that name and
it appears. Avoid spaces in the filename; they have to be percent-encoded in a
URL and are easy to get wrong.

Bear in mind that an official emblem is someone else's mark: showing a client's
logo in a portfolio is common, but it is your call to make.

## Bürgermeisterverzeichnis

Present: the Wahlterminliste (Haupt- and Stichwahlen) and the breakdown for one
Wahltermin. Still worth adding:

3. The table with a column being sorted or filtered.
4. A row mid-edit, showing the inline AJAX editing.
5. The incomplete-records filter switched on.

Blur or replace any personal data before committing — these are screenshots of
an internal government application, and this repository is public.
