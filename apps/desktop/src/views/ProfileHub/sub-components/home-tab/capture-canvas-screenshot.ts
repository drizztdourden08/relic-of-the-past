/* @layer renderer-components @kind logic */
import { captureGameFrameBlob } from '../../../../game';

const captureCanvasScreenshot = async (): Promise<ArrayBuffer | undefined> => {
  try {
    const blob = await captureGameFrameBlob();
    if (blob) return await blob.arrayBuffer();
  } catch {
    return undefined;
  }
  return undefined;
};

export { captureCanvasScreenshot };
