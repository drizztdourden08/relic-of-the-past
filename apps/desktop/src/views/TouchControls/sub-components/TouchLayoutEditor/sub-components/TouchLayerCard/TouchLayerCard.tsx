/* @layer renderer-app @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Button, Card, Flex, SegmentedControl, Slider, Toggle } from '@drizztdourden08/tessera/primitives';
import { CELL_OPTIONS, HOLD_SECONDS_RANGE, STRENGTH_RANGE } from '../../TouchLayoutEditor.constants';
import './TouchLayerCard.css';
import type { TouchLayerCardProps } from './TouchLayerCard.type';

const percent = (value: number) => `${Math.round(value * 100)}%`;

const TouchLayerCard = ({ shared, onChange, onReset }: TouchLayerCardProps) => {
  const t = useT();
  return (
  <Card className="touch-layer-card" onPointerDown={(event) => event.stopPropagation()}>
    <Flex direction="column" gap="sm">
      <Slider
        label={t('views-touch-controls:layer.strength')}
        size="sm"
        {...STRENGTH_RANGE}
        value={shared.buttonStrength}
        onChange={(value) => onChange({ buttonStrength: value })}
        formatValue={percent}
        showValue
      />
      <Slider
        label={t('views-touch-controls:layer.transparency')}
        size="sm"
        min={0}
        max={1}
        step={0.05}
        value={1 - shared.layerOpacity}
        onChange={(value) => onChange({ layerOpacity: 1 - value })}
        formatValue={percent}
        showValue
      />
      <Flex gap="sm" align="center" wrap>
        <Toggle
          size="sm"
          label={t('views-touch-controls:layer.snap')}
          checked={shared.snap.enabled}
          onChange={(enabled) => onChange({ snap: { ...shared.snap, enabled } })}
        />
        <SegmentedControl
          size="sm"
          value={shared.snap.cell}
          options={[...CELL_OPTIONS]}
          disabled={!shared.snap.enabled}
          onChange={(cell) => onChange({ snap: { ...shared.snap, cell } })}
        />
      </Flex>
      <Toggle size="sm" label={t('views-touch-controls:layer.haptics')} checked={shared.haptics} onChange={(haptics) => onChange({ haptics })} />
      <Slider
        label={t('views-touch-controls:layer.hold')}
        size="sm"
        {...HOLD_SECONDS_RANGE}
        value={shared.editHoldMs / 1000}
        onChange={(seconds) => onChange({ editHoldMs: Math.round(seconds * 1000) })}
        formatValue={(value) => t('views-touch-controls:layer.holdSeconds', { seconds: value })}
        showValue
      />
      <Button size="sm" variant="danger" onClick={onReset}>{t('views-touch-controls:layer.reset')}</Button>
    </Flex>
  </Card>
  );
};

export { TouchLayerCard };
