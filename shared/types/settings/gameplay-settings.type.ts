/* @layer shared-types @kind types */
interface GameplaySettings {
  autoSkipDialog: boolean;
  prefillFileName: boolean;
  turnWhileDashing: boolean;
  allowDiving: boolean;
  mirrorToDarkworld: boolean;
  collectItemsWithSword: boolean;
  breakPotsWithSword: boolean;
  disableLowHealthBeep: boolean;
  skipIntroOnKeypress: boolean;
  disableTelepathy: boolean;
  showMaxItemsInYellow: boolean;
  moreActiveBombs: boolean;
  carryMoreRupees: boolean;
  miscBugFixes: boolean;
  gameChangingBugFixes: boolean;
  cancelBirdTravel: boolean;
  bugFixToggles?: Record<string, boolean>;
  archeryNeedsBow: boolean;
  extraDungeon: boolean;
}

export type { GameplaySettings };
