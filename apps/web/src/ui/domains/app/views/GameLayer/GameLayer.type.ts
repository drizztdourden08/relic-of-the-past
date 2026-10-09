/* @layer renderer-components @kind types */
interface GameLayerProps {
  assetData: Uint8Array | null;
  configIni?: string;
  profileId?: string;
  stretch?: boolean;
  pixelPerfect?: boolean;
  edgeEffect?: boolean;
  shadowCasting?: boolean;
  developerToolsEnabled?: boolean;
}

interface BufferSize {
  w: number;
  h: number;
}

interface DisplaySize {
  width: number;
  height: number;
}

export type {
  BufferSize,
  DisplaySize,
  GameLayerProps,
};
