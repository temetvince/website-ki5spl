import './BandFigure.css';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { formatFrequency, formatRange } from '../../bandplan/formatFrequency';
import type BandFigureProps from './BandFigureProps';
import BandTag from './BandTag';
import { anchorsKhzOf, itemsOf, keyOf } from './figureItems';
import {
  type FigureLayout,
  layoutFigure,
  type TagSize,
  yOf,
} from './figureLayout';

/** Width of the vertical privilege bar, in CSS pixels. */
const BAR_WIDTH = 14;
/** Left edge and width of the column of interest marks beside the bar. */
const MARK_LEFT = 19;
const MARK_WIDTH = 8;
/** Where a leader line leaves the marks column. */
const LEADER_START = MARK_LEFT + MARK_WIDTH + 3;
/** Width of the whole drawing; the tags start just to its right. */
const GUTTER = 56;
/** Smallest bar drawn, so a band with one tag still reads as a bar. */
const MIN_BAR_HEIGHT = 96;
/** A slice or range shorter than this draws as a sliver, in pixels. */
const SLIVER = 3;

/**
 * A vertical figure of one band: a bar running down the left with the slices
 * the class may use filled by mode family and no-transmit slices hatched, a
 * column of ink marks beside it for every frequency of interest, and to the
 * right a one-line tag for each slice and mark, level with its place on the
 * bar wherever it can be and joined to it by a leader. A tag is a disclosure:
 * closed, it names the frequency, the sideband, and the activity; open, it
 * adds the reason and notes. A mark's tag wears its slice's colour on its
 * left edge, and a slice's tag carries the family swatch.
 *
 * The bar is linear except where tags would collide: there it stretches by
 * exactly the room the tags need, so a cluster of dials opens out and the
 * rest of the band keeps its proportions. Every tick and slice edge is drawn
 * where its frequency truly sits; only the tag moves, and only when another
 * tag shares its frequency, in which case the leader slants.
 * See {@link layoutFigure}.
 *
 * The tags are the accessible content: every fact drawn is also written
 * there. The drawing itself is hidden from assistive technology. Tag sizes
 * are measured from the rendered page, and the figure re-lays itself out
 * whenever a tag changes size, including when one opens or fonts load.
 */
