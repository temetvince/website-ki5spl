import { useEffect } from 'react';

/**
 * Scrolls to the element named by the URL fragment once, after the first
 * render. The browser performs its own fragment scroll when the document
 * loads, which is before React has rendered anything, so a link such as
 * `?class=general#band-40-m` would otherwise open at the top of the page.
 *
 * Runs only on mount. A fragment that names no element is ignored, and the
 * scroll honours the page's `scroll-behavior`, so reduced-motion readers are
 * not animated.
 */
export default function useScrollToHash(): void {
  useEffect(() => {
    const id = globalThis.location.hash.slice(1);
    if (id === '') {
      return;
    }
    document
      .querySelector(`#${CSS.escape(decodeURIComponent(id))}`)
      ?.scrollIntoView();
  }, []);
}
