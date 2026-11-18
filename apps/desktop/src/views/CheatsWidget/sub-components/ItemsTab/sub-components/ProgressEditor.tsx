/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { useState } from 'react';
import { Pressable } from '@drizztdourden08/tessera/primitives';
import { cheatSetInventorySlot, CheatSlot } from '@app/game';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { PauseBorderBox, PauseCrystalIcon, PauseLabel, PausePendantIcon } from '@app/hud';
import { CRYSTAL_SPOTS, CRYSTALS_FROM_PROGRESS, PENDANT_SPOTS, PROGRESS_PANEL } from '../ItemsTab.constants';
import { SlotCell } from './SlotCell';
import type { PanelProps, ProgressView } from '../ItemsTab.type';

const noHover = (): void => undefined;

const ProgressEditor = ({ scale, spritesBase }: PanelProps) => {
  const t = useT();
  const pendants = useGameUIStore((s) => s.dungeonProgress.pendants);
  const crystals = useGameUIStore((s) => s.dungeonProgress.crystals);
  const progressIndicator = useGameUIStore((s) => s.saveMenu.progressIndicator);
  const [chosen, setChosen] = useState<ProgressView | null>(null);
  const tile = 8 * scale;
  const view: ProgressView = chosen ?? (progressIndicator >= CRYSTALS_FROM_PROGRESS ? 'crystals' : 'pendants');
  const other: ProgressView = view === 'pendants' ? 'crystals' : 'pendants';

  return (
    <PauseBorderBox color="yellow" cols={PROGRESS_PANEL.cols} rows={PROGRESS_PANEL.rows} scale={scale} spritesBase={spritesBase}>
      <Pressable className="cheats-items__toggle" title={t('views-cheats:items.show', { view: other })} onClick={() => setChosen(other)}>
        <PauseLabel name={view} tiles={5} scale={scale} spritesBase={spritesBase} />
      </Pressable>

      {view === 'pendants' && PENDANT_SPOTS.map(({ bit, x, y, variant, name }) => {
        const held = (pendants & bit) !== 0;
        return (
          <SlotCell
            key={bit}
            size={tile * 2}
            owned={held}
            menu={false}
            ghost={`${spritesBase}pause-pendant-${variant}.png`}
            title={t('views-cheats:items.toggle', { name, action: held ? 'take' : 'give' })}
            style={{ position: 'absolute', left: tile * x, top: tile * y }}
            onClick={() => cheatSetInventorySlot(CheatSlot.Pendants, pendants ^ bit)}
            onHover={noHover}
          >
            <PausePendantIcon variant={held ? variant : 'empty'} scale={scale} spritesBase={spritesBase} />
          </SlotCell>
        );
      })}

      {view === 'crystals' && CRYSTAL_SPOTS.map(({ x, y }, index) => {
        const bit = 1 << index;
        const held = (crystals & bit) !== 0;
        return (
          <SlotCell
            key={index}
            size={tile * 2}
            height={tile}
            owned={held}
            menu={false}
            ghost={`${spritesBase}pause-crystal-filled.png`}
            title={t('views-cheats:items.toggle', { name: t('views-cheats:items.crystal', { n: index + 1 }), action: held ? 'take' : 'give' })}
            style={{ position: 'absolute', left: tile * x, top: tile * y }}
            onClick={() => cheatSetInventorySlot(CheatSlot.Crystals, crystals ^ bit)}
            onHover={noHover}
          >
            <PauseCrystalIcon filled={held} scale={scale} spritesBase={spritesBase} />
          </SlotCell>
        );
      })}
    </PauseBorderBox>
  );
};

export { ProgressEditor };
