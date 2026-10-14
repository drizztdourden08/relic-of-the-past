/* @layer renderer-hud @kind component */
import { HudBox } from '../../../primitives/HudBox';
import { HudSprite } from '../../../primitives/HudSprite';
import { PauseCrystalIcon } from '../../../composites/PauseCrystalIcon';
import { PausePendantIcon } from '../../../composites/PausePendantIcon';
import {
  CRYSTALS_Y, CRYSTAL_COUNT, CRYSTAL_DROP, CRYSTAL_PITCH, DUNGEON_Y, ICON_PITCH, ICON_SIZE,
  PENDANT_VARIANTS, PENDANTS_Y, ROW_LABELS,
} from '../PauseStatusScreen.constants';
import type { StatusIconRowsProps } from '../PauseStatusScreen.type';
import { PauseStatusRow } from './PauseStatusRow';

const StatusIconRows = ({ pendants, crystals, dungeonItems, scale, spritesBase }: StatusIconRowsProps) => {
  const px = (n: number): number => n * scale;

  return (
    <>
      <PauseStatusRow label={ROW_LABELS.pendants} top={PENDANTS_Y} scale={scale} spritesBase={spritesBase}>
        {PENDANT_VARIANTS.map((variant, bit) => (
          <HudBox key={variant} style={{ width: px(ICON_PITCH) }}>
            <PausePendantIcon
              variant={(pendants & (1 << bit)) ? variant : 'empty'}
              scale={scale}
              spritesBase={spritesBase}
            />
          </HudBox>
        ))}
      </PauseStatusRow>

      <PauseStatusRow
        label={ROW_LABELS.crystals} top={CRYSTALS_Y} valueTop={CRYSTAL_DROP}
        scale={scale} spritesBase={spritesBase}
      >
        {Array.from({ length: CRYSTAL_COUNT }, (_, bit) => (
          <HudBox key={bit} style={{ width: px(CRYSTAL_PITCH) }}>
            <PauseCrystalIcon filled={Boolean(crystals & (1 << bit))} scale={scale} spritesBase={spritesBase} />
          </HudBox>
        ))}
      </PauseStatusRow>

      <PauseStatusRow label={ROW_LABELS.dungeon} top={DUNGEON_Y} scale={scale} spritesBase={spritesBase}>
        {dungeonItems.map((item) => (
          <HudBox key={item.sprite} style={{ width: px(ICON_PITCH) }}>
            <HudSprite
              src={`${spritesBase}${item.sprite}.png`}
              width={px(ICON_SIZE)}
              height={px(ICON_SIZE)}
              silhouette={!item.owned}
              silhouetteTone="light"
              scale={scale}
            />
          </HudBox>
        ))}
      </PauseStatusRow>
    </>
  );
};

export { StatusIconRows };
