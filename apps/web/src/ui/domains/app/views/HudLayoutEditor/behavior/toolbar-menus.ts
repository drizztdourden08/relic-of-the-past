/* @layer renderer-components @kind logic */
/**
 * Everything the toolbar's LIST-style buttons can insert or start from.
 *
 * Sprite and Glyph are not built here. Both are picked by eye, in the
 * design system's `SpritePicker` composite / this editor's own
 * `GlyphPickerGrid`, because a name in a menu row is
 * exactly what "pick by looking" is against. Slot is not built here either,
 * for a related but distinct reason (see `SlotPickerPanel`). This file is
 * what remains a plain list: containers, the spacer, the four dynamic
 * objects, the eight subtree presets, and the "start from" layout list. Any
 * new element kind still needs a way in here or it cannot be inserted at all.
 *
 * THE FOUR VITALS ARE GONE (phase 5, `plans/hud-data-binding.html`,
 * "Presets, and deleting the black boxes"). `life`/`magic`/`consumables`/
 * `wallet` no longer exist in `HudElementSpec`, so there is nothing left for
 * a "Vitals" group to insert. `subtreePresetItems` below is what replaces it:
 * a heart, a magic bar, a wallet and the rest are ordinary subtrees now, and
 * the toolbar's own Preset menu is where a document reaches for one.
 *
 * EVERY ROW CARRIES AN ICON, in the same column, so a menu reads as a column
 * of pictures with a name beside it instead of a wall of text.
 *
 * AND THE ICONS ARE LUCIDE NOW (§50). They were Unicode characters such as
 * `▤ ▥ ↻ ⑂`, which is why the maintainer's verdict on this toolbar was "they
 * suck": a text glyph is drawn by whatever font the OS picked, at whatever
 * weight, with no relation to the pictures around it. Lucide through
 * `@iconify/react` is the project's convention and is one stroke weight at 16px.
 *
 * ROW AND COLUMN TAKE THE ICON THAT DRAWS WHAT THEY DO, NOT THE ONE THAT SHARES
 * THEIR NAME. A flex ROW puts its children side by side, which is the picture
 * Lucide calls `columns`; a flex COLUMN stacks them, which is `rows`. Naming the
 * icon after the container would have every menu row showing the wrong
 * arrangement, so the arrangement wins.
 */
import columnsIcon from '@iconify-icons/lucide/columns';
import rowsIcon from '@iconify-icons/lucide/rows';
import layersIcon from '@iconify-icons/lucide/layers';
import gridIcon from '@iconify-icons/lucide/grid-3x3';
import layoutIcon from '@iconify-icons/lucide/layout';
import layoutTemplateIcon from '@iconify-icons/lucide/layout-template';
import moveHorizontalIcon from '@iconify-icons/lucide/move-horizontal';
import typeIcon from '@iconify-icons/lucide/type';
import circleDotIcon from '@iconify-icons/lucide/circle-dot';
import repeatIcon from '@iconify-icons/lucide/repeat';
import gitBranchIcon from '@iconify-icons/lucide/git-branch';
import zapIcon from '@iconify-icons/lucide/zap';
import timerIcon from '@iconify-icons/lucide/timer';
import starIcon from '@iconify-icons/lucide/star';
import bookmarkIcon from '@iconify-icons/lucide/bookmark';
import gamepadIcon from '@iconify-icons/lucide/gamepad-2';
import squareDotIcon from '@iconify-icons/lucide/square-dot';
import imageIcon from '@iconify-icons/lucide/image';
import magnetIcon from '@iconify-icons/lucide/magnet';
import { HUD_PRESETS, instantiatePreset } from '@shared/hud/presets';
import { SDL_BUTTON } from '@shared/input/sdl-buttons';
import {
  newButton, newContainer, newCountdown, newElement, newGrid, newOverlap, newRepeat, newSwitch, newText,
} from './new-node';
import type { MenuEntry, MenuIconSource } from '@ds/composites/DropdownMenu';
import type { HudLayout, HudNode } from '@shared/types/hud';

interface MenuDeps {
  insert: (node: HudNode) => void;
}

interface ToolbarGroup {
  key: string;
  icon: MenuIconSource;
  label: string;
  items: MenuEntry[];
}

/** Every position a pack is keyed by, plus the synthetic whole-d-pad cross. */
const GLYPH_POSITIONS: readonly string[] = ['DPAD', ...Object.keys(SDL_BUTTON)];

