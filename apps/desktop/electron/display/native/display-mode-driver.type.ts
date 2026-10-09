/* @layer electron-main @kind types */
interface DisplayModeDriver {
  readonly platform: string;
  readonly available: boolean;
  readonly unavailableReason: string;
  listRates: () => number[];
  currentRate: () => number | null;
  setRate: (hz: number) => boolean;
}

export type { DisplayModeDriver };
