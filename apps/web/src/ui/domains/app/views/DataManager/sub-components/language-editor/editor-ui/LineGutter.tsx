/* @layer renderer-components @kind component */
/**
 * The gutter — the column of numbers down the left of the text, the way a code
 * editor gutters its lines.
 *
 * It exists because the three facts about a line that decide whether it will
 * work are all invisible in the line itself: which of the box's rows it lands
 * on, how much of that row's width is left, and how many characters that is. Put
 * beside every line at once they turn an entry from a wall of text into
 * something an author can steer.
 *
 * It is a table by role rather than by markup, so the heading says what the three
 * columns are once instead of every row carrying its own explanation.
 */
import { useMemo } from 'react';
import { Box, Text } from '@ds/primitives';
import { buildGutterRows } from './gutter-format';
import { GutterRow } from './GutterRow';
import type { DialogueLineView } from '@shared/game/language';
import './LineGutter.css';

type LineGutterProps = {
  lines: DialogueLineView[];
  /** False while the set's font is unknown, when a width cannot be claimed. */
  pixelsKnown: boolean;
};

const HEADINGS = ['row', 'px', 'ch'];

const LineGutter = (props: LineGutterProps) => {
  const { lines, pixelsKnown } = props;

  const rows = useMemo(() => buildGutterRows(lines, pixelsKnown), [lines, pixelsKnown]);

  return (
    <Box className="line-gutter" role="table" aria-label="Row, pixels free, and characters per line">
      <Box className="line-gutter__head" role="row">
        {HEADINGS.map((heading) => (
          <Text key={heading} as="span" className="line-gutter__cell" role="columnheader">
            {heading}
          </Text>
        ))}
      </Box>
      {rows.map((model) => (
        <GutterRow key={model.key} model={model} />
      ))}
    </Box>
  );
};

export { LineGutter };
export type { LineGutterProps };
