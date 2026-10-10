/* @layer renderer-components @kind constants */
import bodySrc from '../../../../art/mascot/mascot-body.svg';
import visorSrc from '../../../../art/mascot/mascot-visor.svg';
import eyeSrc from '../../../../art/mascot/mascot-eye.svg';
import podLeftSrc from '../../../../art/mascot/mascot-pod-left.svg';
import podRightSrc from '../../../../art/mascot/mascot-pod-right.svg';
import type { PieceName } from '../Mascot.type';

const SOURCES: Record<PieceName, string> = {
  body: bodySrc,
  visor: visorSrc,
  eye: eyeSrc,
  podLeft: podLeftSrc,
  podRight: podRightSrc,
};

export { SOURCES };
