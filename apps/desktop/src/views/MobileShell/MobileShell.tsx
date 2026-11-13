/* @layer renderer-app @kind component */
import { useCallback, useMemo } from 'react';
import { useBrock, useVolumeStore, useWidgetMenuEntries } from '@drizztdourden08/brock-react';
import type { MenuEntry } from '@drizztdourden08/brock-react';
import { Drawer } from '@drizztdourden08/tessera/composites';
import { EdgeSwipeHint } from '@app/compounds/EdgeSwipeHint';
import { useFpsReadout } from '@app/hooks/useFpsReadout';
import { useGameSession } from '@app/hooks/useGameSession';
import { useEdgeHint } from './behavior/useEdgeHint';
import { useMobileBack } from './behavior/useMobileBack';
import { useTouchMenuEntries } from './behavior/useTouchMenuEntries';
import { runMenuEntry } from './behavior/run-menu-entry';
import { MobileMenuDrawer } from './sub-components/MobileMenuDrawer';
import { ABOUT_ENTRY, GAME_ENTRY, PROFILES_ENTRY } from './MobileShell.constants';
import './MobileShell.css';

const MobileShell = () => {
  const { menu, homeScreen } = useBrock();
  const widgetEntries = useWidgetMenuEntries();
  const { game, display } = useGameSession();
  const { value, muted, toggleMute } = useVolumeStore();
  const { open, close } = useMobileBack();
  const touchEntries = useTouchMenuEntries();
  const { fps } = useFpsReadout(open && display.showFps, game.isRunning);
  const entries = useMemo((): MenuEntry[] => [
    { key: 'home', label: 'Home', icon: 'house', screen: homeScreen, fresh: true },
    GAME_ENTRY,
    PROFILES_ENTRY,
    'separator',
    ...menu,
    'separator',
    ...touchEntries,
    { key: 'widgets', label: 'Widgets', icon: 'layout-grid', children: [...widgetEntries] },
    'separator',
    ABOUT_ENTRY,
  ], [homeScreen, menu, touchEntries, widgetEntries]);
  const hint = useEdgeHint(game.isRunning, open);
  const pick = useCallback((entry: MenuEntry) => {
    close();
    runMenuEntry(entry);
  }, [close]);

  return (
    <>
      {hint.visible ? <EdgeSwipeHint startLabel={hint.startLabel} endLabel="Menu" /> : null}
      <Drawer open={open} onClose={close} side="right" label="Options">
        <MobileMenuDrawer key={String(open)} entries={entries} fps={fps} isMuted={muted || value <= 0} onToggleMute={toggleMute} onPick={pick} />
      </Drawer>
    </>
  );
};

export { MobileShell };
