/* @layer renderer-app @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Button, Card, Flex, Select, Slider } from '@drizztdourden08/tessera/primitives';
import type { TouchEmit } from '@rotp/features';
import {
  BUTTON_HEIGHT_RANGE,
  BUTTON_RADIUS_RANGE,
  BUTTON_SCALE_RANGE,
  BUTTON_WIDTH_RANGE,
} from '../../TouchLayoutEditor.constants';
import { EMIT_OPTIONS } from './TouchButtonCard.constants';
import './TouchButtonCard.css';
import type { TouchButtonCardProps } from './TouchButtonCard.type';

const percent = (value: number) => `${Math.round(value * 100)}%`;

const TouchButtonCard = (props: TouchButtonCardProps) => {
  const t = useT();
  const { button, group, onEmit, onScale, onForm, onRemove, onLock } = props;
  return (
    <Card className="touch-button-card" onPointerDown={(event) => event.stopPropagation()}>
      <Flex direction="column" gap="sm">
        <Select
          size="sm"
          aria-label={t('views-touch-controls:button.sends')}
          options={EMIT_OPTIONS}
          value={button.emit}
          onChange={(value) => onEmit(value as TouchEmit)}
        />
        <Slider label={t('views-touch-controls:slider.size')} size="sm" {...BUTTON_SCALE_RANGE} value={button.scale} onChange={onScale} formatValue={percent} showValue />
        <Slider
          label={t('views-touch-controls:slider.width')}
          size="sm"
          {...BUTTON_WIDTH_RANGE}
          value={button.width}
          onChange={(width) => onForm({ width })}
          formatValue={percent}
          showValue
        />
        <Slider
          label={t('views-touch-controls:slider.height')}
          size="sm"
          {...BUTTON_HEIGHT_RANGE}
          value={button.height}
          onChange={(height) => onForm({ height })}
          formatValue={percent}
          showValue
        />
        <Slider
          label={t('views-touch-controls:slider.corners')}
          size="sm"
          {...BUTTON_RADIUS_RANGE}
          value={button.radius}
          onChange={(radius) => onForm({ radius })}
          formatValue={percent}
          showValue
        />
        <Flex gap="sm" wrap>
          {group && (
            <Button size="sm" variant="secondary" onClick={() => onLock(!group.locked)}>
              {group.locked ? t('views-touch-controls:button.unlockGroup') : t('views-touch-controls:button.lockGroup')}
            </Button>
          )}
          <Button size="sm" variant="danger" onClick={onRemove}>{t('views-touch-controls:button.remove')}</Button>
        </Flex>
      </Flex>
    </Card>
  );
};

export { TouchButtonCard };