const containerItems = (deps: MenuDeps): MenuEntry[] => ([
  { key: 'row', icon: columnsIcon, label: 'Row', onClick: () => deps.insert(newContainer('row')) },
  { key: 'column', icon: rowsIcon, label: 'Column', onClick: () => deps.insert(newContainer('column')) },
  // "Overlay" is a GRID preset now, not a third flex direction (§42): a 1x1
  // grid whose children share the cell. The menu row exists so the common case
  // is one click instead of a grid plus a `place` typed onto every child.
  { key: 'overlay', icon: layersIcon, label: 'Overlay', onClick: () => deps.insert(newOverlap()) },
  // The fourth entry is the whole of "grid becomes authorable in the panel
  // instead of by hand" (phase 7 of `plans/hud-inspector-ux-review.html`):
  // the engine, the inspector and the stage overlay all shipped, and the only
  // way to reach a grid was still to insert a Row and flip its engine.
  { key: 'grid', icon: gridIcon, label: 'Grid', onClick: () => deps.insert(newGrid()) },
]);

/** The four objects (`plans/hud-data-binding.html`, phase 3) - the group
 *  §23's own toolbar pass left out because none of them existed in
 *  `HudElementSpec` yet. `Text`/`Button` are picked visually elsewhere in the
 *  full design (a font/glyph picker, phase 7); here each row inserts the
 *  minimum a validator accepts, ready for the inspector to tune. The
 *  countdown (§62) sits beside them: it is one element that draws live data,
 *  and it has nothing to pick by eye. */
const dynamicsItems = (deps: MenuDeps): MenuEntry[] => ([
  { key: 'text', icon: typeIcon, label: 'Text', onClick: () => deps.insert(newText()) },
  { key: 'button', icon: circleDotIcon, label: 'Button', onClick: () => deps.insert(newButton()) },
  { key: 'repeat', icon: repeatIcon, label: 'Repeat', onClick: () => deps.insert(newRepeat()) },
  { key: 'switch', icon: gitBranchIcon, label: 'Switch', onClick: () => deps.insert(newSwitch()) },
  { key: 'countdown', icon: timerIcon, label: 'Countdown', onClick: () => deps.insert(newCountdown()) },
]);

const buildToolbarGroups = (deps: MenuDeps): ToolbarGroup[] => [
  { key: 'container', icon: layoutIcon, label: 'Container', items: containerItems(deps) },
  {
    key: 'spacer',
    icon: moveHorizontalIcon,
    label: 'Spacer',
    items: [{ key: 'spacer', icon: moveHorizontalIcon, label: 'Spacer', onClick: () => deps.insert(newElement({ type: 'spacer' })) }],
  },
  { key: 'dynamics', icon: zapIcon, label: 'Dynamics', items: dynamicsItems(deps) },
];

/** The eight prebuilt subtrees (`shared/hud/presets/`) - a heart, a magic
 *  bar, the four counters, the wallet, the face and d-pad groups. Each
 *  insert is a fresh COPY (`instantiatePreset`) with every id already
 *  rekeyed, fully editable the moment it lands - nothing left points back at
 *  the preset it came from. */
const subtreePresetItems = (deps: MenuDeps): MenuEntry[] =>
  HUD_PRESETS.map((preset) => ({
    key: preset.id,
    icon: preset.icon,
    label: preset.name,
    onClick: () => {
      const node = instantiatePreset(preset.id);
      if (node) deps.insert(node);
    },
  }));

/** The "start from" layout list, as an icon-only toolbar menu. It is the same
 *  list `PresetBar` shows, reachable without scrolling the right rail. */
const presetItems = (layouts: readonly HudLayout[], draftId: string, onStartFrom: (layout: HudLayout) => void): MenuEntry[] =>
  layouts.map((layout) => ({
    key: layout.id,
    icon: layout.builtIn ? starIcon : bookmarkIcon,
    label: layout.name,
    checked: layout.id === draftId,
    onClick: () => onStartFrom(layout),
  }));

const TOOLBAR_ICONS = {
  container: layoutIcon,
  glyph: gamepadIcon,
  slot: squareDotIcon,
  sprite: imageIcon,
  spacer: moveHorizontalIcon,
  dynamics: zapIcon,
  preset: layoutTemplateIcon,
  gridView: gridIcon,
  snapping: magnetIcon,
} as const;

export { GLYPH_POSITIONS, TOOLBAR_ICONS, buildToolbarGroups, presetItems, subtreePresetItems };
export type { MenuDeps, ToolbarGroup };
