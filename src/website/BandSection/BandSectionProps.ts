import type { BandView } from '../../bandplan/buildBandViews';
import type { ModeFamily } from '../../data/types';

/**
 * Contract for {@link BandSection}.
 */
export default interface BandSectionProps {
  /**
   * The band to present, already filtered to the license class being shown
   * and holding at least one slice. Its `id` becomes the section's element
   * id, so it must be unique on the page.
   */
  readonly band: BandView;
  /** Captions for each slice family; passed through to the figure. */
  readonly familyLabels: Readonly<Record<ModeFamily, string>>;
}
