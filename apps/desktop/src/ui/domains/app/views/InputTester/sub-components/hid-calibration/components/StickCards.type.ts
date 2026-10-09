/* @layer renderer-components @kind types */
import type { InputItem, StickSide } from '../hid-calibration.type';

interface StickCardsProps {
  items: InputItem[];
  activeStick: StickSide | null;
  stickBusy: boolean;
  stickLiveInfo: string;
  stickPickMode: boolean;
  stickPickedBytes: number[];
  onStartCircle: (side: StickSide) => void;
  onStopCircle: () => void;
  onSkipStick: (side: StickSide) => void;
  onStickRedo: (side: StickSide) => void;
  onStickIdle: (side: StickSide) => void;
  onStickPickMode: (side: StickSide) => void;
  onConfirmPick: () => void;
  onCancelPick: () => void;
}

interface StickCardProps extends StickCardsProps {
  side: StickSide;
}

export type { StickCardProps, StickCardsProps };
