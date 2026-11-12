/* @layer renderer-app @kind component */
import { Button, Card, Flex } from '@drizztdourden08/tessera/primitives';
import { emitLabel, GROUP_PRESET_IDS, GROUP_PRESETS } from '@rotp/input-mapping';
import { ALL_EMITS } from '../../TouchLayoutEditor.constants';
import './TouchAddCard.css';
import type { TouchAddCardProps } from './TouchAddCard.type';

const TouchAddCard = ({ onPick, onPickGroup }: TouchAddCardProps) => (
  <Card className="touch-add-card" onPointerDown={(event) => event.stopPropagation()}>
    <Flex direction="column" gap="sm">
      <Flex gap="xs" wrap>
        {GROUP_PRESET_IDS.map((presetId) => (
          <Button key={presetId} size="sm" variant="primary" onClick={() => onPickGroup(presetId)}>
            {GROUP_PRESETS[presetId].label}
          </Button>
        ))}
      </Flex>
      <Flex gap="xs" wrap>
        {ALL_EMITS.map((emit) => (
          <Button key={emit} size="sm" variant="secondary" onClick={() => onPick(emit)}>
            {emitLabel(emit)}
          </Button>
        ))}
      </Flex>
    </Flex>
  </Card>
);

export { TouchAddCard };
