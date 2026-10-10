/* @layer renderer-components @kind constants */
import handleSrc from '../../../../art/hookshop/hookshot-handle.svg';
import linkFaceSrc from '../../../../art/hookshop/hookshot-link-face.svg';
import linkEdgeSrc from '../../../../art/hookshop/hookshot-link-edge.svg';
import headSrc from '../../../../art/hookshop/hookshot-head.svg';
import type { SpriteName } from '../Hookshot.type';

const SOURCES: Record<SpriteName, string> = {
  handle: handleSrc,
  linkFace: linkFaceSrc,
  linkEdge: linkEdgeSrc,
  head: headSrc,
};

export { SOURCES };
