/* @layer renderer-components @kind types */
import type { AxisSubStep, CaptureState, InputItem } from '../hid-calibration.type';

interface ButtonMappingProps {
  items: InputItem[];
  buttonItems: InputItem[];
  buttonCapturedCount: number;
  activeIndex: number;
  inputPhaseActive: boolean;
  autoAdvance: boolean;
  captureState: CaptureState;
  axisSubStep: AxisSubStep;
  instruction: string;
  prereqsDone: boolean;
  onStartButtons: () => void;
  onSkip: () => void;
  onGoBack: () => void;
  onClickItem: (idx: number) => void;
  onClearItem: (idx: number) => void;
  setAutoAdvanceWrapped: (v: boolean) => void;
  setInputPhaseActiveWrapped: (v: boolean) => void;
  stepTitle?: string;
  includeStickTriggerIds?: boolean;
  showAxisSubStep?: boolean;
}

type ButtonMappingInstructionProps = Pick<
  ButtonMappingProps,
  'items' | 'activeIndex' | 'captureState' | 'axisSubStep' | 'instruction'
> & { showAxisSubStep: boolean };

type ButtonMappingListProps = Pick<
  ButtonMappingProps,
  'items' | 'activeIndex' | 'inputPhaseActive' | 'onClickItem' | 'onClearItem'
> & { includeStickTriggerIds: boolean };

type ButtonMappingActionsProps = Pick<
  ButtonMappingProps,
  'activeIndex' | 'inputPhaseActive' | 'autoAdvance' | 'onStartButtons' | 'onSkip' | 'onGoBack' | 'setAutoAdvanceWrapped' | 'setInputPhaseActiveWrapped'
>;

interface ButtonMappingItemProps {
  item: InputItem;
  index: number;
  isActive: boolean;
  onClickItem: (idx: number) => void;
  onClearItem: (idx: number) => void;
}

export type {
  ButtonMappingActionsProps, ButtonMappingInstructionProps, ButtonMappingItemProps, ButtonMappingListProps, ButtonMappingProps,
};