export default function BandFigure(props: BandFigureProps) {
  const { band, familyLabels } = props;
  const items = useMemo(() => itemsOf(band.segments, band.marks), [band]);
  const endKhz = band.endKhz ?? band.startKhz + 1;
  const anchorsKhz = useMemo(
    () => anchorsKhzOf(items, band.startKhz),
    [items, band.startKhz],
  );

  const listRef = useRef<HTMLOListElement>(null);
  const [sizes, setSizes] = useState<readonly TagSize[]>([]);

  useLayoutEffect(() => {
    const measure = () => {
      const children = [...(listRef.current?.children ?? [])].slice(
        0,
        anchorsKhz.length,
      );
      setSizes(
        children.map((child) => {
          const summary = child.querySelector('summary');
          return {
            height: child instanceof HTMLElement ? child.offsetHeight : 0,
            summaryHeight:
              summary instanceof HTMLElement ? summary.offsetHeight : 0,
          };
        }),
      );
    };
    const observer = new ResizeObserver(measure);
    const list = listRef.current;
    if (list !== null) {
      measure();
      observer.observe(list);
      for (const child of list.children) {
        observer.observe(child);
      }
    }
    return () => {
      observer.disconnect();
    };
  }, [anchorsKhz]);

  const layout: FigureLayout | null = useMemo(
    () =>
      sizes.length === anchorsKhz.length ?
        layoutFigure(anchorsKhz, sizes, band.startKhz, endKhz, MIN_BAR_HEIGHT)
      : null,
    [sizes, anchorsKhz, band.startKhz, endKhz],
  );
  const barHeight = layout?.barHeight ?? MIN_BAR_HEIGHT;
  const scale = layout?.scale ?? [];
  const bodyStyle = useMemo(
    () => ({ height: layout?.bodyHeight ?? MIN_BAR_HEIGHT }),
    [layout],
  );
  const tagStyles = useMemo(
    () => (layout?.tops ?? []).map((top) => ({ top })),
    [layout],
  );
  const hatchId = `${band.id}-hatch`;

  return (
    <div className='band-figure'>
      <p className='band-figure-edge'>{formatFrequency(band.startKhz)}</p>
      <div
        className='band-figure-body'
        style={bodyStyle}
      >
        <svg
          className='band-figure-graphic'
          width={GUTTER}
          height={bodyStyle.height}
          aria-hidden='true'
        >
          <defs>
            <pattern
              id={hatchId}
              width='6'
              height='6'
              patternUnits='userSpaceOnUse'
              patternTransform='rotate(45)'
            >
              <rect
                className='band-figure-hatch-ground'
                width='6'
                height='6'
              />
              <line
                className='band-figure-hatch-line'
                x1='0'
                y1='0'
                x2='0'
                y2='6'
              />
            </pattern>
          </defs>
          <rect
            className='band-figure-track'
            x='0'
            y='0'
            width={BAR_WIDTH}
            height={barHeight}
          />
          {layout !== null &&
            band.segments.map((slice) => {
              const top = yOf(scale, slice.startKhz);
              const bottom =
                slice.endKhz === null ? barHeight : yOf(scale, slice.endKhz);
              return (
                <rect
                  key={`${slice.startKhz}-${slice.endKhz}-${slice.mode}`}
                  className={`band-figure-slice is-${slice.family}`}
                  x='0'
                  y={top}
                  width={BAR_WIDTH}
                  height={Math.max(SLIVER, bottom - top)}
                  fill={
                    slice.status === 'no-transmit' ?
                      `url(#${hatchId})`
                    : undefined
                  }
                >
                  <title>
                    {`${formatRange(slice.startKhz, slice.endKhz)} · ${slice.mode} · ${slice.power}`}
                  </title>
                </rect>
              );
            })}
          {layout !== null &&
            items.map((item, index) => {
              if (item.kind !== 'mark') {
                return null;
              }
              const { mark } = item;
              const top = yOf(scale, mark.startKhz);
              const height = yOf(scale, mark.endKhz) - top;
              const title = `${formatRange(mark.startKhz, mark.endKhz)} · ${mark.activity}`;
              const key = keyOf(item);
              const center = layout.anchors[index] ?? top;
              return height < SLIVER ?
                  <line
                    key={key}
                    className='band-figure-mark'
                    x1={MARK_LEFT}
                    x2={MARK_LEFT + MARK_WIDTH}
                    y1={center}
                    y2={center}
                  >
                    <title>{title}</title>
                  </line>
                : <rect
                    key={key}
                    className='band-figure-mark-range'
                    x={MARK_LEFT}
                    y={top}
                    width={MARK_WIDTH}
                    height={height}
                  >
                    <title>{title}</title>
                  </rect>;
            })}
          {layout !== null &&
            items.map((item, index) => (
              <line
                key={keyOf(item)}
                className={`band-figure-leader is-${item.kind}`}
                x1={item.kind === 'slice' ? BAR_WIDTH + 3 : LEADER_START}
                y1={layout.anchors[index] ?? 0}
                x2={GUTTER - 2}
                y2={
                  (layout.tops[index] ?? 0) +
                  (sizes[index]?.summaryHeight ?? 0) / 2
                }
              />
            ))}
        </svg>
        <ol
          className='band-figure-items'
          ref={listRef}
        >
          {items.map((item, index) => (
            <BandTag
              key={keyOf(item)}
              item={item}
              familyLabels={familyLabels}
              style={tagStyles[index]}
            />
          ))}
        </ol>
      </div>
      <p className='band-figure-edge'>
        {band.endKhz === null ? 'and above' : formatFrequency(band.endKhz)}
      </p>
    </div>
  );
}
