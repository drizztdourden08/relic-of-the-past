/**
 * Maps controller profile icon IDs to SVG file paths in /buttons/.
 */

const SWITCH_BASE = '/buttons/switch';
const XBOX_BASE = '/buttons/xbox';
const PS_BASE = '/buttons/playstation';
const SNES_BASE = '/buttons/snes';
const KB_BASE = '/buttons/keyboard';
const GENERIC_BASE = '/buttons/generic';
const GC_BASE = '/buttons/gc';

/** Icon ID → SVG path mapping */
const BUTTON_ICON_MAP: Record<string, string> = {
  // Switch (Pro Controller 2 / Pro Controller)
  'switch-a':       `${SWITCH_BASE}/switch_button_a.svg`,
  'switch-b':       `${SWITCH_BASE}/switch_button_b.svg`,
  'switch-x':       `${SWITCH_BASE}/switch_button_x.svg`,
  'switch-y':       `${SWITCH_BASE}/switch_button_y.svg`,
  'switch-l':       `${SWITCH_BASE}/switch_button_l.svg`,
  'switch-r':       `${SWITCH_BASE}/switch_button_r.svg`,
  'switch-zl':      `${SWITCH_BASE}/switch_button_zl.svg`,
  'switch-zr':      `${SWITCH_BASE}/switch_button_zr.svg`,
  'switch-plus':    `${SWITCH_BASE}/switch_button_plus.svg`,
  'switch-minus':   `${SWITCH_BASE}/switch_button_minus.svg`,
  'switch-home':    `${SWITCH_BASE}/switch_button_home.svg`,
  'switch-capture': `${SWITCH_BASE}/switch_button_capture.svg`,
  'switch-c':       `${SWITCH_BASE}/switch_button_c.svg`,
  'switch-gl':      `${SWITCH_BASE}/switch_button_gl.svg`,
  'switch-gr':      `${SWITCH_BASE}/switch_button_gr.svg`,
  'switch-ls':      `${SWITCH_BASE}/switch_stick_l_press.svg`,
  'switch-rs':      `${SWITCH_BASE}/switch_stick_r_press.svg`,
  'switch-dup':     `${SWITCH_BASE}/switch_dpad_up.svg`,
  'switch-ddown':   `${SWITCH_BASE}/switch_dpad_down.svg`,
  'switch-dleft':   `${SWITCH_BASE}/switch_dpad_left.svg`,
  'switch-dright':  `${SWITCH_BASE}/switch_dpad_right.svg`,

  // Switch stick directions
  'switch-stick-l':            `${SWITCH_BASE}/switch_stick_l.svg`,
  'switch-stick-l-up':         `${SWITCH_BASE}/switch_stick_l_up.svg`,
  'switch-stick-l-down':       `${SWITCH_BASE}/switch_stick_l_down.svg`,
  'switch-stick-l-left':       `${SWITCH_BASE}/switch_stick_l_left.svg`,
  'switch-stick-l-right':      `${SWITCH_BASE}/switch_stick_l_right.svg`,
  'switch-stick-l-horizontal': `${SWITCH_BASE}/switch_stick_l_horizontal.svg`,
  'switch-stick-l-vertical':   `${SWITCH_BASE}/switch_stick_l_vertical.svg`,
  'switch-stick-r':            `${SWITCH_BASE}/switch_stick_r.svg`,
  'switch-stick-r-up':         `${SWITCH_BASE}/switch_stick_r_up.svg`,
  'switch-stick-r-down':       `${SWITCH_BASE}/switch_stick_r_down.svg`,
  'switch-stick-r-left':       `${SWITCH_BASE}/switch_stick_r_left.svg`,
  'switch-stick-r-right':      `${SWITCH_BASE}/switch_stick_r_right.svg`,
  'switch-stick-r-horizontal': `${SWITCH_BASE}/switch_stick_r_horizontal.svg`,
  'switch-stick-r-vertical':   `${SWITCH_BASE}/switch_stick_r_vertical.svg`,

  // GameCube Wireless
  'gc-a':           `${GC_BASE}/gc_button_a.svg`,
  'gc-b':           `${GC_BASE}/gc_button_b.svg`,
  'gc-x':           `${GC_BASE}/gc_button_x.svg`,
  'gc-y':           `${GC_BASE}/gc_button_y.svg`,
  'gc-l':           `${GC_BASE}/gc_trigger_l.svg`,
  'gc-r':           `${GC_BASE}/gc_trigger_r.svg`,
  'gc-zl':          `${GC_BASE}/gc_button_z.svg`,
  'gc-zr':          `${GC_BASE}/gc_button_z.svg`,
  'gc-start':       `${GC_BASE}/gc_button_start.svg`,
  'gc-chat':        `${GC_BASE}/gc_button_chat.svg`,
  'gc-home':        `${GC_BASE}/gc_button_home.svg`,
  'gc-capture':     `${GC_BASE}/gc_button_capture.svg`,
  'gc-dup':         `${GC_BASE}/gc_dpad_up.svg`,
  'gc-ddown':       `${GC_BASE}/gc_dpad_down.svg`,
  'gc-dleft':       `${GC_BASE}/gc_dpad_left.svg`,
  'gc-dright':      `${GC_BASE}/gc_dpad_right.svg`,

  // GC stick directions
  'gc-stick-l':            `${GC_BASE}/gc_stick_l.svg`,
  'gc-stick-l-up':         `${GC_BASE}/gc_stick_l_up.svg`,
  'gc-stick-l-down':       `${GC_BASE}/gc_stick_l_down.svg`,
  'gc-stick-l-left':       `${GC_BASE}/gc_stick_l_left.svg`,
  'gc-stick-l-right':      `${GC_BASE}/gc_stick_l_right.svg`,
  'gc-stick-l-horizontal': `${GC_BASE}/gc_stick_l_horizontal.svg`,
  'gc-stick-l-vertical':   `${GC_BASE}/gc_stick_l_vertical.svg`,
  'gc-stick-c':            `${GC_BASE}/gc_stick_c.svg`,
  'gc-stick-c-up':         `${GC_BASE}/gc_stick_c_up.svg`,
  'gc-stick-c-down':       `${GC_BASE}/gc_stick_c_down.svg`,
  'gc-stick-c-left':       `${GC_BASE}/gc_stick_c_left.svg`,
  'gc-stick-c-right':      `${GC_BASE}/gc_stick_c_right.svg`,
  'gc-stick-c-horizontal': `${GC_BASE}/gc_stick_c_horizontal.svg`,
  'gc-stick-c-vertical':   `${GC_BASE}/gc_stick_c_vertical.svg`,

  // Xbox
  'xbox-a':         `${XBOX_BASE}/xbox_button_a.svg`,
  'xbox-b':         `${XBOX_BASE}/xbox_button_b.svg`,
  'xbox-x':         `${XBOX_BASE}/xbox_button_x.svg`,
  'xbox-y':         `${XBOX_BASE}/xbox_button_y.svg`,
  'xbox-lb':        `${XBOX_BASE}/xbox_lb.svg`,
  'xbox-rb':        `${XBOX_BASE}/xbox_rb.svg`,
  'xbox-lt':        `${XBOX_BASE}/xbox_lt.svg`,
  'xbox-rt':        `${XBOX_BASE}/xbox_rt.svg`,
  'xbox-ls':        `${XBOX_BASE}/xbox_stick_l_press.svg`,
  'xbox-rs':        `${XBOX_BASE}/xbox_stick_r_press.svg`,
  'xbox-menu':      `${XBOX_BASE}/xbox_button_menu.svg`,
  'xbox-view':      `${XBOX_BASE}/xbox_button_view.svg`,
  'xbox-share':     `${XBOX_BASE}/xbox_button_share.svg`,
  'xbox-guide':     `${XBOX_BASE}/xbox_guide.svg`,
  'xbox-home':      `${XBOX_BASE}/xbox_guide.svg`,
  'xbox-dup':       `${XBOX_BASE}/xbox_dpad_up.svg`,
  'xbox-ddown':     `${XBOX_BASE}/xbox_dpad_down.svg`,
  'xbox-dleft':     `${XBOX_BASE}/xbox_dpad_left.svg`,
  'xbox-dright':    `${XBOX_BASE}/xbox_dpad_right.svg`,

  // Xbox stick directions
  'xbox-stick-l':            `${XBOX_BASE}/xbox_stick_l.svg`,
  'xbox-stick-l-up':         `${XBOX_BASE}/xbox_stick_l_up.svg`,
  'xbox-stick-l-down':       `${XBOX_BASE}/xbox_stick_l_down.svg`,
  'xbox-stick-l-left':       `${XBOX_BASE}/xbox_stick_l_left.svg`,
  'xbox-stick-l-right':      `${XBOX_BASE}/xbox_stick_l_right.svg`,
  'xbox-stick-l-horizontal': `${XBOX_BASE}/xbox_stick_l_horizontal.svg`,
  'xbox-stick-l-vertical':   `${XBOX_BASE}/xbox_stick_l_vertical.svg`,
  'xbox-stick-r':            `${XBOX_BASE}/xbox_stick_r.svg`,
  'xbox-stick-r-up':         `${XBOX_BASE}/xbox_stick_r_up.svg`,
  'xbox-stick-r-down':       `${XBOX_BASE}/xbox_stick_r_down.svg`,
  'xbox-stick-r-left':       `${XBOX_BASE}/xbox_stick_r_left.svg`,
  'xbox-stick-r-right':      `${XBOX_BASE}/xbox_stick_r_right.svg`,
  'xbox-stick-r-horizontal': `${XBOX_BASE}/xbox_stick_r_horizontal.svg`,
  'xbox-stick-r-vertical':   `${XBOX_BASE}/xbox_stick_r_vertical.svg`,

  // PlayStation
  'ps-cross':       `${PS_BASE}/playstation_button_cross.svg`,
  'ps-circle':      `${PS_BASE}/playstation_button_circle.svg`,
  'ps-square':      `${PS_BASE}/playstation_button_square.svg`,
  'ps-triangle':    `${PS_BASE}/playstation_button_triangle.svg`,
  'ps-l1':          `${PS_BASE}/playstation_trigger_l1.svg`,
  'ps-r1':          `${PS_BASE}/playstation_trigger_r1.svg`,
  'ps-l2':          `${PS_BASE}/playstation_trigger_l2.svg`,
  'ps-r2':          `${PS_BASE}/playstation_trigger_r2.svg`,
  'ps-l3':          `${PS_BASE}/playstation_button_l3.svg`,
  'ps-r3':          `${PS_BASE}/playstation_button_r3.svg`,
  'ps-options':     `${PS_BASE}/playstation5_button_options.svg`,
  'ps-create':      `${PS_BASE}/playstation5_button_create.svg`,
  'ps-dup':         `${PS_BASE}/playstation_dpad_up.svg`,
  'ps-ddown':       `${PS_BASE}/playstation_dpad_down.svg`,
  'ps-dleft':       `${PS_BASE}/playstation_dpad_left.svg`,
  'ps-dright':      `${PS_BASE}/playstation_dpad_right.svg`,

  // SNES
  'snes-a':         `${SNES_BASE}/snes_a.svg`,
  'snes-b':         `${SNES_BASE}/snes_b.svg`,
  'snes-x':         `${SNES_BASE}/snes_x.svg`,
  'snes-y':         `${SNES_BASE}/snes_y.svg`,
  'snes-l':         `${SNES_BASE}/snes_l.svg`,
  'snes-r':         `${SNES_BASE}/snes_r.svg`,
  'snes-select':    `${SNES_BASE}/snes_select.svg`,
  'snes-start':     `${SNES_BASE}/snes_start.svg`,
  'snes-dup':       `${SNES_BASE}/snes_dpad_up.svg`,
  'snes-ddown':     `${SNES_BASE}/snes_dpad_down.svg`,
  'snes-dleft':     `${SNES_BASE}/snes_dpad_left.svg`,
  'snes-dright':    `${SNES_BASE}/snes_dpad_right.svg`,

  // Keyboard
  'kb-a': `${KB_BASE}/keyboard_a.svg`, 'kb-b': `${KB_BASE}/keyboard_b.svg`,
  'kb-c': `${KB_BASE}/keyboard_c.svg`, 'kb-d': `${KB_BASE}/keyboard_d.svg`,
  'kb-e': `${KB_BASE}/keyboard_e.svg`, 'kb-f': `${KB_BASE}/keyboard_f.svg`,
  'kb-g': `${KB_BASE}/keyboard_g.svg`, 'kb-h': `${KB_BASE}/keyboard_h.svg`,
  'kb-i': `${KB_BASE}/keyboard_i.svg`, 'kb-j': `${KB_BASE}/keyboard_j.svg`,
  'kb-k': `${KB_BASE}/keyboard_k.svg`, 'kb-l': `${KB_BASE}/keyboard_l.svg`,
  'kb-m': `${KB_BASE}/keyboard_m.svg`, 'kb-n': `${KB_BASE}/keyboard_n.svg`,
  'kb-o': `${KB_BASE}/keyboard_o.svg`, 'kb-p': `${KB_BASE}/keyboard_p.svg`,
  'kb-q': `${KB_BASE}/keyboard_q.svg`, 'kb-r': `${KB_BASE}/keyboard_r.svg`,
  'kb-s': `${KB_BASE}/keyboard_s.svg`, 'kb-t': `${KB_BASE}/keyboard_t.svg`,
  'kb-u': `${KB_BASE}/keyboard_u.svg`, 'kb-v': `${KB_BASE}/keyboard_v.svg`,
  'kb-w': `${KB_BASE}/keyboard_w.svg`, 'kb-x': `${KB_BASE}/keyboard_x.svg`,
  'kb-y': `${KB_BASE}/keyboard_y.svg`, 'kb-z': `${KB_BASE}/keyboard_z.svg`,
  'kb-0': `${KB_BASE}/keyboard_0.svg`, 'kb-1': `${KB_BASE}/keyboard_1.svg`,
  'kb-2': `${KB_BASE}/keyboard_2.svg`, 'kb-3': `${KB_BASE}/keyboard_3.svg`,
  'kb-4': `${KB_BASE}/keyboard_4.svg`, 'kb-5': `${KB_BASE}/keyboard_5.svg`,
  'kb-6': `${KB_BASE}/keyboard_6.svg`, 'kb-7': `${KB_BASE}/keyboard_7.svg`,
  'kb-8': `${KB_BASE}/keyboard_8.svg`, 'kb-9': `${KB_BASE}/keyboard_9.svg`,
  'kb-f1': `${KB_BASE}/keyboard_f1.svg`, 'kb-f2': `${KB_BASE}/keyboard_f2.svg`,
  'kb-f3': `${KB_BASE}/keyboard_f3.svg`, 'kb-f4': `${KB_BASE}/keyboard_f4.svg`,
  'kb-f5': `${KB_BASE}/keyboard_f5.svg`, 'kb-f6': `${KB_BASE}/keyboard_f6.svg`,
  'kb-f7': `${KB_BASE}/keyboard_f7.svg`, 'kb-f8': `${KB_BASE}/keyboard_f8.svg`,
  'kb-f9': `${KB_BASE}/keyboard_f9.svg`, 'kb-f10': `${KB_BASE}/keyboard_f10.svg`,
  'kb-f11': `${KB_BASE}/keyboard_f11.svg`, 'kb-f12': `${KB_BASE}/keyboard_f12.svg`,
  'kb-arrow-up':    `${KB_BASE}/keyboard_arrow_up.svg`,
  'kb-arrow-down':  `${KB_BASE}/keyboard_arrow_down.svg`,
  'kb-arrow-left':  `${KB_BASE}/keyboard_arrow_left.svg`,
  'kb-arrow-right': `${KB_BASE}/keyboard_arrow_right.svg`,
  'kb-space':       `${KB_BASE}/keyboard_space_icon.svg`,
  'kb-enter':       `${KB_BASE}/keyboard_enter.svg`,
  'kb-shift':       `${KB_BASE}/keyboard_shift_icon.svg`,
  'kb-ctrl':        `${KB_BASE}/keyboard_ctrl.svg`,
  'kb-alt':         `${KB_BASE}/keyboard_alt.svg`,
  'kb-tab':         `${KB_BASE}/keyboard_tab_icon.svg`,
  'kb-escape':      `${KB_BASE}/keyboard_escape.svg`,
  'kb-backspace':   `${KB_BASE}/keyboard_backspace_icon.svg`,
  'kb-capslock':    `${KB_BASE}/keyboard_capslock_icon.svg`,
  'kb-delete':      `${KB_BASE}/keyboard_delete.svg`,
  'kb-home':        `${KB_BASE}/keyboard_home.svg`,
  'kb-end':         `${KB_BASE}/keyboard_end.svg`,
  'kb-pageup':      `${KB_BASE}/keyboard_page_up.svg`,
  'kb-pagedown':    `${KB_BASE}/keyboard_page_down.svg`,
  'kb-insert':      `${KB_BASE}/keyboard_insert.svg`,
  'kb-comma':       `${KB_BASE}/keyboard_comma.svg`,
  'kb-period':      `${KB_BASE}/keyboard_period.svg`,
  'kb-semicolon':   `${KB_BASE}/keyboard_semicolon.svg`,
  'kb-quote':       `${KB_BASE}/keyboard_quote.svg`,
  'kb-slash':       `${KB_BASE}/keyboard_slash_forward.svg`,
  'kb-backslash':   `${KB_BASE}/keyboard_slash_back.svg`,
  'kb-minus':       `${KB_BASE}/keyboard_minus.svg`,
  'kb-equals':      `${KB_BASE}/keyboard_equals.svg`,
  'kb-bracketopen': `${KB_BASE}/keyboard_bracket_open.svg`,
  'kb-bracketclose':`${KB_BASE}/keyboard_bracket_close.svg`,
  'kb-tilde':       `${KB_BASE}/keyboard_tilde.svg`,

  // Generic controller
  'generic-btn':        `${GENERIC_BASE}/generic_button.svg`,
  'generic-btn-circle': `${GENERIC_BASE}/generic_button_circle.svg`,
  'generic-btn-square': `${GENERIC_BASE}/generic_button_square.svg`,
  'generic-trigger-a':  `${GENERIC_BASE}/generic_button_trigger_a.svg`,
  'generic-trigger-b':  `${GENERIC_BASE}/generic_button_trigger_b.svg`,
  'generic-stick':      `${GENERIC_BASE}/generic_stick.svg`,
  'generic-stick-up':   `${GENERIC_BASE}/generic_stick_up.svg`,
  'generic-stick-down': `${GENERIC_BASE}/generic_stick_down.svg`,
  'generic-stick-left': `${GENERIC_BASE}/generic_stick_left.svg`,
  'generic-stick-right':`${GENERIC_BASE}/generic_stick_right.svg`,
  'generic-stick-press':`${GENERIC_BASE}/generic_stick_press.svg`,
  'generic-joystick':   `${GENERIC_BASE}/generic_joystick.svg`,
};

