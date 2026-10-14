/* @layer renderer-app @kind hook */
import { useEffect, useRef, useState } from 'react';
import { getPlatform, nav, useNavigationStore } from '@drizztdourden08/brock-react';
import { HOME_HUB } from '@app/views/GameSession/GameSession.constants';

const useMobileBack = () => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => getPlatform().backEdge?.onBackButton((edge) => {
    if (openRef.current) { setOpen(false); return; }
    if (edge === 'left') {
      if (useNavigationStore.getState().active !== null) nav.escape();
      else nav.home(HOME_HUB);
      return;
    }
    setOpen(true);
  }), []);

  return { open, close: () => setOpen(false) };
};

export { useMobileBack };
