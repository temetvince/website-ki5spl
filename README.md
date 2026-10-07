# ki5spl.com

KI5SPL's amateur radio site: a single-page React + TypeScript app that shows
the US amateur band plan for a chosen license class, with every frequency of
interest inside that class's privileges. Pick Technician, General, or Extra;
each band then becomes a vertical bar with the slices you may use coloured by
mode family, the slices nobody may use hatched, and every frequency of
interest tagged off the bar.

The list of frequencies was drawn up with Parks on the Air activations in
mind, but the site is not specific to that program. The same list serves
anyone choosing where to operate: it says where digital modes, calling
frequencies, beacons, nets, SSTV, and automatic stations live, so you can go
there or steer clear.

## Running Locally

To run the website locally, use the following commands:

* `npm install`
* `npm start`

The site is served at `http://localhost:3000` in development mode.

## Building for Production

To build the website for production, use the following command:

* `npm run build`

This runs every gate — lint, format, docs, typecheck — and then bundles in
production mode: minified, no source maps, and with a content hash in the
bundle filename so a host can cache it indefinitely.

## Publishing

`npm run build` writes everything the site needs into `dist/`. That folder is
the complete, self-contained deployable: upload its **contents** to the root of
any static host. The site is hosted on AWS. The GitHub Actions workflow in
[`.github/workflows/build.yml`](.github/workflows/build.yml) runs the full build
on every push and pull request and attaches `dist/` to the run as an artifact
named `dist`; it does not deploy.

A published build contains:

| File | What it is |
| --- | --- |
| `index.html` | The page shell. Loads the bundle. |
| `index_bundle.<hash>.js` | React, the app, both data sets, and all CSS. |
| `favicon.ico` | Copied verbatim from `public/`. |

Three things are worth knowing before you deploy:

1. **Anything you put in `public/` is copied into `dist/` as-is**, apart from
   `index.html`, which is the template webpack builds the real page from. A
   `robots.txt` placed there will ship.
2. **The site is a single route (`/`).** It needs no server-side rewrite
   rules. The chosen license class travels in the query string, as
   `?class=general`, and a band anchor such as `#band-40-m` scrolls to that
   band on load, so a link to a particular class and band works on any static
   host. The host only has to serve `index.html` for `/`.
3. **Cache the bundle forever and the shell briefly.** The bundle's filename
   carries a content hash, so it can be served with a long `Cache-Control`
   max-age; `index.html` is what changes between releases and should be served
   with a short one, or invalidated on each deploy.

## How the page is built

The page is composed in [`src/website/Home/Home.tsx`](src/website/Home/Home.tsx)
from three kinds of module:

* **Data**, in [`src/data/`](src/data/). Two tables, each a plain TypeScript
  array checked against an interface at compile time:
  [`bandPlan.ts`](src/data/bandPlan.ts) holds the FCC privileges and ARRL
  voluntary plan, one row per slice of each band, with a hand-chosen mode
  family per row; [`frequenciesOfInterest.ts`](src/data/frequenciesOfInterest.ts)
  holds the frequencies of interest, one row per dial or narrow range. The
  row contracts are in [`types.ts`](src/data/types.ts).
* **Logic**, in [`src/bandplan/`](src/bandplan/).
  [`buildBandViews.ts`](src/bandplan/buildBandViews.ts) turns the two tables
  into one view per band for a given class, and
  [`formatFrequency.ts`](src/bandplan/formatFrequency.ts) prints frequencies
  in the unit a ham reads them in.
* **Presentation**, in [`src/website/`](src/website/). Every component takes
  props and renders markup; none of them reads the data or the URL. All copy
  lives in [`HomeContent.ts`](src/website/Home/HomeContent.ts).

### What a band figure shows

For the chosen class, each band's figure has three parts:

* **The bar**, running down the left, to scale. The band's full extent is a
  bare track. Each slice the class may use is filled with its mode family's
  colour: CW only; data and CW; phone, image, and CW; or all modes and shared
  use, which covers all-modes slices and repeater, link, control, and
  satellite segments. Each slice nobody may use is hatched — these are beacon
  and experimental guards. A slice open to other classes but not the chosen
  one is left as bare track.
* **The marks**, in a narrow column beside the bar: an ink tick for each
  frequency of interest, or an ink bar for a range.
* **The tags**, to the right, in frequency order. Each is one line and a
  disclosure: closed, a slice's tag shows its swatch, range, modes, and power,
  and a mark's tag shows its frequency, sideband, and activity; open, the tag
  adds the family name or the reason and notes. Every mark's tag sits beneath
  the slice it belongs to and wears that slice's colour on its left edge. A
  leader line joins each tag to its place on the bar.

The bar is linear except where tags would collide. There it stretches by
exactly the room the tags need, so a cluster of digital dials a few kHz apart
opens out into readable lines, the rest of the band keeps its proportions, and
a leader runs level from the bar to its tag wherever the tag has a frequency
to itself. Every tick and slice edge is drawn where its frequency truly sits.
When two tags share a frequency, such as the beacon at 18.110 MHz and the
phone slice that begins there, the bar is not stretched between them: the
second tag stacks beneath the first and its leader slants back to the one
true point.

A frequency of interest is shown only when it overlaps a slice drawn on
the bar, so a General never sees the SSTV center at 7.171 MHz, which sits in
the Extra phone segment, but does see the beacon at 14.100 MHz, which sits
inside the General band. A band in which the class holds no privilege at all
is left out of the page and the index, so a Technician never sees 20 m.

The four family colours were chosen with a colour-vision validator so every
pair stays distinguishable under red-green and blue-yellow deficiency against
the dark track, and every family also carries its name in text beside the
swatch.

The site ships in one edition, dark, styled as an instrument panel: a single
monospace face, charcoal surfaces, and a phosphor-green accent. There is no
light theme; the `color-scheme` meta tag and the root stylesheet both declare
dark so the browser draws its own controls to match.

### Where the frequencies of interest come from

Each band's list is the union of two sources:

1. Every row of `frequenciesOfInterest.ts` for that band.
2. Every activity-center row of `bandPlan.ts` for that band whose exact
   range the first source does not already carry.

When both sources name the same range, the first wins, so no frequency is
listed twice. A mark whose range is exactly a do-not-transmit slice of the band
plan, such as the beacon at 14.100 MHz, is dropped too: the slice's own tag
already says it. Activity centers added from the band plan carry no sideband,
because the band plan does not record one.

## Updating the data

Both tables are ordinary TypeScript: edit a row, add a row, or delete one, and
`npm run build` checks the result. Frequencies are stored in kHz, so
14.074 MHz is written `14074` and 1.8366 MHz is written `1836.6`. A row whose
three privileges are all `'no'` is treated as a do-not-transmit guard and must
carry the `beacon` family; every other row names the family its modes belong
to.

When the data is refreshed against a newer ARRL chart, update the chart date in
the `dateline` entry of
[`HomeContent.ts`](src/website/Home/HomeContent.ts) and in the doc comment at
the top of [`bandPlan.ts`](src/data/bandPlan.ts).

## Updates

Updating provided by npm-check-updates:

* `npm run update`
