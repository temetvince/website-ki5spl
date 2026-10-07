/** Vertical space kept between two tags, in CSS pixels. */
export const TAG_GAP = 4;

/** A point on the bar's scale: a frequency and the pixel it is drawn at. */
export interface ScalePoint {
  readonly khz: number;
  readonly y: number;
}

/** Where everything sits once the tags have been placed. */
export interface FigureLayout {
  /** Height of the bar, in pixels. */
  readonly barHeight: number;
  /** Height of the whole figure body: the bar, or the last tag if lower. */
  readonly bodyHeight: number;
  /** Top edge of each tag, in pixels, in input order. */
  readonly tops: readonly number[];
  /**
   * The pixel each tag's frequency is truly drawn at on the bar, in input
   * order. Tags that share a frequency share an anchor.
   */
  readonly anchors: readonly number[];
  /**
   * The bar's scale as a polyline, strictly ascending in both `khz` and `y`,
   * from the band's lower edge at `y = 0` to its upper edge at
   * `y = barHeight`. No two points share a frequency.
   */
  readonly scale: readonly ScalePoint[];
}

/** Each tag's rendered height and the height of its always-visible line. */
export interface TagSize {
  readonly height: number;
  readonly summaryHeight: number;
}

/**
 * Lays out one band's tags along a bar that is linear except where tags
 * would collide.
 *
 * The bar starts at a base scale that gives the band the height its tags
 * need when stacked, so a sparse band stays compact. Walking down the band,
 * each tag is placed level with its own frequency unless that would overlap
 * the tag above, in which case the bar is stretched between those two
 * frequencies by exactly the shortfall. So a cluster of dials a few kHz
 * apart opens out just enough to label, the rest of the band keeps its
 * proportions, and a leader is horizontal wherever its tag has a frequency
 * to itself.
 *
 * Two tags that share a frequency, such as a beacon on a slice's lower
 * edge, share one point on the bar: the scale is never stretched between
 * equal frequencies, so a tick is always drawn where its frequency truly
 * sits. The later tag stacks beneath the first and its leader slants back
 * to that one point.
 *
 * Preconditions: `anchorsKhz` is sorted ascending and every value lies in
 * `[startKhz, endKhz]`; `sizes` has the same length; `endKhz > startKhz`.
 *
 * @param anchorsKhz - The frequency each tag is level with.
 * @param sizes - Each tag's rendered size.
 * @param startKhz - The band's lower edge.
 * @param endKhz - The band's upper edge.
 * @param minHeight - Smallest bar to draw, in pixels, for a near-empty band.
 */
export function layoutFigure(
  anchorsKhz: readonly number[],
  sizes: readonly TagSize[],
  startKhz: number,
  endKhz: number,
  minHeight: number,
): FigureLayout {
  const stacked =
    sizes.reduce((sum, size) => sum + size.height, 0) +
    TAG_GAP * Math.max(0, sizes.length - 1);
  const pixelsPerKhz = Math.max(minHeight, stacked) / (endKhz - startKhz);

  const scale: ScalePoint[] = [{ khz: startKhz, y: 0 }];
  const anchors: number[] = [];
  const tops: number[] = [];
  let previousKhz = startKhz;
  /** The lowest pixel already spoken for by the tag above. */
  let floor = 0;
  let lastBottom = 0;

  anchorsKhz.forEach((khz, i) => {
    const size = sizes[i] ?? { height: 0, summaryHeight: 0 };
    const previousY = scale.at(-1)?.y ?? 0;
    const shared = i > 0 && khz === previousKhz;
    const anchor =
      shared ? previousY : (
        Math.max(
          previousY + (khz - previousKhz) * pixelsPerKhz,
          floor + size.summaryHeight / 2,
        )
      );
    anchors.push(anchor);
    const top = Math.max(anchor - size.summaryHeight / 2, floor);
    tops.push(top);
    floor = top + size.height + TAG_GAP;
    lastBottom = Math.max(lastBottom, top + size.height);
    if (!shared) {
      scale.push({ khz, y: anchor });
    }
    previousKhz = khz;
  });

  const barHeight = Math.max(
    (scale.at(-1)?.y ?? 0) + (endKhz - previousKhz) * pixelsPerKhz,
    floor,
    minHeight,
  );
  scale.push({ khz: endKhz, y: barHeight });

  return {
    barHeight,
    bodyHeight: Math.max(barHeight, lastBottom),
    tops,
    anchors,
    scale,
  };
}

/**
 * The pixel a frequency is drawn at, by linear interpolation along the
 * bar's scale. A frequency outside the scale is clamped to its nearest end.
 *
 * @param scale - The scale from {@link FigureLayout}.
 * @param khz - The frequency to place.
 */
export function yOf(scale: readonly ScalePoint[], khz: number): number {
  const first = scale[0];
  const last = scale.at(-1);
  if (first === undefined || last === undefined) {
    return 0;
  }
  if (khz <= first.khz) {
    return first.y;
  }
  if (khz >= last.khz) {
    return last.y;
  }
  const upperIndex = scale.findIndex((point) => point.khz >= khz);
  const upper = scale[upperIndex];
  const lower = scale[upperIndex - 1];
  if (upper === undefined || lower === undefined) {
    return last.y;
  }
  if (upper.khz === khz) {
    return upper.y;
  }
  return (
    lower.y +
    ((khz - lower.khz) / (upper.khz - lower.khz)) * (upper.y - lower.y)
  );
}
