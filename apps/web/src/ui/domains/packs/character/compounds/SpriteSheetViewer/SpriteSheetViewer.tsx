/* @layer renderer-components @kind component */
/**
 * A player sprite sheet, read only: what it wears, one state with every facing, every state at
 * once, or the raw tile grid, all on one animation clock. The Studio draws its sheet through
 * this and puts its palette editor in `aside`; the store draws a pack's sheet through it.
 */
import { useEffect, useMemo, useState } from 'react';
import { Box } from '@ds/primitives';
import { stateFor } from '@shared/game/data/native-tables/player-pose-atlas';
import { resolvePalette } from '@app/lib/game/player-sheet/resolve-palette';
import { useWearing } from '../../behavior/useWearing';
import { useAnimationClock } from '../../behavior/useAnimationClock';
import { WearingBar } from '../WearingBar';
import { StateList } from '../StateList';
import { StatePreview } from '../StatePreview';
import { ContactSheet } from '../ContactSheet';
import { SheetBrowser } from '../SheetBrowser';
import { ViewerControls } from './sub-components/ViewerControls';
import { BUNNY_ACTION, DEFAULT_SCALE } from './SpriteSheetViewer.constants';
import type { SheetView, SpriteSheetViewerProps } from './SpriteSheetViewer.type';
import './SpriteSheetViewer.css';

const SpriteSheetViewer = (props: SpriteSheetViewerProps) => {
  const { sheet, wearing: given, aside, className } = props;
  const own = useWearing();
  const wearing = given ?? own;
  const { setOutfit } = wearing;
  const clock = useAnimationClock();

  const [view, setView] = useState<SheetView>('state');
  const [action, setAction] = useState(0x00);
  const [scale, setScale] = useState(DEFAULT_SCALE);

  const state = useMemo(() => stateFor(action), [action]);
  const row = useMemo(() => resolvePalette(sheet, wearing.wearing), [sheet, wearing.wearing]);

  // Selecting the bunny art without its own palette reads as a bug, not a choice,
  // so picking that state moves the outfit with it.
  useEffect(() => {
    if (action === BUNNY_ACTION) setOutfit('bunny');
  }, [action, setOutfit]);

  return (
    <Box className={`sprite-viewer${className ? ` ${className}` : ''}`}>
      <WearingBar
        outfit={wearing.outfit}
        gloves={wearing.gloves}
        onOutfit={wearing.setOutfit}
        onGloves={wearing.setGloves}
      />
      <ViewerControls view={view} clock={clock} scale={scale} onView={setView} onScale={setScale} />

      <Box className="sprite-viewer__body">
        {view === 'state' && <StateList selected={action} onSelect={setAction} />}
        <Box className="sprite-viewer__stage">
          {view === 'state' && state && (
            <StatePreview sheet={sheet} row={row} state={state} tick={clock.tick} scale={scale} />
          )}
          {view === 'contact' && (
            <ContactSheet
              sheet={sheet}
              row={row}
              tick={clock.tick}
              scale={scale}
              onSelect={(next) => { setAction(next); setView('state'); }}
            />
          )}
          {view === 'sheet' && <SheetBrowser sheet={sheet} wearing={wearing.wearing} scale={scale} />}
        </Box>
        {aside}
      </Box>
    </Box>
  );
};

export { SpriteSheetViewer };
