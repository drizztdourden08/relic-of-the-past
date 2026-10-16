/* @layer renderer-components @kind component */
import { Box, Text, SegmentedControl } from '@drizztdourden08/tessera/primitives';
import type { GloveLevel } from '@rotp/game-data';
import { GLOVE_OPTIONS, OUTFIT_OPTIONS } from './WearingBar.constants';
import type { WearingBarProps } from './WearingBar.type';
import './WearingBar.css';

const WearingBar = (props: WearingBarProps) => {
  const { outfit, gloves, onOutfit, onGloves, flat = false } = props;

  return (
    <Box className={`wearing-bar${flat ? ' wearing-bar--flat' : ''}`}>
      <Text className="wearing-bar__label">Wearing</Text>
      <SegmentedControl
        value={outfit}
        options={OUTFIT_OPTIONS}
        onChange={(v) => onOutfit(v)}
      />
      <Text className="wearing-bar__label">Gloves</Text>
      <SegmentedControl
        value={String(gloves)}
        options={GLOVE_OPTIONS}
        onChange={(v) => onGloves(Number(v) as GloveLevel)}
      />
    </Box>
  );
};

export { WearingBar };