/** Get icon URL for a profile button icon ID. Returns null if not mapped. */
const getButtonIconUrl = (iconId: string): string | null => {
  return BUTTON_ICON_MAP[iconId] ?? null;
}

/** Map KeyboardEvent.code → icon ID (e.g. "KeyZ" → "kb-z", "ArrowUp" → "kb-arrow-up") */
const keyCodeToIconId = (code: string): string | null => {
  if (code.startsWith('Key')) return `kb-${code.slice(3).toLowerCase()}`;
  if (code.startsWith('Digit')) return `kb-${code.slice(5)}`;
  const map: Record<string, string> = {
    ArrowUp: 'kb-arrow-up', ArrowDown: 'kb-arrow-down',
    ArrowLeft: 'kb-arrow-left', ArrowRight: 'kb-arrow-right',
    Space: 'kb-space', Enter: 'kb-enter', NumpadEnter: 'kb-enter',
    ShiftLeft: 'kb-shift', ShiftRight: 'kb-shift',
    ControlLeft: 'kb-ctrl', ControlRight: 'kb-ctrl',
    AltLeft: 'kb-alt', AltRight: 'kb-alt',
    Tab: 'kb-tab', Escape: 'kb-escape',
    Backspace: 'kb-backspace', CapsLock: 'kb-capslock',
    Delete: 'kb-delete', Home: 'kb-home', End: 'kb-end',
    PageUp: 'kb-pageup', PageDown: 'kb-pagedown', Insert: 'kb-insert',
    Comma: 'kb-comma', Period: 'kb-period', Semicolon: 'kb-semicolon',
    Quote: 'kb-quote', Slash: 'kb-slash', Backslash: 'kb-backslash',
    Minus: 'kb-minus', Equal: 'kb-equals',
    BracketLeft: 'kb-bracketopen', BracketRight: 'kb-bracketclose',
    Backquote: 'kb-tilde',
  };
  if (code.startsWith('F') && /^F\d+$/.test(code)) return `kb-${code.toLowerCase()}`;
  return map[code] ?? null;
}

/** SNES button name → SNES icon ID */
const SNES_ICON_MAP: Record<string, string> = {
  A: 'snes-a', B: 'snes-b', X: 'snes-x', Y: 'snes-y',
  L: 'snes-l', R: 'snes-r',
  Start: 'snes-start', Select: 'snes-select',
  Up: 'snes-dup', Down: 'snes-ddown', Left: 'snes-dleft', Right: 'snes-dright',
};

const getSnesIconUrl = (snesButton: string): string | null => {
  const iconId = SNES_ICON_MAP[snesButton];
  return iconId ? getButtonIconUrl(iconId) : null;
}

export {
  BUTTON_ICON_MAP,
  getButtonIconUrl,
  getSnesIconUrl,
  keyCodeToIconId
};
