/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { SegmentedControl } from '@ds/primitives/SegmentedControl';
import { OUTFIT_LABELS, GLOVE_LABELS, GLOVE_LEVELS } from '../behavior/useWearing';
import type { OutfitId, GloveLevel } from '@shared/game/data/player-sheet/types';
import { OUTFIT_IDS } from '@shared/game/data/player-sheet/types';

interface WearingBarProps {
  outfit: OutfitId;
  gloves: GloveLevel;
  onOutfit: (outfit: OutfitId) => void;
  onGloves: (gloves: GloveLevel) => void;
}

const OUTFIT_OPTIONS = OUTFIT_IDS.map((id) => ({ value: id, label: OUTFIT_LABELS[id] }));
const GLOVE_OPTIONS = GLOVE_LEVELS.map((g) => ({ value: String(g), label: GLOVE_LABELS[g] }));

/**
 * Outfit and glove level, the two palette axes the game varies at runtime. They are
 * independent controls because the engine treats them that way: the glove colour is written
 * over one row entry whichever outfit is loaded.
 */
const WearingBar = (props: WearingBarProps) => {
  const { outfit, gloves, onOutfit, onGloves } = props;

  return (
    <Box className="wearing-bar">
      <Text className="wearing-bar__label">Wearing</Text>
      <SegmentedControl
        value={outfit}
        options={OUTFIT_OPTIONS}
        onChange={(v) => onOutfit(v as OutfitId)}
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
export type { WearingBarProps };
