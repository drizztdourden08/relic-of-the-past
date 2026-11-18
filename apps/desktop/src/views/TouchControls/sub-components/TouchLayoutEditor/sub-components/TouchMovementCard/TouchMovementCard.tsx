/* @layer renderer-app @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Card, Flex, SegmentedControl, Slider } from '@drizztdourden08/tessera/primitives';
import { MOVEMENT_OPTIONS, MOVEMENT_SCALE_RANGE } from '../../TouchLayoutEditor.constants';
import './TouchMovementCard.css';
import type { TouchMovementCardProps } from './TouchMovementCard.type';

const TouchMovementCard = ({ type, scale, onType, onScale }: TouchMovementCardProps) => {
  const t = useT();
  return (
  <Card className="touch-movement-card" onPointerDown={(event) => event.stopPropagation()}>
    <Flex direction="column" gap="sm">
      <SegmentedControl size="sm" value={type} options={MOVEMENT_OPTIONS.map((o) => ({ value: o.value, label: t(o.key) }))} onChange={onType} />
      <Slider
        label={t('views-touch-controls:slider.size')}
        size="sm"
        {...MOVEMENT_SCALE_RANGE}
        value={scale}
        onChange={onScale}
        formatValue={(value) => `${Math.round(value * 100)}%`}
        showValue
      />
    </Flex>
  </Card>
  );
};

export { TouchMovementCard };
