import { type ModeFamily, modeFamilies } from '../../data/types';

/**
 * All copy for the {@link Home} page, kept apart from the markup so the page
 * file stays purely compositional. Everything is exported `as const`: deeply
 * readonly, matching the readonly props contracts of the presentational
 * components.
 */

/** Callsign shown as the brand in the sticky panel bar. */
export const brand = 'KI5SPL';

/** Name set in display type across the top of the page. */
export const mastheadTitle = 'Amateur Radio';

/** Standing tagline printed beneath the masthead title. */
export const mastheadTagline = 'Band Plan · Frequencies of Interest';

/**
 * Dateline entries beneath the masthead, distributed left, center, and right.
 * The chart date is the one fact here that changes: update it when the data
 * is refreshed against a newer ARRL chart.
 */
export const dateline = [
  'ITU Region 2 · United States',
  'Technician · General · Extra',
  'ARRL chart of 13 February 2026',
] as const;

/** Anchor links in the sticky panel bar, in display order. */
export const navItems = [
  { label: 'Bands', path: '#bands' },
  { label: 'About', path: '#about' },
] as const;

/** Page headline, rendered as the page's only `h1`. */
export const headline =
  'Know where you may transmit, and who is already there.';

/** Accessible name for the class toggle's radio group. */
export const classPickerLegend = 'License class';

/** The three classes, in ascending order of privilege. */
export const classOptions = [
  { id: 'technician', label: 'Technician' },
  { id: 'general', label: 'General' },
  { id: 'extra', label: 'Extra' },
] as const;

/** Accessible name for the band index navigation. */
export const bandIndexLabel = 'Bands';

/**
 * Caption for each slice family, printed beside its swatch in the legend and
 * at the head of every slice in a band figure.
 */
export const familyLabels = {
  cw: 'CW',
  data: 'Data and CW',
  phone: 'Phone, image, and CW',
  shared: 'All modes or shared use',
  beacon: 'Do not transmit',
} as const satisfies Readonly<Record<ModeFamily, string>>;

/**
 * The figure legend: one swatch per slice family in {@link modeFamilies}
 * order, then the two kinds of mark. Each `swatch` is a CSS modifier the
 * shared swatch style recognises, and is unique.
 */
export const legendEntries = [
  ...modeFamilies.map((family) => ({
    swatch: family,
    text: familyLabels[family],
  })),
  { swatch: 'mark', text: 'Frequency of interest' },
  { swatch: 'mark-range', text: 'Range of interest' },
] as const;

/** Paragraphs for the "About this page" section, in order. */
export const aboutParagraphs = [
  'The privileges come from FCC Part 97, section 97.301, overlaid with the ARRL voluntary band plan and the ARRL band chart dated 13 February 2026. The frequencies of interest are the centers of activity and known trouble spots that catch a portable operator off guard: every digital-mode dial, every calling frequency, every beacon, the daily and mobile nets, the image modes, and the automatic stations. The list was drawn up with Parks on the Air in mind, but nothing about it is specific to that program. It is the same list whether you are activating a park, hunting for SSTV, or looking for a clear spot to call CQ.',
  'Treat each entry as a center, not a point. Keep about 3 kHz clear either side of a digital or SSTV center, and about 6 kHz either side of an AM calling frequency. Digital dials are upper sideband on every band, including 40 and 80 m, and the activity usually runs from the dial to about 3 kHz above it. Extra-only segments are listed only where a real conflict sits in them.',
  'Stay well inside the edges. The dial reads the carrier, not the signal: a USB voice signal occupies about 3 kHz above the dial, an LSB signal about 3 kHz below, and an AM signal about 6 kHz either side. Every kHz of that must fall inside your privileges, so set the dial at least 3 kHz inside a band or sub-band edge on sideband and at least 6 kHz inside on AM. CW is narrow but still not zero: keep a few hundred hertz. The same arithmetic applies at the edge between a slice you may use and one you may not.',
  'None of these is a legal reservation except the beacon frequencies and the license limits themselves. Activity centers are voluntary, not exclusive channels, and a frequency that is clear is yours to use. This page is a planning aid, not a substitute for the current FCC rules.',
] as const;

/** Standing rules from the band plan, printed as a list beneath the prose. */
export const planRules = [
  'CW is authorized on every frequency a listed class may use.',
  'Maximum power is 1500 W PEP unless a slice says otherwise. Always use the minimum power necessary.',
  'Technician HF is 200 W PEP. Technician has no phone on 80, 40, or 15 m, and no 60, 30, 20, 17, or 12 m.',
  'A do-not-transmit slice is a beacon or experimental guard, not a class privilege.',
  'Repeater subbands on VHF and UHF follow the national ARRL plan and vary by region.',
  'Novice and Advanced privileges are not shown.',
] as const;

/** External references for the "About this page" section. */
export const sources = [
  {
    label: 'ARRL band plan',
    href: 'https://www.arrl.org/band-plan',
  },
  {
    label: 'ARRL US amateur radio bands chart',
    href: 'https://www.arrl.org/frequency-allocations',
  },
  {
    label: '47 CFR 97.301, authorized frequency bands',
    href: 'https://www.ecfr.gov/current/title-47/chapter-I/subchapter-D/part-97/subpart-D/section-97.301',
  },
] as const;

/** Footer line naming the operator and location. */
export const footerLine = 'KI5SPL · Emmett Casey · Joplin, Missouri';
