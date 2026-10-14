/* @layer bridge-wasm @kind logic */
import { setNpcGrantOverride, setNpcGrantSpriteOverride } from '../../../npc-grant-overrides';
import { allocateFireId } from '../../override-fire-registry';
import { logOverride } from './log-override';
import type { OverrideApplier } from './override-applier.type';

const applyNpcOverride: OverrideApplier = (entry, context) => {
  if (entry.npcOverride === undefined) return;
  const { roomId, vanillaItemId, spriteType, targetLocalId } = entry.npcOverride;
  const messageId = context.receiptLineOf(entry.location, targetLocalId);
  const fireId = allocateFireId(entry.location);
  if (spriteType !== undefined) {
    setNpcGrantSpriteOverride({ spriteType, vanillaItem: vanillaItemId, newItem: targetLocalId, messageId, fireId });
  } else {
    setNpcGrantOverride({ roomId, vanillaItem: vanillaItemId, newItem: targetLocalId, messageId, fireId });
  }
  logOverride(context.tag, entry, 'giver grant', targetLocalId);
};

export { applyNpcOverride };
