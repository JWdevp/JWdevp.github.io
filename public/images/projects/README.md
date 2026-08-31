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

## Bürgermeisterverzeichnis

Worth capturing, in this order:

1. The date list, with Hauptwahlen and Stichwahlen separated.
2. The Landkreis / kreisfreie Stadt breakdown for one election date.
3. The table with a column being sorted or filtered.
4. A row mid-edit, showing the inline AJAX editing.
5. The incomplete-records filter switched on.

Blur or replace any personal data before committing — these are screenshots of
an internal government application, and this repository is public.
