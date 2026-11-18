/* @layer renderer-app @kind component */
import { useCallback, useMemo } from 'react';
import { useBrock, useT, useVolumeStore, useWidgetMenuEntries } from '@drizztdourden08/brock-react';
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
  const t = useT();
  const { menu, homeScreen } = useBrock();
  const widgetEntries = useWidgetMenuEntries();
  const { game, display } = useGameSession();
  const { value, muted, toggleMute } = useVolumeStore();
  const { open, close } = useMobileBack();
  const touchEntries = useTouchMenuEntries();
  const { fps } = useFpsReadout(open && display.showFps, game.isRunning);
  const entries = useMemo((): MenuEntry[] => [
    { key: 'home', label: t('views-mobile-shell:menu.home'), icon: 'house', screen: homeScreen, fresh: true },
    { ...GAME_ENTRY, label: t('views-mobile-shell:menu.game') },
    { ...PROFILES_ENTRY, label: t('views-mobile-shell:menu.profiles') },
    'separator',
    ...menu,
    'separator',
    ...touchEntries,
    { key: 'widgets', label: t('views-mobile-shell:menu.widgets'), icon: 'layout-grid', children: [...widgetEntries] },
    'separator',
    { ...ABOUT_ENTRY, label: t('views-mobile-shell:menu.about') },
  ], [t, homeScreen, menu, touchEntries, widgetEntries]);
  const showHint = useEdgeHint(game.isRunning, open);
  const pick = useCallback((entry: MenuEntry) => {
    close();
    runMenuEntry(entry);
  }, [close]);

  return (
    <>
      {showHint ? <EdgeSwipeHint startLabel={t('views-mobile-shell:hint.home')} endLabel={t('views-mobile-shell:hint.menu')} /> : null}
      <Drawer open={open} onClose={close} side="right" label={t('views-mobile-shell:drawer.label')}>
        <MobileMenuDrawer key={String(open)} entries={entries} fps={fps} isMuted={muted || value <= 0} onToggleMute={toggleMute} onPick={pick} />
      </Drawer>
    </>
  );
};

export { MobileShell };
