import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageTransition() {
  const location = useLocation();

  useEffect(() => {
    // Add a class to the body when navigation starts
    document.body.classList.add('page-transitioning');

    // Remove the class after the transition completes
    const timeout = setTimeout(() => {
      document.body.classList.remove('page-transitioning');
    }, 300); // Match this with your transition duration

    return () => {
      clearTimeout(timeout);
      document.body.classList.remove('page-transitioning');
    };
  }, [location.pathname]);
}