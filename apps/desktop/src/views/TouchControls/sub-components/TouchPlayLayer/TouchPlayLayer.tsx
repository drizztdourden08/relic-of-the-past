/* @layer renderer-app @kind component */
import { toPx } from '@rotp/input-mapping';
import { layerGeometry } from '../../behavior/layer-geometry';
import { HoldRing } from '@app/compounds/HoldRing';
import { TouchButton } from '@app/compounds/TouchButton';
import { TouchDpad } from '@app/compounds/TouchDpad';
import { TouchStick } from '@app/compounds/TouchStick';
import type { TouchPlayLayerProps } from './TouchPlayLayer.type';

const TouchPlayLayer = (props: TouchPlayLayerProps) => {
  const { layout, box, strength, view, ring } = props;
  const { size, radius, fixedBase } = layerGeometry(layout, box);
  const { movementType, movements } = layout;
  const stick = view.stick ?? (fixedBase ? { base: fixedBase, knob: fixedBase } : null);

  return (
    <>
      {layout.buttons.map((button) => (
        <TouchButton
          key={button.id}
          label={button.label}
          form={button}
          sizePx={size * button.scale}
          center={toPx(button.at, box)}
          pressed={view.pressed.has(button.id)}
          strength={strength}
        />
      ))}
      {stick && <TouchStick base={stick.base} knob={stick.knob} radiusPx={radius} strength={strength} active={view.stick !== null} />}
      {movementType === 'dpad' && (
        <TouchDpad center={toPx(movements.dpad.at, box)} radiusPx={radius} pressed={view.dpad} strength={strength} />
      )}
      {ring && <HoldRing center={ring.center} progress={ring.progress} />}
    </>
  );
};

export { TouchPlayLayer };
