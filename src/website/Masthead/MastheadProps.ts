/**
 * Contract for {@link Masthead}.
 */
export default interface MastheadProps {
  /** The name set in display type across the top of the page. */
  readonly title: string;
  /** Single line of standing copy beneath the title. */
  readonly tagline: string;
  /**
   * Readouts printed as a row of chips beneath the tagline, in order. Each
   * entry must be unique — entries are used as React keys.
   */
  readonly dateline: readonly string[];
}
