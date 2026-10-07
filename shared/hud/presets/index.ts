/* @layer shared-hud @kind data */
/**
 * The eight prebuilt subtrees a HUD document can start from
 * (`plans/hud-data-binding.html`, "Presets - the prebuilt pieces"). Each is
 * an ordinary `HudNode` in a JSON file - the SAME shape the outline already
 * edits, not a second document format - validated the moment this module
 * loads, the same discipline `built-in-layouts.ts` already holds itself to:
 * a preset that stopped being a valid subtree is a broken build, found at
 * the first import, not the first click.
 *
 * A PRESET IS A STARTING POINT, NOT A COMPONENT INSTANCE. `instantiatePreset`
 * hands back a fresh COPY with every id rekeyed, so two inserts of the same
 * preset never collide and nothing in the result points back at the preset
 * it came from - editing one copy can never reach into another, or into the
 * template itself.
 */
import { newId } from '../../storage/id';
import { validateNode } from '../layouts/validate-node';
import arrowIndicatorJson from './arrow-indicator.json';
import bombIndicatorJson from './bomb-indicator.json';
import dpadGroupJson from './dpad-group.json';
import faceGroupJson from './face-group.json';
import heartsJson from './hearts.json';
import keyIndicatorJson from './key-indicator.json';
import magicBarJson from './magic-bar.json';
import walletJson from './wallet.json';
import type { HudNode } from '../../types/hud/hud-node';

interface HudPreset {
  id: string;
  name: string;
  /** A single glyph, matching the toolbar's own icon-only convention. */
  icon: string;
  template: HudNode;
}

const readPreset = (id: string, name: string, icon: string, json: unknown): HudPreset => {
  const issues: string[] = [];
  const node = validateNode(json, `presets/${id}.json`, issues, new Set());
  if (!node) {
    throw new Error([`presets/${id}.json is not a valid HUD subtree:`, ...issues.map((e) => `  - ${e}`)].join('\n'));
  }
  return { id, name, icon, template: node };
};

const HUD_PRESETS: readonly HudPreset[] = [
  readPreset('hearts', 'Hearts', '♥', heartsJson),
  readPreset('magic-bar', 'Magic bar', '◆', magicBarJson),
  readPreset('arrow-indicator', 'Arrow indicator', '➢', arrowIndicatorJson),
  readPreset('bomb-indicator', 'Bomb indicator', '●', bombIndicatorJson),
  readPreset('key-indicator', 'Key indicator', '⚷', keyIndicatorJson),
  readPreset('wallet', 'Wallet', '🪙', walletJson),
  readPreset('face-group', 'Face group', '◉', faceGroupJson),
  readPreset('dpad-group', 'D-pad group', '✚', dpadGroupJson),
];

/** Fresh ids down the WHOLE subtree - readable (keeps the original's own id
 *  as a prefix) and, via `newId`, unique enough that inserting the same
 *  preset twice never collides with itself or with the rest of the document. */
const rekey = (node: HudNode): HudNode => {
  const id = `${node.id}-${newId().slice(0, 6)}`;
  if (node.kind === 'container') return { ...node, id, children: node.children.map(rekey) };
  const { element } = node;
  if (element.type === 'repeat') return { ...node, id, element: { ...element, child: rekey(element.child) } };
  if (element.type === 'switch') {
    return {
      ...node,
      id,
      element: {
        ...element,
        cases: element.cases.map((c) => ({ ...c, node: rekey(c.node) })),
        ...(element.otherwise ? { otherwise: rekey(element.otherwise) } : {}),
      },
    };
  }
  return { ...node, id };
};

const presetById = (id: string): HudPreset | undefined => HUD_PRESETS.find((preset) => preset.id === id);

/** A ready-to-insert COPY of a preset's subtree, or null for an unknown id -
 *  the toolbar's own insert path never has to trust a stale list. */
const instantiatePreset = (id: string): HudNode | null => {
  const preset = presetById(id);
  return preset ? rekey(preset.template) : null;
};

export { HUD_PRESETS, instantiatePreset, presetById };
export type { HudPreset };
