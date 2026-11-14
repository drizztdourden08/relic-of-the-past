/* @layer renderer-app @kind hook */
import { useEffect, useRef } from 'react';
import { getPlatform, nav, useNavigationStore } from '@drizztdourden08/brock-react';
import { useTouchControlsStore } from '@app/stores/touch-controls-store';
import { HOME_HUB } from '@app/views/GameSession/GameSession.constants';

const useMobileBack = () => {
  const open = useTouchControlsStore((s) => s.menuOpen);
  const setOpen = useTouchControlsStore((s) => s.setMenuOpen);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => getPlatform().device.onBackButton((edge) => {
    if (openRef.current) { setOpen(false); return; }
    if (edge === 'left') {
      if (useNavigationStore.getState().active !== null) nav.escape();
      else nav.home(HOME_HUB);
      return;
    }
    setOpen(true);
  }), [setOpen]);

  return { open, close: () => setOpen(false) };
};

export { useMobileBack };
