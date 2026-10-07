import './BandIndex.css';

import type BandIndexProps from './BandIndexProps';

/**
 * An in-page table of contents for the bands: one labelled row of anchor
 * links per group. Purely presentational; it renders whatever groups it is
 * given and does not know which band is on screen.
 */
export default function BandIndex(props: BandIndexProps) {
  return (
    <nav
      className='band-index'
      aria-label={props.label}
    >
      {props.groups.map((group) => (
        <div
          key={group.label}
          className='band-index-group'
        >
          <p className='band-index-label'>{group.label}</p>
          <ul>
            {group.bands.map((band) => (
              <li key={band.id}>
                <a href={`#${band.id}`}>{band.name}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
