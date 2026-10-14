/* @layer renderer-components @kind component */
import { Canvas } from '@drizztdourden08/tessera/primitives';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../GameLayer.constants';
import type { GameLayerCanvasesProps } from './GameLayerCanvases.type';

const GameLayerCanvases = (props: GameLayerCanvasesProps) => {
  const { canvasKey, running, shadowDebugMode, canvasRef, fxCanvasRef, shadowCanvasRef } = props;
  const fxHidden = running ? '' : ' game-layer__fx-canvas--hidden';
  const shadowHidden = running ? '' : ' game-layer__shadow-canvas--hidden';
  const shadowBlend = shadowDebugMode ? ' game-layer__shadow-canvas--normal-blend' : '';

  return (
    <>
      <Canvas
        key={canvasKey}
        ref={canvasRef}
        id="canvas"
        className={`game-layer__canvas${running ? ' game-layer__canvas--hidden' : ' game-layer__canvas--idle'}`}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        tabIndex={0}
      />
      <Canvas
        key={`fx-${canvasKey}`}
        ref={fxCanvasRef}
        className={`game-layer__fx-canvas${fxHidden}`}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />
      <Canvas
        key={`shadow-${canvasKey}`}
        ref={shadowCanvasRef}
        className={`game-layer__shadow-canvas${shadowHidden}${shadowBlend}`}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />
    </>
  );
};

export { GameLayerCanvases };
