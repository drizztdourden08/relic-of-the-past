/* @layer renderer-stores @kind types */
import type { ScreenRecord } from '@shared/game/data';

interface LocationNotification {
  screen: ScreenRecord;
  timestamp: number;
}

interface TransitionNotification {
  entrance: string;
  timestamp: number;
}

interface LocationNotificationStore {
  screen: LocationNotification | null;
  transition: TransitionNotification | null;
  showScreen: boolean;
  showTransition: boolean;

  setScreen: (screen: ScreenRecord) => void;
  setTransition: (entrance: string) => void;
  clearScreen: () => void;
  clearTransition: () => void;
  setSettings: (showScreen: boolean, showTransition: boolean) => void;
}

export type { LocationNotification, LocationNotificationStore, TransitionNotification };
