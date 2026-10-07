import { bandPlan } from '../data/bandPlan';
import { frequenciesOfInterest } from '../data/frequenciesOfInterest';
import type { BandPlanSegment, LicenseClass, ModeFamily } from '../data/types';

/** The spectrum region a band sits in, used to group bands on the page. */
export type BandGroup = 'LF and MF' | 'HF' | 'VHF' | 'UHF' | 'Microwave';

/**
 * A slice of a band as it applies to one license class. `'allowed'` means
 * the class may transmit here; `'no-transmit'` means nobody may, because the
 * slice is a beacon or experimental guard. `family` is `'beacon'` exactly
 * when `status` is `'no-transmit'`.
 */
export interface SegmentView {
  readonly startKhz: number;
  /** `null` when the slice has no upper edge. */
  readonly endKhz: number | null;
  readonly status: 'allowed' | 'no-transmit';
  /** Modes the voluntary plan assigns to the slice. */
  readonly mode: string;
  /** Colour family of the slice; see {@link ModeFamily}. */
  readonly family: ModeFamily;
  /** Power ceiling for the class in question, or `'do not transmit'`. */
  readonly power: string;
  readonly notes: string;
}

/**
 * A frequency, or narrow range, inside the class's privileges where a
 * particular activity expects to be found. `sideband` is `null` for a mark
 * that comes from the band plan's activity centers rather than the interest
 * list, which does not record one. `family` is that of the first slice in
 * the band's `segments` the mark overlaps, so a row can wear its slice's
 * colour.
 */
export interface MarkView {
  readonly startKhz: number;
  readonly endKhz: number;
  readonly activity: string;
  readonly sideband: string | null;
  readonly reason: string;
  readonly notes: string;
  readonly family: ModeFamily;
}

/**
 * Everything the page needs to draw and list one band for one license class.
 *
 * Invariants: `segments` and `marks` are sorted by `startKhz`; `segments`
 * holds at least one `'allowed'` slice and otherwise only `'no-transmit'`
 * slices, so a slice open to other classes but not this one is absent and
 * reads as a gap; `marks` holds exactly the marks that overlap some slice in
 * `segments`.
 */
export interface BandView {
  /** Band name as hams say it, such as `'20 m'`. */
  readonly name: string;
  /** Stable element id for in-page links, derived from `name`. */
  readonly id: string;
  readonly group: BandGroup;
  /** Lower edge of the whole band, across all classes, in kHz. */
  readonly startKhz: number;
  /** Upper edge of the whole band, in kHz, or `null` when open-ended. */
  readonly endKhz: number | null;
  readonly segments: readonly SegmentView[];
  readonly marks: readonly MarkView[];
}

/** Bands sharing a {@link BandGroup}, in ascending frequency order. */
export interface BandGroupView {
  readonly group: BandGroup;
  readonly bands: readonly BandView[];
}

function groupOf(startKhz: number): BandGroup {
  if (startKhz < 1800) {
    return 'LF and MF';
  }
  if (startKhz < 30_000) {
    return 'HF';
  }
  if (startKhz < 300_000) {
    return 'VHF';
  }
  if (startKhz < 3_000_000) {
    return 'UHF';
  }
  return 'Microwave';
}

function isNoTransmit(segment: BandPlanSegment): boolean {
  return (
    segment.technician === 'no' &&
    segment.general === 'no' &&
    segment.extra === 'no'
  );
}

/**
 * Whether a mark falls inside a slice. A single frequency counts when it sits
 * anywhere in the slice, edges included. A range must share more than an
 * edge: a window that ends exactly where a slice begins lies outside it.
 */
function overlaps(
  startKhz: number,
  endKhz: number,
  slice: SegmentView,
): boolean {
  if (startKhz === endKhz) {
    return (
      startKhz >= slice.startKhz &&
      (slice.endKhz === null || startKhz <= slice.endKhz)
    );
  }
  return (
    endKhz > slice.startKhz &&
    (slice.endKhz === null || startKhz < slice.endKhz)
  );
}

function byStart(
  a: { readonly startKhz: number },
  b: { readonly startKhz: number },
): number {
  return a.startKhz - b.startKhz;
}

function idOf(name: string): string {
  return `band-${name.replaceAll(/\s+/gu, '-')}`;
}

