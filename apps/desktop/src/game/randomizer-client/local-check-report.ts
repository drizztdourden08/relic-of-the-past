/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { deliverItem, deliverNpcCheck } from '../delivery-api';
import { itemKeyName, COMPLETION_NOTE } from '@rotp/randomizer';
import type { PlanEntry } from '@rotp/randomizer';
import type { MessageIdOf } from './apply-overrides';

const deliverEntry = (entry: PlanEntry, messageId: number): void => {
  if (entry.targetLocalId === undefined) {
    log.randomizer(`[Local] Cannot deliver "${entry.item}" for "${entry.location}": unresolvable`, 'error');
    return;
  }
  const contextual = messageId >= 0 ? messageId : undefined;
  const queued = entry.npcGrant !== undefined
    ? deliverNpcCheck({
      ...entry.npcGrant,
      itemId: entry.targetLocalId,
      message: itemKeyName(entry.item),
      source: 'randomizer',
      messageId: contextual,
    })
    : deliverItem(entry.targetLocalId, itemKeyName(entry.item), 'randomizer', contextual);
  if (queued === null) {
    log.randomizer(`[Local] Delivery refused for "${entry.location}": game not running or module gone`, 'error');
  }
};

const reportLocalCheck = (location: string, entry: PlanEntry | undefined, messageIdOf: MessageIdOf): void => {
  if (!entry) {
    log.randomizer(`[Local] Check completed: ${location} (not in plan, nothing to do)`, 'warn');
    return;
  }
  const note = COMPLETION_NOTE[entry.planClass];
  if (note !== undefined) {
    log.randomizer(`[Local] Check completed: ${location}: "${entry.item}" ${note}`);
    return;
  }
  if (entry.planClass === 'vanilla-locked') {
    log.randomizer(`[Local] Check completed: ${location}: vanilla "${entry.item}" (locked, no action)`);
    return;
  }
  log.randomizer(`[Local] Check completed: ${location}: delivering "${entry.item}"`);
  deliverEntry(entry, messageIdOf(location));
};

export { reportLocalCheck };
