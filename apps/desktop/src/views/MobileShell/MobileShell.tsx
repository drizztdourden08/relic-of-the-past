/* @layer renderer-app @kind component */
import { useCallback, useMemo } from 'react';
import { useBrock, useWidgetMenuEntries } from '@drizztdourden08/brock-react';
import type { MenuEntry } from '@drizztdourden08/brock-react';
import { Drawer } from '@drizztdourden08/tessera/composites';
import { useFpsReadout } from '@app/hooks/useFpsReadout';
import { useGameSession } from '@app/hooks/useGameSession';
import { useMobileBack } from './behavior/useMobileBack';
import { runMenuEntry } from './behavior/run-menu-entry';
import { MobileMenuDrawer } from './sub-components/MobileMenuDrawer';
import { MOBILE_EXTRA_ENTRIES } from './MobileShell.constants';
import './MobileShell.css';

const MobileShell = () => {
  const { menu } = useBrock();
  const widgetEntries = useWidgetMenuEntries();
  const { game, display, audio } = useGameSession();
  const { open, close } = useMobileBack();
  const { fps } = useFpsReadout(open && display.showFps, game.isRunning);
  const entries = useMemo(
    () => [...menu, ...MOBILE_EXTRA_ENTRIES, { key: 'widgets', label: 'Widgets', children: [...widgetEntries] }],
    [menu, widgetEntries],
  );
  const pick = useCallback((entry: MenuEntry) => {
    close();
    runMenuEntry(entry);
  }, [close]);

  return (
    <Drawer open={open} onClose={close} side="right" label="Options">
      <MobileMenuDrawer entries={entries} fps={fps} isMuted={audio.isMuted} onToggleMute={audio.handleToggleMute} onPick={pick} />
    </Drawer>
  );
};

export { MobileShell };
