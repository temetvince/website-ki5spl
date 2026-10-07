import Home from './website/Home/Home';

import './App.css';

/**
 * Application root: installs the global styles and mounts the single
 * {@link Home} page. The site has one route, so there is no router; the
 * chosen license class travels in the query string instead. Must be rendered
 * exactly once.
 */
export default function App() {
  return (
    <div className='app'>
      <Home />
    </div>
  );
}
