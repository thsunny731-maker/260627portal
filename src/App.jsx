import React, { useState, useEffect } from 'react';
import Library from './pages/Library';
import Settings from './pages/Settings';

export default function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <>
      {hash === '#/settings' ? <Settings /> : <Library />}
    </>
  );
}
