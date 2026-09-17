/* @layer renderer-widgets @kind component */
/**
 * One HUD counter as "held / ceiling": the game's icon over two numbers. The held count is
 * always editable. The ceiling walks the capacity ladder the mode offers: the native tiers on a
 * vanilla file, exactly the rungs the seed's upgrades reach on a randomized one, and plain
 * digits where there is a single rung (a vanilla wallet) or no ladder at all (keys). A ceiling
 * redraws the HUD, so it is locked outside normal play, and so is the key count.
 */
import { Box, Text } from '@ds/primitives';
import { HudSprite } from '@domains/hud';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useHudSettingsStore } from '@app/stores/hud-settings-store';
import { cheatSetArrows, cheatSetBombs, cheatSetRupees, cheatSetSmallKeys } from '@app/lib/game';
import { useCapacityLadder } from '../../../behavior/useCapacityLadder';
import { IN_PLAY_REASON, useInPlay } from '../../../behavior/useInPlay';
import { NumberCell } from './NumberCell';
import { KEYS_MAX } from '../PlayerTab.constants';
import type { CounterSpec } from '../PlayerTab.constants';

const SNES_TILE = 8;
/** The bow slot value from which the HUD draws the silver arrow icon. */
const SILVER_BOW = 3;
const WIDE_WALLET = 999;

type CounterEditorProps = {
  spec: CounterSpec;
  scale: number;
  spritesBase: string;
};

const WRITERS = {
  rupees: cheatSetRupees, bombs: cheatSetBombs, arrows: cheatSetArrows, keys: cheatSetSmallKeys,
} as const;

const ICONS = {
  rupees: 'hud-rupee-icon', bombs: 'hud-bomb-icon', arrows: 'hud-arrow-icon', keys: 'hud-key-icon',
} as const;

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
  const icon = kind === 'arrows' && hasSilverArrows ? 'hud-silver-arrow-icon' : ICONS[kind];
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
          write={WRITERS[kind]}
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
export type { CounterEditorProps };
