/* @layer renderer-components @kind component */
import { Box, Text, SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { OUTFIT_IDS } from '@rotp/game-data';
import type { GloveLevel } from '@rotp/game-data';
import { poseLabelsOf } from '../../behavior/pose-labels';
import { GLOVE_LEVELS } from '../../behavior/useWearing';
import type { WearingBarProps } from './WearingBar.type';
import './WearingBar.css';

const WearingBar = (props: WearingBarProps) => {
  const { outfit, gloves, onOutfit, onGloves, flat = false, labels } = props;
  const text = poseLabelsOf(labels);
  const outfitOptions = OUTFIT_IDS.map((id) => ({ value: id, label: text.outfitName(id) }));
  const gloveOptions = GLOVE_LEVELS.map((g) => ({ value: String(g), label: text.gloveName(g) }));

  return (
    <Box className={`wearing-bar${flat ? ' wearing-bar--flat' : ''}`}>
      <Text className="wearing-bar__label">{text.wearing}</Text>
      <SegmentedControl
        value={outfit}
        options={outfitOptions}
        onChange={(v) => onOutfit(v)}
      />
      <Text className="wearing-bar__label">{text.gloves}</Text>
      <SegmentedControl
        value={String(gloves)}
        options={gloveOptions}
        onChange={(v) => onGloves(Number(v) as GloveLevel)}
      />
    </Box>
  );
};

export { WearingBar };
