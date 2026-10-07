import { formatRange } from '../../bandplan/formatFrequency';
import type { ModeFamily } from '../../data/types';
import type { FigureItem } from './figureItems';

/**
 * Contract for {@link BandTag}.
 */
export interface BandTagProps {
  /** The slice or mark this tag names. */
  readonly item: FigureItem;
  /** Caption for each slice family, shown when a slice's tag is open. */
  readonly familyLabels: Readonly<Record<ModeFamily, string>>;
  /**
   * Where the tag sits, as a `top` offset within the figure body, or
   * `undefined` until the figure has measured its tags, when the tag renders
   * at the top.
   */
  readonly style: Readonly<{ readonly top: number }> | undefined;
}

/** Joins the non-empty parts of a note with a middle dot. */
function joinNotes(...parts: readonly string[]): string {
  return parts.filter((part) => part !== '').join(' · ');
}

/**
 * One tag of a band figure: a list item holding a disclosure whose summary
 * is the one-line tag and whose body is the rest of the notes. A slice's tag
 * shows its swatch, range, modes, and power, and opens to its family name and
 * notes. A mark's tag shows its frequency, sideband, and activity, and opens
 * to its reason and notes. The item's class names carry the family, so the
 * stylesheet can colour its left edge.
 */
export default function BandTag(props: BandTagProps) {
  const { item } = props;
  if (item.kind === 'slice') {
    const { slice } = item;
    return (
      <li
        className={`band-figure-item is-slice family-${slice.family}`}
        style={props.style}
      >
        <details>
          <summary>
            <span
              className={`swatch is-${slice.family}`}
              aria-hidden='true'
            />
            <span className='band-figure-frequency'>
              {formatRange(slice.startKhz, slice.endKhz)}
            </span>
            <span className='band-figure-activity'>
              {slice.status === 'allowed' ?
                `${slice.mode} · ${slice.power}`
              : slice.mode}
            </span>
          </summary>
          <p className='band-figure-more'>
            {joinNotes(props.familyLabels[slice.family], slice.notes)}
          </p>
        </details>
      </li>
    );
  }
  const { mark } = item;
  return (
    <li
      className={`band-figure-item is-mark family-${mark.family}`}
      style={props.style}
    >
      <details>
        <summary>
          <span className='band-figure-frequency'>
            {formatRange(mark.startKhz, mark.endKhz)}
          </span>
          {mark.sideband !== null && (
            <span className='band-figure-sideband'>{mark.sideband}</span>
          )}
          <span className='band-figure-activity'>{mark.activity}</span>
        </summary>
        <p className='band-figure-more'>{joinNotes(mark.reason, mark.notes)}</p>
      </details>
    </li>
  );
}
