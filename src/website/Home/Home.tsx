import './Home.css';

import { useMemo } from 'react';

import { buildBandViews, groupBandViews } from '../../bandplan/buildBandViews';
import BandIndex from '../BandIndex/BandIndex';
import BandSection from '../BandSection/BandSection';
import ClassPicker from '../ClassPicker/ClassPicker';
import Masthead from '../Masthead/Masthead';
import * as content from './HomeContent';
import useLicenseClass from './useLicenseClass';
import useScrollToHash from './useScrollToHash';

/**
 * The complete page for ki5spl.com, set as an instrument panel: a sticky bar
 * with the brand, the class toggle, and the nav; a title block; the headline,
 * legend, and band index; one figure per band the chosen class may use; and
 * an "about" panel with sources and standing rules.
 *
 * All copy comes from {@link module:HomeContent}; the band data and the
 * per-class view are built by {@link buildBandViews}. This module only
 * composes: it holds the chosen class and passes everything down to purely
 * presentational components.
 */
export default function Home() {
  const [licenseClass, chooseLicenseClass] = useLicenseClass();
  useScrollToHash();
  const groups = useMemo(
    () => groupBandViews(buildBandViews(licenseClass)),
    [licenseClass],
  );
  const indexGroups = useMemo(
    () =>
      groups.map((group) => ({
        label: group.group,
        bands: group.bands,
      })),
    [groups],
  );

  return (
    <div id='top'>
      <a
        href='#main'
        className='skip-link'
      >
        Skip to content
      </a>
      <header className='panel-bar'>
        <div className='panel-bar-inner'>
          <a
            href='#top'
            className='panel-brand'
          >
            {content.brand}
          </a>
          <ClassPicker
            legend={content.classPickerLegend}
            name='license-class'
            options={content.classOptions}
            value={licenseClass}
            onChange={chooseLicenseClass}
          />
          <nav
            className='panel-nav'
            aria-label='Main'
          >
            {content.navItems.map((item) => (
              <a
                key={item.label}
                href={item.path}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main
        id='main'
        tabIndex={-1}
      >
        <Masthead
          title={content.mastheadTitle}
          tagline={content.mastheadTagline}
          dateline={content.dateline}
        />

        <section
          id='plan'
          className='section'
        >
          <div className='section-inner'>
            <h1>{content.headline}</h1>

            <ul
              className='legend'
              aria-label='Figure legend'
            >
              {content.legendEntries.map((entry) => (
                <li key={entry.swatch}>
                  <span
                    className={`swatch is-${entry.swatch}`}
                    aria-hidden='true'
                  />
                  {entry.text}
                </li>
              ))}
            </ul>

            <BandIndex
              label={content.bandIndexLabel}
              groups={indexGroups}
            />
          </div>
        </section>

        <section
          id='bands'
          className='section'
        >
          <div className='section-inner'>
            {groups.map((group) => (
              <div
                key={group.group}
                className='band-group'
              >
                <h2>{group.group}</h2>
                {group.bands.map((band) => (
                  <BandSection
                    key={band.id}
                    band={band}
                    familyLabels={content.familyLabels}
                  />
                ))}
              </div>
            ))}
          </div>
        </section>

        <section
          id='about'
          className='section'
        >
          <div className='section-inner'>
            <h2>About this page</h2>
            <div className='about'>
              <div className='about-main'>
                {content.aboutParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <aside className='panel about-aside'>
                <h3>Standing rules</h3>
                <ul>
                  {content.planRules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
                <h3>Sources</h3>
                <ul>
                  {content.sources.map((source) => (
                    <li key={source.href}>
                      <a
                        href={source.href}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {source.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <footer className='site-footer'>
        <div className='site-footer-inner'>
          <p>
            © {new Date().getFullYear()} {content.footerLine}
          </p>
        </div>
      </footer>
    </div>
  );
}
