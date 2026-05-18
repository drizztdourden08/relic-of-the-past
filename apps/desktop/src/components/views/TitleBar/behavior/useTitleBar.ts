import { useState, useEffect, type RefObject } from 'react';

export const useTitleBar = (menuRef: RefObject<HTMLDivElement | null>) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    window.api.isMaximized().then(setIsMaximized);
    return window.api.onMaximizedChange(setIsMaximized);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      // Don't close if clicking inside the menu trigger area
      if (menuRef.current && menuRef.current.contains(target)) return;
      // Don't close if clicking inside the portal-rendered dropdown
      if ((target as Element).closest?.('.dropdown-menu')) return;
      setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen, menuRef]);

  return {
    isMaximized,
    menuOpen,
    toggleMenu: () => setMenuOpen((v) => !v),
    closeMenu: () => setMenuOpen(false),
  };
}
