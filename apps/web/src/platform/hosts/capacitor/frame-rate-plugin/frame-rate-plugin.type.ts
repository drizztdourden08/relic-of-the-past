/* @layer renderer-other @kind types */
interface FrameRateResult {
  applied: boolean;
  reason: string;
  targetHz?: number;
  sdkInt: number;
}

interface DisplayInfoResult {
  currentHz: number;
  supportedHz: string;
}

interface FrameRatePluginApi {
  setGameFrameRate: () => Promise<FrameRateResult>;
  getDisplayInfo: () => Promise<DisplayInfoResult>;
}

export type { FrameRateResult, DisplayInfoResult, FrameRatePluginApi };
