/* @layer renderer-app @kind component */
import { Button, Card, Flex } from '@drizztdourden08/tessera/primitives';
import { emitLabel } from '@rotp/input-mapping';
import { ALL_EMITS } from '../../TouchLayoutEditor.constants';
import './TouchAddCard.css';
import type { TouchAddCardProps } from './TouchAddCard.type';

const TouchAddCard = ({ onPick }: TouchAddCardProps) => (
  <Card className="touch-add-card" onPointerDown={(event) => event.stopPropagation()}>
    <Flex gap="xs" wrap>
      {ALL_EMITS.map((emit) => (
        <Button key={emit} size="sm" variant="secondary" onClick={() => onPick(emit)}>
          {emitLabel(emit)}
        </Button>
      ))}
    </Flex>
  </Card>
);

export { TouchAddCard };
