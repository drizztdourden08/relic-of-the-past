/* @layer renderer-components @kind constants */
import type { ComponentType } from 'react';
import type { OverlayPartKind, PartProps } from '../PadOverlay.type';
import { OverlayAnalog } from './OverlayAnalog';
import { OverlayButton } from './OverlayButton';
import { OverlayDpad } from './OverlayDpad';
import { OverlayStick } from './OverlayStick';

const PART_OF_KIND: Readonly<Record<OverlayPartKind, ComponentType<PartProps>>> = {
  button: OverlayButton, analog: OverlayAnalog, stick: OverlayStick, dpad: OverlayDpad,
};

export { PART_OF_KIND };
