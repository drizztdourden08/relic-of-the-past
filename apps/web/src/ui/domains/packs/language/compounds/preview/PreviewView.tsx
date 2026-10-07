/* @layer renderer-components @kind component */
/**
 * The entry as the player meets it: one real box at a time, drawn with the
 * pack's own pixels, advanced by pressing the box.
 *
 * It holds exactly two pieces of state: which box is showing, and the sample
 * values standing in for the engine's own substitutions. The samples are
 * editable because they change the answer: a six-glyph name and a one-glyph name
 * are different rows, and "does this fit" is the question this view is being
 * asked. They default to the shared worst-case stand-ins, so the first look is
 * the cautious one.
 *
 * Everything about what is ON each box comes from `preview-screens.ts`, which
 * reads the engine's own walk. In particular a later box shows the rows it
 * INHERITS, dimmed: the pixel buffer is cleared once per message and never
 * again, so those rows really are still there, and a preview that dropped them
 * would be showing a screen the game never draws.
 *
 * The box is the button: it is focusable, focused when the mode opens, and
 * reacts to a click, Space or Enter. A box carrying a choice prompt also moves
 * its cursor with the arrow keys (`usePreviewControls`).
 */
import { useCallback, useMemo, useState } from 'react';
import { Box, EmptyState, Text, TextInput } from '@ds/primitives';
import { MAX_NAME_GLYPHS } from '@shared/game/language';
import { ENGINE_SAMPLES, NUMBER_KEY, PLAYER_NAME_KEY } from '@shared/game/language/variables';
import { PreviewBox } from './PreviewBox';
import { PreviewPrompt } from './PreviewPrompt';
import { previewScreens } from './preview-screens';
import { usePreviewControls } from './behavior/usePreviewControls';
import type { ChangeEvent } from 'react';
import type { BlockDoc, GlossaryTerm, GlyphMetrics, GlyphSheet } from '@shared/game/language';
import type { PreviewScreen } from './preview-screens';
import './PreviewView.css';

type PreviewViewProps = {
  blocks: BlockDoc;
  /** Every variable carrying literal text, so a reference can be expanded. */
  terms: GlossaryTerm[];
  metrics: GlyphMetrics | null;
  sheet: GlyphSheet | null;
};

const NO_SCREENS_MESSAGE = 'This entry cannot be drawn until its unresolved variables are fixed.';
const LOADING_MESSAGE = 'Reading this set\'s font...';

/** The row the cursor sits on for this box and selection, or null without a prompt. */
const cursorRowOf = (screen: PreviewScreen | undefined, selected: number): number | null => {
  if (screen === undefined || screen.choice === null) return null;
  const { rows } = screen.choice;
  return rows[Math.min(selected, rows.length - 1)];
};

const stageLabel = (position: number, total: number, atEnd: boolean, hasChoice: boolean): string => {
  const action = atEnd ? 'activate to restart' : 'activate to continue';
  const choose = hasChoice ? ', arrow keys choose an option' : '';
  return `preview box ${position} of ${total}, ${action}${choose}`;
};

const PreviewView = (props: PreviewViewProps) => {
  const { blocks, terms, metrics, sheet } = props;

  const [at, setAt] = useState(0);
  const [nameSample, setNameSample] = useState<string>(ENGINE_SAMPLES[PLAYER_NAME_KEY]);
  const [digit, setDigit] = useState<string>(ENGINE_SAMPLES[NUMBER_KEY]);

  const opts = useMemo(() => ({ nameSample, numberDigit: digit }), [nameSample, digit]);

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

  const handleName = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setNameSample(event.currentTarget.value.slice(0, MAX_NAME_GLYPHS));
  }, []);

  const handleDigit = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const last = event.currentTarget.value.slice(-1);
    setDigit(/^\d$/.test(last) ? last : '');
  }, []);

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

      <Box className="preview-view__samples">
        <Text as="span" variant="caption" className="preview-view__samples-title">
          sample values
        </Text>
        <Box className="preview-view__sample">
          <Text as="span" variant="caption" className="preview-view__sample-label">
            {`player name (${MAX_NAME_GLYPHS} max)`}
          </Text>
          <TextInput value={nameSample} onChange={handleName} />
        </Box>
        <Box className="preview-view__sample">
          <Text as="span" variant="caption" className="preview-view__sample-label">number digit</Text>
          <TextInput
            className="preview-view__digit"
            value={digit}
            onChange={handleDigit}
          />
        </Box>
      </Box>
    </Box>
  );
};

export { PreviewView };
export type { PreviewViewProps };
