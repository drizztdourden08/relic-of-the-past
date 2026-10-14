/* @layer renderer-components @kind component */
import { useCallback, useMemo, useState } from 'react';
import { Box, EmptyState } from '@drizztdourden08/tessera/primitives';
import { PreviewBox } from './PreviewBox';
import { PreviewPrompt } from './PreviewPrompt';
import { PreviewSamples } from './PreviewSamples';
import { previewScreens } from './preview-screens';
import { usePreviewControls } from './behavior/usePreviewControls';
import { useSampleValues } from './behavior/useSampleValues';
import { LOADING_MESSAGE, NO_SCREENS_MESSAGE } from './preview.constants';
import type { PreviewScreen, PreviewViewProps } from './preview.type';
import './PreviewView.css';

const cursorRowOf = (screen: PreviewScreen | undefined, selected: number): number | null => {
  if (!screen?.choice) return null;
  const { rows } = screen.choice;
  return rows[Math.min(selected, rows.length - 1)] ?? null;
};

const stageLabel = (position: number, total: number, atEnd: boolean, hasChoice: boolean): string => {
  const action = atEnd ? 'activate to restart' : 'activate to continue';
  const choose = hasChoice ? ', arrow keys choose an option' : '';
  return `preview box ${position} of ${total}, ${action}${choose}`;
};

const PreviewView = (props: PreviewViewProps) => {
  const { blocks, terms, metrics, sheet } = props;

  const [at, setAt] = useState(0);
  const { opts, nameSample, digit, handleName, handleDigit } = useSampleValues();

  const screens = useMemo(
    () => (metrics === null ? [] : previewScreens({ doc: blocks, metrics, terms, opts })),
    [blocks, metrics, terms, opts],
  );

  const shownAt = Math.min(at, Math.max(screens.length - 1, 0));
  const shown: PreviewScreen | undefined = screens[shownAt];
  const atEnd = shownAt >= screens.length - 1;
  const optionCount = shown?.choice?.rows.length ?? 0;

  const handleAdvance = useCallback(() => setAt((current) => current + 1), []);
  const handleRestart = useCallback(() => setAt(0), []);

  const { selected, advanceTick, stageRef, handleActivate, handleKeyDown } = usePreviewControls({
    atEnd, optionCount, onAdvance: handleAdvance, onRestart: handleRestart,
  });

  if (metrics === null) return <EmptyState message={LOADING_MESSAGE} />;
  if (shown === undefined) return <EmptyState message={NO_SCREENS_MESSAGE} />;

  const hasChoice = shown.choice !== null;
  const scrolled = advanceTick > 0 && shown.rows.some((row) => row.carried);

  return (
    <Box className="preview-view">
      <Box className="preview-view__stage">
        <Box
          ref={stageRef}
          role="button"
          tabIndex={0}
          aria-label={stageLabel(shown.index + 1, screens.length, atEnd, hasChoice)}
          className="preview-view__advance"
          onClick={handleActivate}
          onKeyDown={handleKeyDown}
        >
          <PreviewBox
            rows={shown.rows}
            sheet={sheet}
            metrics={metrics}
            cursorRow={cursorRowOf(shown, selected)}
            optionRows={shown.choice?.rows}
            waiting={shown.ends === 'wait' && !atEnd}
            scrolled={scrolled}
            scrollKey={advanceTick}
          />
        </Box>
        <PreviewPrompt
          ends={shown.ends}
          position={shown.index + 1}
          total={screens.length}
          hasChoice={hasChoice}
        />
      </Box>

      <PreviewSamples nameSample={nameSample} digit={digit} onName={handleName} onDigit={handleDigit} />
    </Box>
  );
};

export { PreviewView };
