/* @layer renderer-widgets @kind constants */
/**
 * Per-CheckKind icon glyphs for the stop-at-check picker.
 *
 * No shared per-kind icon set exists elsewhere in the codebase, so the mapping
 * is defined locally here. Keep the keys in sync with the CheckKind union in
 * shared/game/data.
 */
import type { CheckKind } from '@shared/game/data';

const CHECK_TYPE_ICONS: Record<CheckKind, string> = {
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

const checkTypeIcon = (type: CheckKind): string => CHECK_TYPE_ICONS[type] ?? '•';

export { CHECK_TYPE_ICONS, checkTypeIcon };
