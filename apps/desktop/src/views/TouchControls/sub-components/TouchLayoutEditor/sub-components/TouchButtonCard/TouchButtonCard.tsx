/* @layer renderer-app @kind component */
import { Button, Card, Flex, SegmentedControl, Select, Slider } from '@drizztdourden08/tessera/primitives';
import { emitLabel } from '@rotp/input-mapping';
import type { TouchEmit } from '@rotp/features';
import { ALL_EMITS, BUTTON_SCALE_RANGE, SHAPE_OPTIONS } from '../../TouchLayoutEditor.constants';
import './TouchButtonCard.css';
import type { TouchButtonCardProps } from './TouchButtonCard.type';

const EMIT_OPTIONS = ALL_EMITS.map((emit) => ({ value: emit, label: emitLabel(emit) }));

const TouchButtonCard = (props: TouchButtonCardProps) => {
  const { button, group, onEmit, onScale, onShape, onRemove, onLock } = props;
  return (
    <Card className="touch-button-card" onPointerDown={(event) => event.stopPropagation()}>
      <Flex direction="column" gap="sm">
        <Select
          size="sm"
          aria-label="Sends"
          options={EMIT_OPTIONS}
          value={button.emit}
          onChange={(value) => onEmit(value as TouchEmit)}
        />
        <Slider
          label="Size"
          size="sm"
          {...BUTTON_SCALE_RANGE}
          value={button.scale}
          onChange={onScale}
          formatValue={(value) => `${Math.round(value * 100)}%`}
          showValue
        />
        <SegmentedControl size="sm" value={button.shape} options={SHAPE_OPTIONS} onChange={onShape} />
        <Flex gap="sm" wrap>
          {group && (
            <Button size="sm" variant="secondary" onClick={() => onLock(!group.locked)}>
              {group.locked ? 'Unlock group' : 'Lock group'}
            </Button>
          )}
          <Button size="sm" variant="danger" onClick={onRemove}>Remove</Button>
        </Flex>
      </Flex>
    </Card>
  );
};

export { TouchButtonCard };
