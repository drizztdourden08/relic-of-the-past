/* @layer renderer-lib @kind data */
import type { LayoutFamily } from '../controller-families/controller-families.type';
import type { FamilyOverlay } from './pad-overlay.type';

const XBOX_OVERLAY: FamilyOverlay = {
  variant: 'offset',
  slots: [
    { anchor: 'face.south', kind: 'button', glyph: 'xbox-a', label: 'A' },
    { anchor: 'face.east', kind: 'button', glyph: 'xbox-b', label: 'B' },
    { anchor: 'face.west', kind: 'button', glyph: 'xbox-x', label: 'X' },
    { anchor: 'face.north', kind: 'button', glyph: 'xbox-y', label: 'Y' },
    { anchor: 'shoulder.left', kind: 'button', glyph: 'xbox-lb', label: 'LB' },
    { anchor: 'shoulder.right', kind: 'button', glyph: 'xbox-rb', label: 'RB' },
    { anchor: 'trigger.left', kind: 'analog', glyph: 'xbox-lt', label: 'LT' },
    { anchor: 'trigger.right', kind: 'analog', glyph: 'xbox-rt', label: 'RT' },
    { anchor: 'stick.left', kind: 'stick', glyph: 'xbox-stick-l', label: 'Left stick' },
    { anchor: 'stick.right', kind: 'stick', glyph: 'xbox-stick-r', label: 'Right stick' },
    { anchor: 'dpad.up', kind: 'dpad', glyph: '', label: 'D-pad', scale: 0.85 },
    { anchor: 'meta.view', kind: 'button', glyph: 'xbox-view', label: 'View' },
    { anchor: 'meta.menu', kind: 'button', glyph: 'xbox-menu', label: 'Menu' },
    { anchor: 'meta.guide', kind: 'button', glyph: 'xbox-guide', label: 'Xbox' },
    { anchor: 'meta.capture', kind: 'button', glyph: 'xbox-share', label: 'Share' },
  ],
};

const PLAYSTATION_OVERLAY: FamilyOverlay = {
  variant: 'symmetric',
  slots: [
    { anchor: 'face.south', kind: 'button', glyph: 'ps-cross', label: 'Cross' },
    { anchor: 'face.east', kind: 'button', glyph: 'ps-circle', label: 'Circle' },
    { anchor: 'face.west', kind: 'button', glyph: 'ps-square', label: 'Square' },
    { anchor: 'face.north', kind: 'button', glyph: 'ps-triangle', label: 'Triangle' },
    { anchor: 'shoulder.left', kind: 'button', glyph: 'ps-l1', label: 'L1' },
    { anchor: 'shoulder.right', kind: 'button', glyph: 'ps-r1', label: 'R1' },
    { anchor: 'trigger.left', kind: 'analog', glyph: 'ps-l2', label: 'L2' },
    { anchor: 'trigger.right', kind: 'analog', glyph: 'ps-r2', label: 'R2' },
    { anchor: 'stick.left', kind: 'stick', glyph: 'generic-stick', label: 'Left stick' },
    { anchor: 'stick.right', kind: 'stick', glyph: 'generic-stick', label: 'Right stick' },
    { anchor: 'dpad.up', kind: 'dpad', glyph: '', label: 'D-pad', scale: 0.85 },
    { anchor: 'meta.view', kind: 'button', glyph: 'ps-create', label: 'Share' },
    { anchor: 'meta.menu', kind: 'button', glyph: 'ps-options', label: 'Options' },
    { anchor: 'meta.guide', kind: 'button', glyph: 'generic-btn-circle', label: 'PS' },
    { anchor: 'meta.capture', kind: 'button', glyph: 'generic-btn', label: 'Mute' },
  ],
};

