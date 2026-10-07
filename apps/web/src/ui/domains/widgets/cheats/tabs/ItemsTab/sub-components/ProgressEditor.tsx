/* @layer renderer-widgets @kind component */
/**
 * The pause menu's PENDANTS / CRYSTALS box. The label is the switch between the two views
 * (the default follows the game's progress indicator); every pendant and crystal is a toggle
 * on its SRAM bit, drawn as the game draws it when held and as a ghost when not.
 */
import { useState } from 'react';
import { Box, Button } from '@ds/primitives';
import { cheatSetInventorySlot, CheatSlot } from '@app/lib/game';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { PauseBorderBox, PauseCrystalIcon, PauseLabel, PausePendantIcon } from '@domains/hud';
import { CRYSTAL_SPOTS, CRYSTALS_FROM_PROGRESS, PENDANT_SPOTS, PROGRESS_PANEL } from '../ItemsTab.constants';
import { SlotCell } from './SlotCell';

type ProgressEditorProps = {
  scale: number;
  spritesBase: string;
};

type ProgressView = 'pendants' | 'crystals';

const noHover = (): void => undefined;

const ProgressEditor = ({ scale, spritesBase }: ProgressEditorProps) => {
  const pendants = useGameUIStore((s) => s.dungeonProgress.pendants);
  const crystals = useGameUIStore((s) => s.dungeonProgress.crystals);
  const progressIndicator = useGameUIStore((s) => s.saveMenu.progressIndicator);
  const [chosen, setChosen] = useState<ProgressView | null>(null);
  const tile = 8 * scale;
  const view: ProgressView = chosen ?? (progressIndicator >= CRYSTALS_FROM_PROGRESS ? 'crystals' : 'pendants');
  const other: ProgressView = view === 'pendants' ? 'crystals' : 'pendants';

  return (
    <PauseBorderBox color="yellow" cols={PROGRESS_PANEL.cols} rows={PROGRESS_PANEL.rows} scale={scale} spritesBase={spritesBase}>
      <Button variant="bare" className="cheats-items__toggle" title={`Show ${other}`} onClick={() => setChosen(other)}>
        <PauseLabel name={view} tiles={5} scale={scale} spritesBase={spritesBase} />
      </Button>

      {view === 'pendants' && PENDANT_SPOTS.map(({ bit, x, y, variant, name }) => {
        const held = (pendants & bit) !== 0;
        return (
          <SlotCell
            key={bit}
            size={tile * 2}
            owned={held}
            menu={false}
            ghost={`${spritesBase}pause-pendant-${variant}.png`}
            title={`${name}: click to ${held ? 'take away' : 'give'}`}
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
            title={`Crystal ${index + 1}: click to ${held ? 'take away' : 'give'}`}
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
export type { ProgressEditorProps };
