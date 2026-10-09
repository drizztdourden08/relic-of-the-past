/* @layer renderer-components @kind component */
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
