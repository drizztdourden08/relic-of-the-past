/* @layer renderer-components @kind types */
interface GameLayerProps {
  assetData: Uint8Array | null;
  configIni?: string;
  profileId?: string;
  stretch?: boolean;
  pixelPerfect?: boolean;
  edgeEffect?: boolean;
  shadowCasting?: boolean;
  /** Master gate for the developer-only shadow-casting editor overlay/panel/element list. */
  developerToolsEnabled?: boolean;
}

export type {
  GameLayerProps,
};
