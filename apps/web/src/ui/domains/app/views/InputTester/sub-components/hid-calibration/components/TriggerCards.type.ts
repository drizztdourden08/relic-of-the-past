/* @layer renderer-components @kind types */
import type { InputItem, IdleRecordResult, TriggerSide } from '../hid-calibration.type';

interface TriggerCardsProps {
  items: InputItem[];
  activeTrigger: TriggerSide | null;
  triggerBusy: boolean;
  triggerLiveInfo: string;
  triggerPickMode: boolean;
  triggerPickedByte: number | null;
  idleRecording: string | null;
  idleResults: Record<string, IdleRecordResult>;
  onStartTrigger: (side: TriggerSide) => void;
  onStopTrigger: () => void;
  onSkipTrigger: (side: TriggerSide) => void;
  onTriggerRedo: (side: TriggerSide) => void;
  onTriggerPickMode: (side: TriggerSide) => void;
  onConfirmTriggerPick: () => void;
  onCancelTriggerPick: () => void;
  onIdleRecord: (label: string, byteIndices: number[]) => void;
}

interface TriggerCardProps extends TriggerCardsProps {
  side: TriggerSide;
}

export type { TriggerCardProps, TriggerCardsProps };
