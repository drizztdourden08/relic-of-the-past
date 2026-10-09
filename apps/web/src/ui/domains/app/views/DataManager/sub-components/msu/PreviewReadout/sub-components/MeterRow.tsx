/* @layer renderer-components @kind component */
import { Box, ProgressBar, Text } from '@drizztdourden08/tessera/primitives';
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
          tone={row.kind === 'next' ? 'primary' : 'secondary'}
        />
      )}
      <Text className="layer-meter__label">{row.label}</Text>
      {row.fade !== null && <FadeChip fade={row.fade} />}
    </Box>
  );
};

export { MeterRow };
