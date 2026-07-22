/* @layer renderer-widgets @kind constants */
/**
 * Per-CheckType icon glyphs for the stop-at-check picker.
 *
 * No shared per-CheckType icon set exists in the codebase — the checks/tracker
 * widget renders `check.type` as plain text — and this work may only touch the
 * simulator widget, so the mapping is defined locally here. Keep the keys in
 * sync with the CheckType union in shared/game/types.
 */
import type { CheckType } from '@shared/game/types';

const CHECK_TYPE_ICONS: Record<CheckType, string> = {
  chest: '🧰',
  npc: '🧑',
  standing: '✨',
  boss: '👹',
  prize: '🏆',
  keyDrop: '🗝️',
  potItem: '🏺',
  dig: '⛏️',
  bonk: '🌳',
  event: '⚑',
};

const checkTypeIcon = (type: CheckType): string => CHECK_TYPE_ICONS[type] ?? '•';

export { CHECK_TYPE_ICONS, checkTypeIcon };
