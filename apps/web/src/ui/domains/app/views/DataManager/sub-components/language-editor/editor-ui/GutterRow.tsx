/* @layer renderer-components @kind component */
/**
 * One line's gutter row: which row of the box it lands on, how many pixels of
 * that row are still free, and how many characters it holds.
 *
 * It is exactly as tall as the line beside it and nothing here may change that —
 * the alignment between this column and the text is what makes the numbers mean
 * anything, so the row's height comes from the stylesheet and no content is
 * allowed to grow it.
 *
 * Overflow is stated three ways at once, because it is the one thing an author
 * must not scroll past: the figure goes negative, the cell fills, and the row is
 * announced. Colour is never the only signal.
 */
import { Box, Text } from '@ds/primitives';
import type { GutterRowModel } from './gutter-format';

type GutterRowProps = {
  model: GutterRowModel;
};

const classesOf = (model: GutterRowModel): string => [
  'line-gutter__row',
  model.boxStart ? 'line-gutter__row--box-start' : '',
  model.boxEnd ? 'line-gutter__row--box-end' : '',
  model.overflow ? 'line-gutter__row--overflow' : '',
].filter(Boolean).join(' ');

const GutterRow = (props: GutterRowProps) => {
  const { model } = props;
  const { cells, overflow } = model;

  return (
    <Box className={classesOf(model)} title={cells.title} role="row">
      <Text as="span" className="line-gutter__cell line-gutter__cell--row" role="cell">
        {cells.row}
      </Text>
      <Text
        as="span"
        className="line-gutter__cell line-gutter__cell--free"
        role="cell"
        aria-live={overflow ? 'polite' : undefined}
      >
        {cells.free}
      </Text>
      <Text as="span" className="line-gutter__cell line-gutter__cell--count" role="cell">
        {cells.count}
      </Text>
    </Box>
  );
};

export { GutterRow };
export type { GutterRowProps };