const NINTENDO_OVERLAY: FamilyOverlay = {
  variant: 'nintendo',
  slots: [
    { anchor: 'face.south', kind: 'button', glyph: 'switch-b', label: 'B' },
    { anchor: 'face.east', kind: 'button', glyph: 'switch-a', label: 'A' },
    { anchor: 'face.west', kind: 'button', glyph: 'switch-y', label: 'Y' },
    { anchor: 'face.north', kind: 'button', glyph: 'switch-x', label: 'X' },
    { anchor: 'shoulder.left', kind: 'button', glyph: 'switch-l', label: 'L' },
    { anchor: 'shoulder.right', kind: 'button', glyph: 'switch-r', label: 'R' },
    { anchor: 'trigger.left', kind: 'analog', glyph: 'switch-zl', label: 'ZL' },
    { anchor: 'trigger.right', kind: 'analog', glyph: 'switch-zr', label: 'ZR' },
    { anchor: 'stick.left', kind: 'stick', glyph: 'switch-stick-l', label: 'Left stick' },
    { anchor: 'stick.right', kind: 'stick', glyph: 'switch-stick-r', label: 'Right stick' },
    { anchor: 'dpad.up', kind: 'dpad', glyph: '', label: 'D-pad', scale: 0.85 },
    { anchor: 'meta.view', kind: 'button', glyph: 'switch-minus', label: 'Minus' },
    { anchor: 'meta.menu', kind: 'button', glyph: 'switch-plus', label: 'Plus' },
    { anchor: 'meta.guide', kind: 'button', glyph: 'switch-home', label: 'Home' },
    { anchor: 'meta.capture', kind: 'button', glyph: 'switch-capture', label: 'Capture' },
  ],
};

const GENERIC_OVERLAY: FamilyOverlay = {
  variant: 'offset',
  slots: [
    { anchor: 'face.south', kind: 'button', glyph: 'generic-btn-circle', label: 'S' },
    { anchor: 'face.east', kind: 'button', glyph: 'generic-btn-circle', label: 'E' },
    { anchor: 'face.west', kind: 'button', glyph: 'generic-btn-circle', label: 'W' },
    { anchor: 'face.north', kind: 'button', glyph: 'generic-btn-circle', label: 'N' },
    { anchor: 'shoulder.left', kind: 'button', glyph: 'generic-trigger-a', label: 'LB' },
    { anchor: 'shoulder.right', kind: 'button', glyph: 'generic-trigger-b', label: 'RB' },
    { anchor: 'trigger.left', kind: 'analog', glyph: 'generic-trigger-a', label: 'LT' },
    { anchor: 'trigger.right', kind: 'analog', glyph: 'generic-trigger-b', label: 'RT' },
    { anchor: 'stick.left', kind: 'stick', glyph: 'generic-stick', label: 'Left stick' },
    { anchor: 'stick.right', kind: 'stick', glyph: 'generic-stick', label: 'Right stick' },
    { anchor: 'dpad.up', kind: 'dpad', glyph: '', label: 'D-pad', scale: 0.85 },
    { anchor: 'meta.view', kind: 'button', glyph: 'generic-btn', label: 'Back' },
    { anchor: 'meta.menu', kind: 'button', glyph: 'generic-btn', label: 'Start' },
    { anchor: 'meta.guide', kind: 'button', glyph: 'generic-btn-circle', label: 'Guide' },
    { anchor: 'meta.capture', kind: 'button', glyph: 'generic-btn', label: 'Extra 1' },
  ],
};

const SNES_OVERLAY: FamilyOverlay = {
  variant: 'pad',
  slots: [
    { anchor: 'face.south', kind: 'button', glyph: 'snes-b', label: 'B' },
    { anchor: 'face.east', kind: 'button', glyph: 'snes-a', label: 'A' },
    { anchor: 'face.west', kind: 'button', glyph: 'snes-y', label: 'Y' },
    { anchor: 'face.north', kind: 'button', glyph: 'snes-x', label: 'X' },
    { anchor: 'shoulder.left', kind: 'button', glyph: 'snes-l', label: 'L' },
    { anchor: 'shoulder.right', kind: 'button', glyph: 'snes-r', label: 'R' },
    { anchor: 'dpad.up', kind: 'dpad', glyph: '', label: 'D-pad', scale: 0.85 },
    { anchor: 'meta.view', kind: 'button', glyph: 'snes-select', label: 'Select' },
    { anchor: 'meta.menu', kind: 'button', glyph: 'snes-start', label: 'Start' },
  ],
};

const FAMILY_OVERLAYS: Readonly<Record<LayoutFamily, FamilyOverlay>> = {
  xbox: XBOX_OVERLAY,
  playstation: PLAYSTATION_OVERLAY,
  nintendo: NINTENDO_OVERLAY,
  generic: GENERIC_OVERLAY,
  snes: SNES_OVERLAY,
};

export { FAMILY_OVERLAYS };
