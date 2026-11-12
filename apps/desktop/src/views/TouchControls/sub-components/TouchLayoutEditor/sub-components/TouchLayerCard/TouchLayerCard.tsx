/* @layer renderer-app @kind component */
import { Button, Card, Flex, SegmentedControl, Slider, Toggle } from '@drizztdourden08/tessera/primitives';
import { CELL_OPTIONS, HOLD_SECONDS_RANGE, STRENGTH_RANGE } from '../../TouchLayoutEditor.constants';
import './TouchLayerCard.css';
import type { TouchLayerCardProps } from './TouchLayerCard.type';

const percent = (value: number) => `${Math.round(value * 100)}%`;

const TouchLayerCard = ({ shared, onChange, onReset }: TouchLayerCardProps) => (
  <Card className="touch-layer-card" onPointerDown={(event) => event.stopPropagation()}>
    <Flex direction="column" gap="sm">
      <Slider
        label="Button strength"
        size="sm"
        {...STRENGTH_RANGE}
        value={shared.buttonStrength}
        onChange={(value) => onChange({ buttonStrength: value })}
        formatValue={percent}
        showValue
      />
      <Slider
        label="Background transparency"
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
          label="Snap to grid"
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
      <Toggle size="sm" label="Haptics" checked={shared.haptics} onChange={(haptics) => onChange({ haptics })} />
      <Slider
        label="Menu hold time"
        size="sm"
        {...HOLD_SECONDS_RANGE}
        value={shared.menuHoldMs / 1000}
        onChange={(seconds) => onChange({ menuHoldMs: Math.round(seconds * 1000) })}
        formatValue={(value) => `${value} s`}
        showValue
      />
      <Button size="sm" variant="danger" onClick={onReset}>Reset this layout</Button>
    </Flex>
  </Card>
);

export { TouchLayerCard };
