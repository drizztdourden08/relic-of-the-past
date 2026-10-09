/* @layer renderer-components @kind constants */
import bodySrc from '../../../assets/mascot/mascot-body.svg';
import visorSrc from '../../../assets/mascot/mascot-visor.svg';
import eyeSrc from '../../../assets/mascot/mascot-eye.svg';
import podLeftSrc from '../../../assets/mascot/mascot-pod-left.svg';
import podRightSrc from '../../../assets/mascot/mascot-pod-right.svg';
import type { PieceName } from '../Mascot.type';

const SOURCES: Record<PieceName, string> = {
  body: bodySrc,
  visor: visorSrc,
  eye: eyeSrc,
  podLeft: podLeftSrc,
  podRight: podRightSrc,
};

export { SOURCES };
