/**
 * The license classes the band plan covers, in ascending order of privilege.
 * Novice and Advanced are not represented in the data.
 */
export const licenseClasses = ['technician', 'general', 'extra'] as const;

/** One of the three license classes in {@link licenseClasses}. */
export type LicenseClass = (typeof licenseClasses)[number];

/**
 * Narrows an arbitrary string, such as a URL parameter or a stored
 * preference, to a {@link LicenseClass}. `null` never matches.
 *
 * @param value - Text from an untrusted source.
 * @returns `true` only when `value` is exactly one of {@link licenseClasses}.
 */
export function isLicenseClass(value: string | null): value is LicenseClass {
  return (
    value !== null && (licenseClasses as readonly string[]).includes(value)
  );
}

/**
 * The families a slice of spectrum is coloured by, in legend order. `beacon`
 * is reserved for slices nobody may transmit in; the other four describe the
 * widest kind of emission the voluntary plan puts there.
 */
export const modeFamilies = [
  'cw',
  'data',
  'phone',
  'shared',
  'beacon',
] as const;

/** One of {@link modeFamilies}. */
export type ModeFamily = (typeof modeFamilies)[number];

/**
 * What a license class may do in a segment. `'yes, 200 W PEP'` is Technician
 * HF access, which carries a 200 W PEP ceiling in place of the segment's
 * `maxPower`. Any other power limit is expressed through `maxPower`.
 */
export type Privilege = 'no' | 'yes' | 'yes, 200 W PEP';

/**
 * One row of the US band plan.
 *
 * Invariants: `startKhz <= endKhz` when `endKhz` is a number; `endKhz` is
 * `null` only for an allocation with no upper edge. A row where all three
 * classes are `'no'` is a beacon or experimental guard, not a class privilege:
 * its `maxPower` reads `'do not transmit'` and its `family` is `'beacon'`, and
 * no other row uses that family. An `'allocation'` row is a slice of the band
 * with an FCC privilege attached; an `'activity-center'` row is a voluntary
 * calling frequency or window inside one, and never adds a privilege the
 * enclosing allocation lacks.
 */
export interface BandPlanSegment {
  /** Band name as hams say it, such as `'20 m'` or `'70 cm'`. */
  readonly band: string;
  /** Lower edge, in kHz. */
  readonly startKhz: number;
  /** Upper edge, in kHz, or `null` when the allocation has no upper edge. */
  readonly endKhz: number | null;
  readonly kind: 'allocation' | 'activity-center';
  /** Modes the ARRL voluntary plan assigns here, as written in the plan. */
  readonly mode: string;
  /**
   * The family `mode` belongs to, chosen by hand when a row is added: `cw`
   * for CW-only slices, `data` for CW and data, `phone` for phone and image,
   * `shared` for all-modes slices and for repeater, link, control, and
   * satellite use.
   */
  readonly family: ModeFamily;
  readonly technician: Privilege;
  readonly general: Privilege;
  readonly extra: Privilege;
  /** Power ceiling for General and Extra, or `'do not transmit'`. */
  readonly maxPower: string;
  readonly notes: string;
}

/**
 * One frequency, or narrow range, where a particular activity expects to be
 * found.
 *
 * Invariants: `startKhz <= endKhz`, and the two are equal for a single dial
 * frequency. `band` names the band in the same form as
 * {@link BandPlanSegment.band}, which is how an entry is matched to its band.
 */
export interface InterestEntry {
  readonly band: string;
  readonly startKhz: number;
  readonly endKhz: number;
  /** The mode or activity that lives here, such as `'FT8'`. */
  readonly activity: string;
  /** Sideband or emission the activity uses, as written in the source. */
  readonly sideband: string;
  /** Why the frequency matters to someone choosing where to operate. */
  readonly reason: string;
  readonly notes: string;
}
