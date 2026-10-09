/* @layer renderer-components @kind constants */
import handleSrc from '@app/assets/hookshop/hookshot-handle.svg';
import linkFaceSrc from '@app/assets/hookshop/hookshot-link-face.svg';
import linkEdgeSrc from '@app/assets/hookshop/hookshot-link-edge.svg';
import headSrc from '@app/assets/hookshop/hookshot-head.svg';
import type { SpriteName } from '../Hookshot.type';

const SOURCES: Record<SpriteName, string> = {
  handle: handleSrc,
  linkFace: linkFaceSrc,
  linkEdge: linkEdgeSrc,
  head: headSrc,
};

export { SOURCES };
