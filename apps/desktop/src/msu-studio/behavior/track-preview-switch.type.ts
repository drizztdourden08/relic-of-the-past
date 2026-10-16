/* @layer renderer-components @kind types */
type TrackPreviewSwitchParams = {
  onPreview: (trackNum: number) => Promise<void>;
  onStopPreview: () => void;
};

export type { TrackPreviewSwitchParams };
