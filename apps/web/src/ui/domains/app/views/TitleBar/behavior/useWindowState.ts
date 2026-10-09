/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';
import type { WindowControl } from '@drizztdourden08/tessera/composites';
import type { WindowControlsPort } from '@shared/platform';

const useWindowState = (win: WindowControlsPort) => {
  const [maximized, setMaximized] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    void win.isMaximized().then(setMaximized);
    return win.onMaximizedChange(setMaximized);
  }, [win]);

  useEffect(() => {
    void win.isFullscreen().then(setFullscreen);
    return win.onFullscreenChange(setFullscreen);
  }, [win]);

  const onControl = useCallback((control: WindowControl) => {
    if (control === 'fullscreen') win.toggleFullscreen();
    else if (control === 'minimize') win.minimize();
    else if (control === 'maximize') win.toggleMaximize();
    else if (control === 'close') win.close();
    else void win.setAlwaysOnTop(!pinned).then(setPinned);
  }, [win, pinned]);

  return { maximized, fullscreen, pinned, onControl };
};

export { useWindowState };
