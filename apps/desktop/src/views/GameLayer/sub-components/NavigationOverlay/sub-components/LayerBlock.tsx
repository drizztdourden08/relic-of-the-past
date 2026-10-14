/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { LayerBlockProps } from '@app/navigation-overlay/tooltip/tooltip.type';
import { ClassificationRows } from './ClassificationRows';
import { reachStatusFor } from '@app/navigation-overlay/tooltip/reach-status';

const LayerBlock = ({ name, nameTone, data, locked }: LayerBlockProps) => {
  const status = reachStatusFor(data.reach, data.classification.collision, data.isAboveLayer);
  return (
    <Box className="nav-tip__col">
      <Box className="nav-tip__layer-head">
        <Text data-tone={nameTone}>
          {name}
          {locked && <Text className="nav-tip__locked-tag"> LOCKED</Text>}
        </Text>
        <Text data-tone={status.tone}>{status.label}</Text>
      </Box>
      <ClassificationRows attr={data.classification.attr} classification={data.classification} canPass={data.canPass} />
    </Box>
  );
};

export { LayerBlock };
