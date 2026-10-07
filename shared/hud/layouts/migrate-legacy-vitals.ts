/* @layer shared-hud @kind logic */
/**
 * A stored document may still name one of the four opaque kinds phase 5 of
 * `plans/hud-data-binding.html` deleted (`life`, `magic`, `consumables`,
 * `wallet`) - a saved layout does not update itself the moment a build
 * ships. `load-layout.ts` runs every document through this ONCE, before
 * `validateLayout` ever sees it: a node naming one of the four is replaced
 * by that preset's own expanded subtree. No alias survives - the kind does
 * not keep working under a deprecated name, because an alias is exactly how
 * a project ends up with two ways to draw a heart forever (the plan's own
 * words for why presets are expand-and-forget in the first place).
 *
 * THE NODE'S OWN BOX PROPERTIES SURVIVE THE SWAP; ITS `element`/`children`
 * DO NOT. A player who set `scale: 0.75` or a custom `margin` on their own
 * `wallet` element kept that choice - it is carried onto the replacement
 * subtree's root - but there is nothing sensible to keep from the deleted
 * element spec itself.
 *
 * Runs on the RAW, untrusted value. Nothing here assumes the document is
 * otherwise well-formed - a malformed neighbour is still `validateLayout`'s
 * job to catch, exactly as before this pass existed.
 */

import { instantiatePreset } from '../presets';
import type { HudNode } from '../../types/hud/hud-node';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** `consumables` was never one subtree - it was three counters (bomb, arrow,
 *  key) stacked in a column with no gap, which is exactly how the built-in
 *  layouts assemble the same three presets today. */
const composedConsumables = (): HudNode => {
  const rows = ['bomb-indicator', 'arrow-indicator', 'key-indicator']
    .map((id) => instantiatePreset(id))
    .filter((node): node is HudNode => node !== null);
  return { kind: 'container', id: 'consumables', direction: 'column', children: rows };
};

const LEGACY_TYPES: readonly string[] = ['life', 'magic', 'consumables', 'wallet'];

const legacyReplacement = (type: string): HudNode | null => {
  if (type === 'life') return instantiatePreset('hearts');
  if (type === 'magic') return instantiatePreset('magic-bar');
  if (type === 'wallet') return instantiatePreset('wallet');
  if (type === 'consumables') return composedConsumables();
  return null;
};

/** One node (still raw JSON), migrated and recursed into. */
const migrateNode = (value: unknown): unknown => {
  if (!isRecord(value)) return value;

  if (value.kind === 'element' && isRecord(value.element) && typeof value.element.type === 'string') {
    const { type } = value.element;
    if (LEGACY_TYPES.includes(type)) {
      const replacement = legacyReplacement(type);
      if (replacement) {
        const { kind: _kind, element: _element, ...box } = value;
        const id = typeof value.id === 'string' && value.id ? value.id : replacement.id;
        return { ...replacement, ...box, id };
      }
    }
    if (value.element.type === 'repeat' && isRecord(value.element.child)) {
      return { ...value, element: { ...value.element, child: migrateNode(value.element.child) } };
    }
    if (value.element.type === 'switch') {
      const { element } = value;
      const cases = Array.isArray(element.cases)
        ? element.cases.map((entry) => (isRecord(entry) ? { ...entry, node: migrateNode(entry.node) } : entry))
        : element.cases;
      return {
        ...value,
        element: {
          ...element,
          cases,
          ...(element.otherwise !== undefined ? { otherwise: migrateNode(element.otherwise) } : {}),
        },
      };
    }
    return value;
  }

  if (value.kind === 'container' && Array.isArray(value.children)) {
    return { ...value, children: value.children.map(migrateNode) };
  }

  return value;
};

/** The whole document, migrated - the screen and everything under it. Runs
 *  AFTER `migrate-screen.ts` has folded `regions[]` in, so there is exactly
 *  one tree to walk, not nine. */
const migrateLegacyVitals = (value: unknown): unknown => {
  if (!isRecord(value) || !isRecord(value.screen)) return value;
  return { ...value, screen: migrateNode(value.screen) };
};

export { migrateLegacyVitals };
