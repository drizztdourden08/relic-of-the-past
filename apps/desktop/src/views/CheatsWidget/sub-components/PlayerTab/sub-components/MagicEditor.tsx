/* @layer renderer-widgets @kind component */
import { useCallback, useState } from 'react';
import type { MouseEvent } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { HudMagicMeter } from '@app/hud';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { usePointerHintTarget } from '../../../behavior/usePointerHintTarget';
import { useWheel } from '../../../behavior/useWheel';
import { NumberSetter } from '../../NumberSetter';
import { MagicLevelBar } from './MagicLevelBar';
import { MagicRows } from './MagicRows';
import {
  MAGIC_FRAME_COLS, MAGIC_FRAME_ROWS, MAGIC_HINTS, MAGIC_INTERIOR_INSET, MAGIC_LEVELS, MAGIC_SETTER_STEPS, SNES_TILE,
} from '../PlayerTab.constants';
import { magicLevelOf } from '../behavior/magic-level-of';
import { magicPercentOf } from '../behavior/magic-percent-of';
import { writeMagicLevel } from '../behavior/write-magic-level';
import type { HudPieceProps } from '../PlayerTab.type';

const MagicEditor = ({ scale, spritesBase }: HudPieceProps) => {
  const magicPower = useGameUIStore((s) => s.hud.magicPower);
  const halfMagic = useGameUIStore((s) => s.hud.halfMagic);
  const [hoverLevel, setHoverLevel] = useState<number | null>(null);
  const [setterAnchor, setSetterAnchor] = useState<HTMLElement | null>(null);
  const hint = usePointerHintTarget('Magic', MAGIC_HINTS);
  const held = magicLevelOf(magicPower);
  const tile = SNES_TILE * scale;
  const wheelRef = useWheel<HTMLDivElement>((dir) => writeMagicLevel(Math.min(MAGIC_LEVELS, Math.max(0, held + dir))));

  const openSetter = useCallback((e: MouseEvent) => { e.preventDefault(); setSetterAnchor(e.currentTarget as HTMLElement); }, []);
  const closeSetter = useCallback(() => setSetterAnchor(null), []);

  return (
    <Box className="cheats-player__magic-block">
      <Box className="cheats-player__magic-row-group">
        <MagicLevelBar scale={scale} />
        <Box
          ref={wheelRef}
          className="cheats-player__magic"
          style={{ width: MAGIC_FRAME_COLS * tile, height: MAGIC_FRAME_ROWS * tile }}
          onContextMenu={openSetter}
          {...hint}
        >
          <HudMagicMeter value={magicPower} halfMagic={halfMagic} mode="original" scale={scale} spritesBase={spritesBase} />
          <MagicRows inset={tile * MAGIC_INTERIOR_INSET} held={held} onHoverLevel={setHoverLevel} />
        </Box>
      </Box>
      <Text className="cheats-player__caption" data-preview={hoverLevel !== null ? '' : undefined}>
        {magicPercentOf(hoverLevel ?? held)}
      </Text>
      {setterAnchor && (
        <NumberSetter
          title="Magic"
          value={held}
          min={0}
          max={MAGIC_LEVELS}
          steps={MAGIC_SETTER_STEPS}
          format={magicPercentOf}
          anchor={setterAnchor}
          onCommit={writeMagicLevel}
          onClose={closeSetter}
        />
      )}
    </Box>
  );
};

export { MagicEditor };
