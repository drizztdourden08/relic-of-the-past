/* @layer renderer-widgets @kind data */
/**
 * The `StatusBadge` label set for a screen's status, sourced from Enumeration
 * so every badge this widget renders stays in step with the canonical
 * `screen-status` labels instead of redeclaring its own copy. `'unsaved'`
 * isn't a real `ScreenRecord.status` value — it's `StatusBadge`'s own
 * stand-in for "no status yet" — so it keeps a plain literal rather than
 * reaching for a category that was never seeded to carry it.
 */
import { labelOf } from '@shared/game/data';
import type { StatusBadgeProps } from '@ds/primitives';

const SCREEN_STATUS_LABELS: NonNullable<StatusBadgeProps['labels']> = {
  unsaved: 'Unsaved',
  draft: labelOf('screen-status', 'draft') ?? 'Draft',
  mapped: labelOf('screen-status', 'mapped') ?? 'Mapped',
  verified: labelOf('screen-status', 'verified') ?? 'Verified',
};

export { SCREEN_STATUS_LABELS };
