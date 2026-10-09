/* @layer renderer-components @kind constants */
import handleSrc from '../../../assets/hookshop/hookshot-handle.svg';
import linkFaceSrc from '../../../assets/hookshop/hookshot-link-face.svg';
import linkEdgeSrc from '../../../assets/hookshop/hookshot-link-edge.svg';
import headSrc from '../../../assets/hookshop/hookshot-head.svg';
import type { SpriteName } from '../Hookshot.type';

const SOURCES: Record<SpriteName, string> = {
  handle: handleSrc,
  linkFace: linkFaceSrc,
  linkEdge: linkEdgeSrc,
  head: headSrc,
};

export { SOURCES };
