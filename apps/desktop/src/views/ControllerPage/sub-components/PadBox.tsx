/* @layer renderer-components @kind component */
import { Card } from '@drizztdourden08/tessera/primitives';
import { PadOverlay } from '@app/composites/PadOverlay';
import { UnavailableControllerNotice } from '@app/compounds/UnavailableControllerNotice';
import type { BoxProps } from '../ControllerPage.type';

const PadBox = ({ page }: BoxProps) => {
  const { overlay, overlayState, name, addMapping } = page;
  return (
    <Card title="Live input" subtitle="Press buttons and move the sticks" className="controller-page__pad">
      {overlay ? (
        <PadOverlay
          outline={overlay.outline}
          anchors={overlay.anchors}
          slots={overlay.slots}
          state={overlayState}
          label={name}
        />
      ) : (
        <UnavailableControllerNotice onAddMapping={addMapping} />
      )}
    </Card>
  );
};

export { PadBox };
