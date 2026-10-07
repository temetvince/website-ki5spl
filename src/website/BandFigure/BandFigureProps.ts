import type { BandView } from '../../bandplan/buildBandViews';
import type { ModeFamily } from '../../data/types';

/**
 * Contract for {@link BandFigure}.
 */
export default interface BandFigureProps {
  /**
   * The band to draw. Its `segments` and `marks` must already be filtered
   * to the license class being shown; the figure draws and lists every one it
   * is given. `id` must be unique on the page: it keys the SVG hatch pattern.
   */
  readonly band: BandView;
  /**
   * Caption printed beside the swatch of each slice, keyed by the slice's
   * family. The `beacon` entry captions slices nobody may transmit in.
   */
  readonly familyLabels: Readonly<Record<ModeFamily, string>>;
}
