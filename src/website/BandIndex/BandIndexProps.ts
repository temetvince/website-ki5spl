/**
 * Contract for {@link BandIndex}.
 */
export default interface BandIndexProps {
  /** Accessible name for the navigation landmark. */
  readonly label: string;
  /**
   * Groups of bands in display order. Each band's `id` is the element id the
   * link scrolls to, and must exist on the page; `name` is the link text.
   * Group labels and band ids must be unique — both serve as React keys.
   */
  readonly groups: readonly {
    readonly label: string;
    readonly bands: readonly {
      readonly id: string;
      readonly name: string;
    }[];
  }[];
}
