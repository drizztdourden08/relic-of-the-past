/* @layer renderer-app @kind hook */
import { useCallback, useRef } from 'react';
import type { ListenerExtraContext } from '@drizztdourden08/brock-input/renderer';
import type { InputBinding } from '@rotp/game-data';
import { TOUCH_PAD_KEY, touchDefaultBinding } from '@rotp/input-mapping';
import { TOUCH_DEVICE_PRODUCT_ID, TOUCH_DEVICE_VENDOR_ID } from '@app/input/touch-pad/touch-device.constants';
import { swallowNextClick } from './swallow-next-click';
import { toBindTarget } from './to-bind-target';

const useTouchCapture = (ctx: ListenerExtraContext) => {
  const { target, capture } = ctx;
  const sent = useRef(false);

  const send = useCallback((binding: InputBinding): void => {
    if (sent.current) return;
    sent.current = true;
    capture({ binding, deviceKey: TOUCH_PAD_KEY, vendorId: TOUCH_DEVICE_VENDOR_ID, productId: TOUCH_DEVICE_PRODUCT_ID });
  }, [capture]);

  const pick = useCallback((binding: InputBinding): void => {
    swallowNextClick();
    send(binding);
  }, [send]);

  const restoreDefault = useCallback(() => send(touchDefaultBinding(toBindTarget(target))), [send, target]);

  return { pick, restoreDefault };
};

export { useTouchCapture };
