import './BandSection.css';

import { formatRange } from '../../bandplan/formatFrequency';
import BandFigure from '../BandFigure/BandFigure';
import type BandSectionProps from './BandSectionProps';

/**
 * One band: a heading with the band's extent, then the vertical figure that
 * draws and labels every slice and frequency of interest for the class.
 *
 * Renders an `h3`, so the composing page must place it beneath an `h2`.
 */
export default function BandSection(props: BandSectionProps) {
  const { band } = props;
  const headingId = `${band.id}-heading`;

  return (
    <section
      id={band.id}
      className='band'
      aria-labelledby={headingId}
    >
      <div className='band-head'>
        <h3 id={headingId}>{band.name}</h3>
        <p className='band-extent'>{formatRange(band.startKhz, band.endKhz)}</p>
      </div>
      <BandFigure
        band={band}
        familyLabels={props.familyLabels}
      />
    </section>
  );
}
