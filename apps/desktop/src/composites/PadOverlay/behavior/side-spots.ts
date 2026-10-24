/* @layer renderer-components @kind logic */
import { ATTACH_GAP, FRAME_PAD, LABEL_GAP, LABEL_PAD } from '../PadOverlay.constants';
import type { LabelSize, LabelSpot, Scene } from './placement.type';
import { sideEdge } from './side-edge';

const sideSpots = (size: LabelSize, scene: Scene): LabelSpot[] => {
  const { w, h } = size;
  const { width, height } = scene.frame;
  const spots: LabelSpot[] = [];
  for (let y = FRAME_PAD + h / 2; y <= height - FRAME_PAD - h / 2; y += h / 2) {
    const edge = sideEdge(scene, y - h / 2 - LABEL_PAD, y + h / 2 + LABEL_PAD);
    if (!edge) continue;
    const top = y - h / 2;
    const bottom = y + h / 2;
    const leftX = edge.left - LABEL_GAP;
    if (leftX - w >= FRAME_PAD) {
      spots.push({ text: { x: leftX, y }, anchor: 'end', rect: { left: leftX - w, top, right: leftX, bottom }, attach: { x: leftX + ATTACH_GAP, y }, middle: false });
    }
    const rightX = edge.right + LABEL_GAP;
    if (rightX + w <= width - FRAME_PAD) {
      spots.push({ text: { x: rightX, y }, anchor: 'start', rect: { left: rightX, top, right: rightX + w, bottom }, attach: { x: rightX - ATTACH_GAP, y }, middle: false });
    }
  }
  return spots;
};

export { sideSpots };
