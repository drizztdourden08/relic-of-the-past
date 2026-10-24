/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Card } from '@drizztdourden08/tessera/primitives';
import { PadOverlay } from '@app/composites/PadOverlay';
import { UnavailableControllerNotice } from '@app/compounds/UnavailableControllerNotice';
import type { BoxProps } from '../ControllerPage.type';

const PadBox = ({ page }: BoxProps) => {
  const { overlay, overlayState, name, addMapping } = page;
  const [grown, setGrown] = useState(false);
  return (
    <Card title="Live input" fill={!grown} className="controller-page__pad">
      {overlay ? (
        <PadOverlay
          outline={overlay.outline}
          anchors={overlay.anchors}
          slots={overlay.slots}
          state={overlayState}
          label={name}
          onGrownChange={setGrown}
        />
      ) : (
        <UnavailableControllerNotice onAddMapping={addMapping} />
      )}
    </Card>
  );
};

export { PadBox };
