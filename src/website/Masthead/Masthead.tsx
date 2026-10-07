import './Masthead.css';

import type MastheadProps from './MastheadProps';

/**
 * The title block beneath the panel bar: the site's title in display size, a
 * standing tagline, and a row of readouts.
 *
 * The title is deliberately not a heading element. It names the site, which
 * the panel bar's brand and the footer already do, and the page's single
 * `h1` belongs to the headline that follows. Promoting this to an `h1`
 * would give the document two competing ones.
 */
export default function Masthead(props: MastheadProps) {
  return (
    <div className='masthead'>
      <div className='masthead-inner'>
        <p className='masthead-title'>{props.title}</p>
        <p className='masthead-tagline'>{props.tagline}</p>
        <ul className='masthead-dateline'>
          {props.dateline.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
