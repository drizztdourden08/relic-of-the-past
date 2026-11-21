/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { stateFor } from '@rotp/game-data';
import { resolvePalette } from '@rotp/packs';
import { StatePreview } from '../../StatePreview';
import { ContactSheet } from '../../ContactSheet';
import { SheetBrowser } from '../../SheetBrowser';
import type { ViewerStageProps } from '../SpriteSheetViewer.type';

const ViewerStage = (props: ViewerStageProps) => {
  const { sheet, wearing, viewer, labels } = props;
  const { view, action, scale, clock, setAction, setView } = viewer;
  const state = useMemo(() => stateFor(action), [action]);
  const row = useMemo(() => resolvePalette(sheet, wearing.wearing), [sheet, wearing.wearing]);

  return (
    <>
      {view === 'state' && state && (
        <StatePreview sheet={sheet} row={row} state={state} tick={clock.tick} scale={scale} labels={labels} />
      )}
      {view === 'contact' && (
        <ContactSheet
          sheet={sheet}
          row={row}
          tick={clock.tick}
          scale={scale}
          labels={labels}
          onSelect={(next) => { setAction(next); setView('state'); }}
        />
      )}
      {view === 'sheet' && <SheetBrowser sheet={sheet} wearing={wearing.wearing} scale={scale} labels={labels} />}
    </>
  );
};

export { ViewerStage };
