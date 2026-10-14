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

interface StickCardState {
  label: string;
  xItem: InputItem | undefined;
  yItem: InputItem | undefined;
  needsIdle: boolean;
  isDone: boolean;
  isActive: boolean;
  isPicking: boolean;
  isRecording: boolean;
  otherBusy: boolean;
}

interface StickCardStatusProps {
  state: StickCardState;
  stickLiveInfo: string;
  stickPickedBytes: number[];
}

interface StickCardActionsProps {
  state: StickCardState;
  pickedCount: number;
  onConfirmPick: () => void;
  onCancelPick: () => void;
  onStopCircle: () => void;
  onReadIdle: () => void;
  onRedo: () => void;
  onStart: () => void;
  onPick: () => void;
  onSkip: () => void;
}

export type { StickCardActionsProps, StickCardProps, StickCardState, StickCardStatusProps, StickCardsProps };
