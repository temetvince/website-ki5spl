import { useCallback, useState } from 'react';

import { isLicenseClass, type LicenseClass } from '../../data/types';

/** Query-string parameter that carries the chosen class, as in `?class=general`. */
const PARAM = 'class';
/** `localStorage` key that remembers the chosen class between visits. */
const STORAGE_KEY = 'ki5spl.licenseClass';
/** Shown when neither the URL nor storage names a class. */
const DEFAULT_CLASS: LicenseClass = 'technician';

function readInitial(): LicenseClass {
  const fromUrl = new URLSearchParams(globalThis.location.search).get(PARAM);
  if (isLicenseClass(fromUrl)) {
    return fromUrl;
  }
  try {
    const stored = globalThis.localStorage.getItem(STORAGE_KEY);
    if (isLicenseClass(stored)) {
      return stored;
    }
  } catch {
    /* Storage can be blocked or absent; the default below covers that. */
  }
  return DEFAULT_CLASS;
}

/**
 * The license class the page is showing, and a setter for it.
 *
 * On first render the class comes from the URL's `class` parameter, then
 * from the value remembered in `localStorage`, then falls back to
 * Technician, the class with the fewest privileges, so nobody is shown
 * spectrum they cannot use. Setting a class rewrites the URL in place with
 * `history.replaceState`, so the page is shareable without adding a history
 * entry, and remembers the choice in storage when storage is available.
 *
 * Must be called from a component rendered in a browser: it reads `location`
 * during the first render.
 *
 * @returns The current class and a stable setter.
 */
export default function useLicenseClass(): readonly [
  LicenseClass,
  (next: LicenseClass) => void,
] {
  const [licenseClass, setLicenseClass] = useState(readInitial);

  const choose = useCallback((next: LicenseClass) => {
    setLicenseClass(next);
    const url = new URL(globalThis.location.href);
    url.searchParams.set(PARAM, next);
    globalThis.history.replaceState(null, '', url);
    try {
      globalThis.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* Storage unavailable: the URL still carries the choice. */
    }
  }, []);

  return [licenseClass, choose] as const;
}
