/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { effectiveFeatureIds } from '../live-settings-gate';
import { sessionGateArmed } from '../session-gate-flags';
import {
  CHEAT_PERMISSION_BITS,
  FEATURE_FLAGS_3,
  NATIVE_MESSAGE_SESSION_GATES,
  PARITY_SESSION_GATES,
} from './live-settings-flags.constants';

const hudOverrideWanted = (s: GameSettings): boolean =>
  (s.hudMode === 'enhanced' && (s.hudEnhancedParts.includes('main') || s.hudEnhancedParts.includes('pause')))
  || s.dialogBox === 'enhanced';

const dialogControlsWanted = (s: GameSettings): boolean =>
  s.dialogSpeed !== 1 || s.dialogHoldToAccelerate || s.dialogFillOnB || s.dialogTypewriter;

const divergenceBits = (s: GameSettings): number => {
  if (s.vanillaSafe) return 0;
  let flags = FEATURE_FLAGS_3.trackerNotifications;
  if (s.cheatsEnabled) flags |= CHEAT_PERMISSION_BITS;
  for (const gate of PARITY_SESSION_GATES) {
    if (sessionGateArmed(gate)) flags |= FEATURE_FLAGS_3[gate];
  }
  if (s.linkSprite) flags |= FEATURE_FLAGS_3.playerSpriteOverride;
  if (hudOverrideWanted(s)) flags |= FEATURE_FLAGS_3.hudOverride;
  if (dialogControlsWanted(s)) flags |= FEATURE_FLAGS_3.dialogControls;
  if (sessionGateArmed('receiptGrants')) flags |= FEATURE_FLAGS_3.receiptExport | FEATURE_FLAGS_3.receiptMessages;
  if (NATIVE_MESSAGE_SESSION_GATES.some((gate) => sessionGateArmed(gate))) flags |= FEATURE_FLAGS_3.receiptMessages;
  return flags;
};

const hostDataBits = (s: GameSettings): number => {
  let flags = FEATURE_FLAGS_3.renderQueries | FEATURE_FLAGS_3.overlayQueries;
  if (s.trackerEnabled) flags |= FEATURE_FLAGS_3.trackerQueries;
  if (s.developerToolsEnabled && s.devNavigationData) flags |= FEATURE_FLAGS_3.navigationQueries;
  const cheatsCanDeliver = s.cheatsEnabled && !s.vanillaSafe;
  if (cheatsCanDeliver || sessionGateArmed('itemOverrides') || sessionGateArmed('receiptGrants')) flags |= FEATURE_FLAGS_3.deliveryQueries;
  return flags;
};

const presentationBits = (s: GameSettings): number => {
  const presentation = effectiveFeatureIds(s);
  let flags = 0;
  if (presentation.has('coloredRupees')) flags |= FEATURE_FLAGS_3.coloredRupees;
  if (presentation.has('itemSheen')) flags |= FEATURE_FLAGS_3.itemSheen;
  if (presentation.has('archeryNeedsBow')) flags |= FEATURE_FLAGS_3.archeryNeedsBow;
  return flags;
};

const buildFeatureWord3 = (s: GameSettings): number => {
  const vanillaSafeBit = s.vanillaSafe ? FEATURE_FLAGS_3.vanillaSafe : 0;
  return vanillaSafeBit | divergenceBits(s) | hostDataBits(s) | presentationBits(s);
};

export { buildFeatureWord3 };
