/* @layer renderer-widgets @kind component */
import { Box, Button, Text } from '@drizztdourden08/tessera/primitives';
import { DisabledOverlay } from '@drizztdourden08/tessera/composites';
import { getSpritesBase } from '@rotp/game-data';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { cheatSetHealth } from '@app/game';
import { useConsoleScale } from '../../behavior/useConsoleScale';
import type { CheatTabProps } from '../../CheatsWidget.type';
import { PointerHintProvider } from '../../sub-components/PointerHintProvider';
import { ControlLegend } from '../../sub-components/ControlLegend';
import { LifeEditor } from './sub-components/LifeEditor';
import { MagicEditor } from './sub-components/MagicEditor';
import { CounterEditor } from './sub-components/CounterEditor';
import { BottleRack } from './sub-components/BottleRack';
import { COUNTERS, HEART_UNITS, KEYS_HIDDEN, LEGEND, PLAYER_TILES_WIDE } from './PlayerTab.constants';
import './PlayerTab.css';

const PlayerTab = ({ gates }: CheatTabProps) => {
  const { ref, scale } = useConsoleScale(PLAYER_TILES_WIDE);
  const spritesBase = getSpritesBase();
  const healthCurrent = useGameUIStore((s) => s.hud.healthCurrent);
  const healthCapacity = useGameUIStore((s) => s.hud.healthCapacity);
  const inDungeon = useGameUIStore((s) => s.hud.keys !== KEYS_HIDDEN);

  const counters = COUNTERS.filter((spec) => spec.kind !== 'keys' || inDungeon);

  return (
    <Box ref={ref} className="cheats-player">
      <PointerHintProvider>
        <DisabledOverlay active={!gates.allowed.stats} message={gates.reason('stats')} contained>
          <Box className="cheats-player__stack">
            <Box className="cheats-player__block">
              <LifeEditor scale={scale} spritesBase={spritesBase} />
              <Box className="cheats-player__life-side">
                <Text className="cheats-player__readout" title="Health / containers, in hearts">
                  {healthCurrent / HEART_UNITS} / {healthCapacity / HEART_UNITS}
                </Text>
                <Button variant="danger" size="sm" title="Set health to zero" onClick={() => cheatSetHealth(0)}>
                  Kill
                </Button>
              </Box>
            </Box>
            <Box className="cheats-player__block">
              <MagicEditor scale={scale} spritesBase={spritesBase} />
            </Box>
            <Box className="cheats-player__block cheats-player__counters">
              {counters.map((spec) => (
                <CounterEditor key={spec.kind} spec={spec} scale={scale} spritesBase={spritesBase} />
              ))}
            </Box>
            <Box className="cheats-player__block">
              <BottleRack scale={scale} spritesBase={spritesBase} />
            </Box>
          </Box>
          <ControlLegend items={LEGEND} />
        </DisabledOverlay>
      </PointerHintProvider>
    </Box>
  );
};

export { PlayerTab };
