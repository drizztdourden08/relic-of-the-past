/* @layer renderer-widgets @kind component */
import { Box, Button } from '@drizztdourden08/tessera/primitives';
import { useGameUIStore } from '../../stores/game-ui-store';
import { useHudSettingsStore } from '../../stores/hud-settings-store';
import { getFps } from '../../game';
import { buildStateSections } from './behavior/build-state-sections';
import { StateSection } from './sub-components/StateSection';
import type { HudPart } from './DebugWidget.type';
import './DebugWidget.css';

const DebugWidgetContent = () => {
  const state = useGameUIStore();
  const hudSettings = useHudSettingsStore();
  const sections = buildStateSections(state, getFps());

  const parts = hudSettings.enhancedParts;
  const mainOn = parts.includes('main');
  const pauseOn = parts.includes('pause');

  const setParts = (next: HudPart[]) =>
    window.dispatchEvent(new CustomEvent('settings:change', { detail: { hudEnhancedParts: next } }));
  const toggle = (part: HudPart, on: boolean) =>
    setParts(on ? parts.filter(p => p !== part) : [...parts, part]);

  return (
    <Box className="game-state">
      <Box className="game-state__toolbar">
        <Button size="sm" variant={mainOn ? 'primary' : 'tertiary'} onClick={() => toggle('main', mainOn)}>
          Main HUD: {mainOn ? 'Enhanced' : 'Original'}
        </Button>
        <Button size="sm" variant={pauseOn ? 'primary' : 'tertiary'} onClick={() => toggle('pause', pauseOn)}>
          Pause: {pauseOn ? 'Enhanced' : 'Original'}
        </Button>
      </Box>
      {sections.map(s => <StateSection key={s.title} title={s.title} rows={s.rows} />)}
    </Box>
  );
};

export { DebugWidgetContent };
