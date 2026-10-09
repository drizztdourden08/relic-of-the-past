/* @layer renderer-components @kind component */
import { Box, Text } from '@ds/primitives';
import type { PreviewPromptProps } from './preview.type';

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
