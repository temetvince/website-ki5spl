import type { MarkView, SegmentView } from '../../bandplan/buildBandViews';

/** One entry of a band figure's tagged list: a slice of privilege or a mark. */
export type FigureItem =
  | { readonly kind: 'slice'; readonly slice: SegmentView }
  | { readonly kind: 'mark'; readonly mark: MarkView };

function startOf(item: FigureItem): number {
  return item.kind === 'slice' ? item.slice.startKhz : item.mark.startKhz;
}

/**
 * A key unique within one band's figure, stable across renders.
 *
 * @param item - Any item of that figure.
 */
export function keyOf(item: FigureItem): string {
  return item.kind === 'slice' ?
      `slice-${item.slice.startKhz}-${item.slice.endKhz}-${item.slice.mode}`
    : `mark-${item.mark.startKhz}-${item.mark.endKhz}-${item.mark.activity}`;
}

/**
 * The frequency a tag is level with: a slice's lower edge, so its tag heads
 * the marks inside it, or the middle of a mark's range.
 *
 * @param item - Any item of the band.
 */
export function anchorKhzOf(item: FigureItem): number {
  return item.kind === 'slice' ?
      item.slice.startKhz
    : (item.mark.startKhz + item.mark.endKhz) / 2;
}

/**
 * The frequency each tag is level with, in item order, made monotone: a
 * range's middle can never sit above the anchor before it, so the figure's
 * scale stays ascending.
 *
 * @param items - Items in ascending frequency order.
 * @param startKhz - The band's lower edge; no anchor sits above it.
 */
export function anchorsKhzOf(
  items: readonly FigureItem[],
  startKhz: number,
): readonly number[] {
  const anchors: number[] = [];
  for (const item of items) {
    anchors.push(Math.max(anchors.at(-1) ?? startKhz, anchorKhzOf(item)));
  }
  return anchors;
}

/**
 * Merges slices and marks into one list in ascending frequency order. On a
 * tie the slice comes first, so a mark sitting on a slice's lower edge is
 * listed under that slice.
 *
 * @param segments - The band's slices, in any order.
 * @param marks - The band's marks, in any order.
 */
export function itemsOf(
  segments: readonly SegmentView[],
  marks: readonly MarkView[],
): readonly FigureItem[] {
  const all: readonly FigureItem[] = [
    ...segments.map((slice) => ({ kind: 'slice' as const, slice })),
    ...marks.map((mark) => ({ kind: 'mark' as const, mark })),
  ];
  return all.toSorted(
    (a, b) =>
      startOf(a) - startOf(b) ||
      Number(a.kind === 'mark') - Number(b.kind === 'mark'),
  );
}
