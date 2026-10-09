/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { LayerBlockProps } from './tooltip.type';
import { S } from './styles';
import { ClassificationRows } from './classification-rows';
import { reachStatusFor } from './reach-status';

const LayerBlock = ({ name, nameColor, data, locked }: LayerBlockProps) => {
  const status = reachStatusFor(data.reach, data.classification.collision, data.isAboveLayer);
  const nameStyle = useMemo(() => ({ color: nameColor }), [nameColor]);
  const statusStyle = useMemo(() => ({ color: status.color }), [status.color]);
  return (
    <Box style={S.col}>
      <Box style={S.layerHeadRow}>
        <Text style={nameStyle}>
          {name}
          {locked && <Text style={S.lockedTag}> LOCKED</Text>}
        </Text>
        <Text style={statusStyle}>{status.label}</Text>
      </Box>
      <ClassificationRows attr={data.classification.attr} classification={data.classification} canPass={data.canPass} />
    </Box>
  );
};

export { LayerBlock };
