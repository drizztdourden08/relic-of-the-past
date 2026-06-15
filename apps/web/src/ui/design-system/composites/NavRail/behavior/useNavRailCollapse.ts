/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';

/**
 * Drives the rail's collapsed/floating state on narrow viewports: the unfold
 * button toggles a labeled panel that floats over content, and any interaction
 * outside the rail (or selecting an item) collapses it back to icons. On wide
 * viewports the CSS ignores this flag, so the state is inert.
 */
const useNavRailCollapse = () => {
  const [expanded, setExpanded] = useState(false);

  const collapse = useCallback(() => setExpanded(false), []);
  const toggle = useCallback(() => setExpanded((open) => !open), []);

  useEffect(() => {
    if (!expanded) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest('.nav-rail') == null) setExpanded(false);
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [expanded]);

  return { expanded, toggle, collapse };
};

export { useNavRailCollapse };
