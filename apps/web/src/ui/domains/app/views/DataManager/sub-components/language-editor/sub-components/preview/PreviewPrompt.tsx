/* @layer renderer-components @kind component */
/**
 * The instruction line under the box: where the reader is, and what moves it.
 *
 * The box above IS the button, so this line does not need to be pressed — it
 * states the position and names the actions, and the action text carries the
 * accent colour so a first-time reader cannot miss that the preview moves.
 * A choice prompt adds the arrow-key hint, and the last box swaps the advance
 * wording for a restart.
 */
import { Box, Text } from '@ds/primitives';
import type { Block } from '@shared/game/language';

type PreviewPromptProps = {
  ends: Block['ends'];
  /** 1-based, for the counter beside the instructions. */
  position: number;
  total: number;
  /** The shown box is a choice prompt, so the arrow-key hint applies. */
  hasChoice: boolean;
};

const PreviewPrompt = (props: PreviewPromptProps) => {
  const { ends, position, total, hasChoice } = props;
  const atEnd = position >= total;

  return (
    <Box className="preview-prompt">
      <Text as="span" variant="caption" className="preview-prompt__count">
        {`box ${position} of ${total}`}
      </Text>
      {atEnd && ends === 'message-end' ? (
        <Text as="span" variant="caption" className="preview-prompt__closed">
          the message closes here
        </Text>
      ) : null}
      {hasChoice ? (
        <Text as="span" variant="caption" className="preview-prompt__action">
          arrows to choose
        </Text>
      ) : null}
      <Text as="span" variant="caption" className="preview-prompt__action">
        {atEnd ? 'click or Space to restart' : 'click or Space to continue'}
      </Text>
    </Box>
  );
};

export { PreviewPrompt };
export type { PreviewPromptProps };
