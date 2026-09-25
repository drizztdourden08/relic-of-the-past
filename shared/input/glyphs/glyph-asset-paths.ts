/* @layer shared-input @kind data */
/**
 * Icon key → bundled asset path, for every key the family layer actually
 * names. The family files say WHICH glyph a position gets ('xbox-a'); this
 * says where that glyph lives on disk.
 *
 * Paths are root-relative on purpose ('buttons/xbox/...'), never absolute
 * and never run through the renderer's publicAsset helper: this layer is
 * shared with the Node side, which has no import.meta.env to ask. The
 * renderer prefixes them when it builds a URL.
 *
 * A key with no artwork is absent, and the glyph fallback chain (see
 * resolve-glyph.ts) then answers from the generic pack, which covers every
 * position.
 */

const withFolder = (folder: string, files: Record<string, string>): Record<string, string> => {
  return Object.fromEntries(Object.entries(files).map(([key, file]) => [key, `buttons/${folder}/${file}.svg`]));
};

const SWITCH_FILES: Record<string, string> = {
  'switch-a': 'switch_button_a', 'switch-b': 'switch_button_b', 'switch-x': 'switch_button_x',
  'switch-y': 'switch_button_y', 'switch-l': 'switch_button_l', 'switch-r': 'switch_button_r',
  'switch-zl': 'switch_button_zl', 'switch-zr': 'switch_button_zr', 'switch-c': 'switch_button_c',
  'switch-plus': 'switch_button_plus', 'switch-minus': 'switch_button_minus',
  'switch-home': 'switch_button_home', 'switch-capture': 'switch_button_capture',
  'switch-gl': 'switch_button_gl', 'switch-gr': 'switch_button_gr',
  'switch-ls': 'switch_stick_l_press', 'switch-rs': 'switch_stick_r_press',
  'switch-dup': 'switch_dpad_up', 'switch-ddown': 'switch_dpad_down',
  'switch-dleft': 'switch_dpad_left', 'switch-dright': 'switch_dpad_right',
  'switch-stick-l': 'switch_stick_l', 'switch-stick-r': 'switch_stick_r',
};

const XBOX_FILES: Record<string, string> = {
  'xbox-a': 'xbox_button_a', 'xbox-b': 'xbox_button_b', 'xbox-x': 'xbox_button_x',
  'xbox-y': 'xbox_button_y', 'xbox-lb': 'xbox_lb', 'xbox-rb': 'xbox_rb',
  'xbox-lt': 'xbox_lt', 'xbox-rt': 'xbox_rt',
  'xbox-ls': 'xbox_stick_l_press', 'xbox-rs': 'xbox_stick_r_press',
  'xbox-menu': 'xbox_button_menu', 'xbox-view': 'xbox_button_view',
  'xbox-share': 'xbox_button_share', 'xbox-guide': 'xbox_guide', 'xbox-home': 'xbox_guide',
  'xbox-dup': 'xbox_dpad_up', 'xbox-ddown': 'xbox_dpad_down',
  'xbox-dleft': 'xbox_dpad_left', 'xbox-dright': 'xbox_dpad_right',
  'xbox-stick-l': 'xbox_stick_l', 'xbox-stick-r': 'xbox_stick_r',
};

const PLAYSTATION_FILES: Record<string, string> = {
  'ps-cross': 'playstation_button_cross', 'ps-circle': 'playstation_button_circle',
  'ps-square': 'playstation_button_square', 'ps-triangle': 'playstation_button_triangle',
  'ps-l1': 'playstation_trigger_l1', 'ps-r1': 'playstation_trigger_r1',
  'ps-l2': 'playstation_trigger_l2', 'ps-r2': 'playstation_trigger_r2',
  'ps-l3': 'playstation_button_l3', 'ps-r3': 'playstation_button_r3',
  'ps-options': 'playstation5_button_options', 'ps-create': 'playstation5_button_create',
  // The pad's own Share button is printed "Create" on the current model.
  'ps-share': 'playstation5_button_create',
  'ps-dup': 'playstation_dpad_up', 'ps-ddown': 'playstation_dpad_down',
  'ps-dleft': 'playstation_dpad_left', 'ps-dright': 'playstation_dpad_right',
  'ps-stick-l': 'playstation_stick_l', 'ps-stick-r': 'playstation_stick_r',
};

const GC_FILES: Record<string, string> = {
  'gc-a': 'gc_button_a', 'gc-b': 'gc_button_b', 'gc-x': 'gc_button_x', 'gc-y': 'gc_button_y',
  'gc-l': 'gc_trigger_l', 'gc-r': 'gc_trigger_r', 'gc-zl': 'gc_button_z', 'gc-zr': 'gc_button_z',
  'gc-start': 'gc_button_start', 'gc-chat': 'gc_button_chat', 'gc-home': 'gc_button_home',
  'gc-capture': 'gc_button_capture',
  'gc-dup': 'gc_dpad_up', 'gc-ddown': 'gc_dpad_down',
  'gc-dleft': 'gc_dpad_left', 'gc-dright': 'gc_dpad_right',
  'gc-stick-l': 'gc_stick_l', 'gc-stick-c': 'gc_stick_c',
};

const GENERIC_FILES: Record<string, string> = {
  'generic-btn': 'generic_button', 'generic-btn-circle': 'generic_button_circle',
  'generic-btn-square': 'generic_button_square',
  'generic-trigger-a': 'generic_button_trigger_a', 'generic-trigger-b': 'generic_button_trigger_b',
  // Three silhouettes × solid/filled/outline. An unrecognised pad stacks up to
  // four controls per side (bumper, trigger, two paddles) and the glyph pack
  // needs a different picture for each (see built-in-packs.ts).
  'generic-trigger-a-fill': 'generic_button_trigger_a_fill',
  'generic-trigger-a-outline': 'generic_button_trigger_a_outline',
  'generic-trigger-b-fill': 'generic_button_trigger_b_fill',
  'generic-trigger-b-outline': 'generic_button_trigger_b_outline',
  'generic-trigger-c': 'generic_button_trigger_c',
  'generic-trigger-c-fill': 'generic_button_trigger_c_fill',
  'generic-stick': 'generic_stick', 'generic-stick-press': 'generic_stick_press',
  'generic-stick-up': 'generic_stick_up', 'generic-stick-down': 'generic_stick_down',
  'generic-stick-left': 'generic_stick_left', 'generic-stick-right': 'generic_stick_right',
  'generic-joystick': 'generic_joystick',
};

const SNES_FILES: Record<string, string> = {
  'snes-a': 'snes_a', 'snes-b': 'snes_b', 'snes-x': 'snes_x', 'snes-y': 'snes_y',
  'snes-l': 'snes_l', 'snes-r': 'snes_r',
  'snes-start': 'snes_start', 'snes-select': 'snes_select',
  'snes-dup': 'snes_dpad_up', 'snes-ddown': 'snes_dpad_down',
  'snes-dleft': 'snes_dpad_left', 'snes-dright': 'snes_dpad_right',
};

const GLYPH_ASSET_PATHS: Record<string, string> = {
  ...withFolder('switch', SWITCH_FILES),
  ...withFolder('xbox', XBOX_FILES),
  ...withFolder('playstation', PLAYSTATION_FILES),
  ...withFolder('gc', GC_FILES),
  ...withFolder('generic', GENERIC_FILES),
  ...withFolder('snes', SNES_FILES),
};

const glyphAssetPath = (iconKey: string): string | null => GLYPH_ASSET_PATHS[iconKey] ?? null;

export { GLYPH_ASSET_PATHS, glyphAssetPath };
