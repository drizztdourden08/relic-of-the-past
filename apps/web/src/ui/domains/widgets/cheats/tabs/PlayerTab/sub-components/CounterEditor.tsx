/* @layer renderer-widgets @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { HudSprite } from '@domains/hud';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useHudSettingsStore } from '@app/stores/hud-settings-store';
import { useCapacityLadder } from '../../../behavior/useCapacityLadder';
import { useInPlay } from '../../../behavior/useInPlay';
import { IN_PLAY_REASON } from '../../../CheatsWidget.constants';
import { NumberCell } from './NumberCell';
import { COUNTER_ICONS, COUNTER_WRITERS, KEYS_MAX, SILVER_BOW, SNES_TILE, WIDE_WALLET } from '../PlayerTab.constants';
import type { CounterEditorProps } from '../PlayerTab.type';

const CounterEditor = ({ spec, scale, spritesBase }: CounterEditorProps) => {
  const { kind, label, iconWidth, digits, steps, capacity } = spec;
  const hud = useGameUIStore((s) => s.hud);
  const hasSilverArrows = useGameUIStore((s) => s.inventory.items[0] >= SILVER_BOW);
  const showMaxInYellow = useHudSettingsStore((s) => s.showMaxInYellow);
  const inPlay = useInPlay();
  const { ladder, settable, set } = useCapacityLadder(capacity ?? 'bombs');

  const maxOf = { rupees: hud.maxRupees, bombs: hud.maxBombs, arrows: hud.maxArrows, keys: KEYS_MAX };
  const value = hud[kind];
  const max = maxOf[kind];
  const tile = SNES_TILE * scale;
  const icon = kind === 'arrows' && hasSilverArrows ? 'hud-silver-arrow-icon' : COUNTER_ICONS[kind];
  const shownDigits = kind === 'rupees' && hud.maxRupees > WIDE_WALLET ? digits + 1 : digits;

  const caps = ladder.map((r) => r.cap);
  const maxWrite = capacity && settable
    ? (cap: number) => { const hit = ladder.find((r) => r.cap === cap); if (hit) set(hit.rung); }
    : undefined;
  const heldLock = kind === 'keys' && !inPlay ? IN_PLAY_REASON : undefined;
  const maxLock = inPlay ? undefined : IN_PLAY_REASON;

  return (
    <Box className="cheats-player__counter" aria-label={label}>
      <HudSprite src={`${spritesBase}${icon}.png`} width={iconWidth * scale} height={tile} outline scale={scale} />
      <Box className="cheats-player__pair">
        <NumberCell
          label={label}
          value={value}
          max={max}
          digits={shownDigits}
          isMax={showMaxInYellow && value >= max}
          write={COUNTER_WRITERS[kind]}
          steps={steps}
          lockedReason={heldLock}
          scale={scale}
          spritesBase={spritesBase}
        />
        <Text className="cheats-player__slash" style={{ fontSize: tile }}>/</Text>
        <NumberCell
          label={`${label} max`}
          value={max}
          min={caps[0] ?? 0}
          max={caps[caps.length - 1] ?? max}
          digits={shownDigits}
          write={maxWrite}
          ladder={caps}
          lockedReason={maxWrite ? maxLock : undefined}
          scale={scale}
          spritesBase={spritesBase}
        />
      </Box>
    </Box>
  );
};

export { CounterEditor };
