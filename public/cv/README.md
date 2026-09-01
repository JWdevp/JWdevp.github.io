# CV

The About section offers a download button for the CV. It points at:

```
public/cv/jason-wiersum-lebenslauf.pdf
```

Put the PDF here under exactly that name and the button appears. The path is
`SITE.cv` in `src/config/site.ts` if you would rather call it something else.

**Avoid spaces in the filename.** They have to be percent-encoded in a URL and
are easy to get wrong; `src/data/` is also the wrong place for it — anything the
browser downloads has to be under `public/`, which is copied to the site as-is.

The button checks that the file is really served before it renders — it asks for
the headers and looks for a PDF content type, not just a 200, because a host
with an SPA fallback answers unknown paths with the page itself. So a missing
file leaves no button rather than a download that fails.
