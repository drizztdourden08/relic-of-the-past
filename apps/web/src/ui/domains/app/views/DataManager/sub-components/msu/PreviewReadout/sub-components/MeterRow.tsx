/* @layer renderer-components @kind component */
/**
 * One gauge line: the file it is playing (or the word `next` for a countdown), the bar, the
 * number, and the fade marker when that sound is on the move. The bar is drawn only when the row
 * has a denominator — a row with nothing to divide by keeps its caption and its wording, because a
 * bar sitting at zero reads as stuck rather than as "no measurement here".
 *
 * Every row is the same shape whether a layer has one sound or five, so stacked rows line up
 * column for column and can be compared at a glance.
 *
 * The colour separates the two readings without needing the caption: green for something already
 * sounding, gold for the thing being waited for.
 */
import { Box } from '@ds/primitives/Box';
import { ProgressBar } from '@ds/primitives/ProgressBar';
import { Text } from '@ds/primitives/Text';
import { FadeChip } from './FadeChip';
import type { MeterRowProps } from '../PreviewReadout.type';

const MeterRow = (props: MeterRowProps) => {
  const { row } = props;

  return (
    <Box className="layer-meter__gauge" data-kind={row.kind} data-bar={row.fill === null ? 'no' : 'yes'}>
      <Text className="layer-meter__caption" title={row.title ?? undefined}>{row.caption}</Text>
      {row.fill !== null && (
        <ProgressBar
          className="layer-meter__bar"
          value={row.fill}
          secondaryValue={row.introFill ?? undefined}
          max={1}
          live
          variant={row.kind === 'next' ? 'gold' : 'green'}
        />
      )}
      <Text className="layer-meter__label">{row.label}</Text>
      {row.fade !== null && <FadeChip fade={row.fade} />}
    </Box>
  );
};

export { MeterRow };