/**
 * Builds the per-band view for one license class from the band plan and the
 * list of frequencies of interest.
 *
 * Bands appear in the order the band plan lists them, which is ascending
 * frequency. A mark is drawn from the interest list, or from a band-plan
 * activity center whose exact range the interest list does not already
 * carry; the interest list wins on a tie, so no frequency is marked twice. A
 * mark whose range is exactly a no-transmit slice is dropped as well, since
 * the slice already says everything the mark would. A band in which the
 * class holds no privilege at all is left out, so a Technician never sees
 * 20 m.
 *
 * @param licenseClass - The class whose privileges decide what is allowed.
 * @returns One {@link BandView} per band the class may use, with the
 *   invariants that type documents.
 */
export function buildBandViews(
  licenseClass: LicenseClass,
): readonly BandView[] {
  const bandNames = [...new Set(bandPlan.map((segment) => segment.band))];

  return bandNames.flatMap((name): readonly BandView[] => {
    const rows = bandPlan.filter((segment) => segment.band === name);
    const allocations = rows.filter((row) => row.kind === 'allocation');
    const startKhz = Math.min(...allocations.map((row) => row.startKhz));
    const endKhz =
      allocations.some((row) => row.endKhz === null) ? null : (
        Math.max(...allocations.map((row) => row.endKhz ?? row.startKhz))
      );

    const unsorted = allocations.flatMap((row): readonly SegmentView[] => {
      const privilege = row[licenseClass];
      if (isNoTransmit(row)) {
        return [
          {
            startKhz: row.startKhz,
            endKhz: row.endKhz,
            status: 'no-transmit' as const,
            mode: row.mode,
            family: 'beacon' as const,
            power: row.maxPower,
            notes: row.notes,
          },
        ];
      }
      if (privilege === 'no') {
        return [];
      }
      return [
        {
          startKhz: row.startKhz,
          endKhz: row.endKhz,
          status: 'allowed' as const,
          mode: row.mode,
          family: row.family,
          power: privilege === 'yes, 200 W PEP' ? '200 W PEP' : row.maxPower,
          notes: row.notes,
        },
      ];
    });
    const segments = unsorted.toSorted(byStart);

    const hasPrivilege = segments.some((slice) => slice.status === 'allowed');
    if (!hasPrivilege) {
      return [];
    }

    const listed = frequenciesOfInterest.filter((entry) => entry.band === name);
    const fromPlan = rows
      .filter(
        (row) =>
          row.kind === 'activity-center' &&
          !listed.some(
            (entry) =>
              entry.startKhz === row.startKhz &&
              entry.endKhz === (row.endKhz ?? row.startKhz),
          ),
      )
      .map((row) => ({
        startKhz: row.startKhz,
        endKhz: row.endKhz ?? row.startKhz,
        activity: row.mode,
        sideband: null,
        reason: 'Activity center in the ARRL band plan',
        notes: row.notes,
      }));
    const fromList = listed.map((entry) => ({
      startKhz: entry.startKhz,
      endKhz: entry.endKhz,
      activity: entry.activity,
      sideband: entry.sideband,
      reason: entry.reason,
      notes: entry.notes,
    }));
    const marks = [...fromList, ...fromPlan]
      .filter(
        (mark) =>
          !segments.some(
            (slice) =>
              slice.status === 'no-transmit' &&
              slice.startKhz === mark.startKhz &&
              (slice.endKhz ?? slice.startKhz) === mark.endKhz,
          ),
      )
      .flatMap((mark): readonly MarkView[] => {
        const host = segments.find((slice) =>
          overlaps(mark.startKhz, mark.endKhz, slice),
        );
        return host === undefined ? [] : [{ ...mark, family: host.family }];
      })
      .toSorted(byStart);

    return [
      {
        name,
        id: idOf(name),
        group: groupOf(startKhz),
        startKhz,
        endKhz,
        segments,
        marks,
      },
    ];
  });
}

/**
 * Partitions band views into their spectrum groups, keeping band order inside
 * each group and listing groups from lowest frequency to highest. A group with
 * no bands is omitted.
 *
 * @param bands - Views in ascending frequency order, as
 *   {@link buildBandViews} returns them.
 */
export function groupBandViews(
  bands: readonly BandView[],
): readonly BandGroupView[] {
  const order: readonly BandGroup[] = [
    'LF and MF',
    'HF',
    'VHF',
    'UHF',
    'Microwave',
  ];
  return order.flatMap((group) => {
    const members = bands.filter((band) => band.group === group);
    return members.length > 0 ? [{ group, bands: members }] : [];
  });
}
