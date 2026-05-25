interface GameLayerProps {
  assetData: Uint8Array | null;
  configIni?: string;
  profileId?: string;
  stretch?: boolean;
  edgeEffect?: boolean;
  shadowCasting?: boolean;
}

export type {
  GameLayerProps,
};
