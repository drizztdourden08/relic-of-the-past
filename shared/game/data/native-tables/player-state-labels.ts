/* @layer shared-game @kind data */
/**
 * Names for the engine's player action ids.
 *
 * The decompilation numbers these and never names them, so every label here was read off
 * the branch in `LinkOam_Main` that selects the id — the condition it tests is quoted as
 * the `from` field so a label can be checked rather than trusted. Anything that reads wrong
 * in the studio is a one-line edit here; nothing downstream depends on the wording.
 *
 * Frame counts are not listed: they come from the atlas, which derives them.
 */

type StateGroup = 'movement' | 'combat' | 'carrying' | 'water' | 'hazard' | 'special';

interface StateLabel {
  action: number;
  label: string;
  group: StateGroup;
  /** The condition in LinkOam_Main that selects this id. */
  from: string;
}

const GROUP_LABELS: Record<StateGroup, string> = {
  movement: 'Movement',
  combat: 'Combat',
  carrying: 'Carrying',
  water: 'Water',
  hazard: 'Hazard',
  special: 'Special',
};

const STATE_LABELS: readonly StateLabel[] = [
  { action: 0x00, label: 'Walk', group: 'movement', from: 'default, rt = link_animation_steps' },
  { action: 0x02, label: 'Swing', group: 'combat', from: 'button_mask_b_y, button_b_frames == 9' },
  { action: 0x03, label: 'Swing follow-through', group: 'combat', from: 'button_b_frames >= 10' },
  { action: 0x04, label: 'Fall into pit', group: 'hazard', from: 'player_near_pit_state' },
  { action: 0x05, label: 'Airborne', group: 'hazard', from: 'link_auxiliary_state == 1' },
  { action: 0x06, label: 'Hold item', group: 'carrying', from: 'kPlayerOam_Tab2[msb(link_item_in_hand)]' },
  { action: 0x07, label: 'Hold item, raised', group: 'carrying', from: 'kPlayerOam_Tab2[msb(link_item_in_hand)]' },
  { action: 0x08, label: 'Hold item, aimed', group: 'carrying', from: 'kPlayerOam_Tab2[msb(link_item_in_hand)]' },
  { action: 0x09, label: 'Hold item, low', group: 'carrying', from: 'kPlayerOam_Tab2[msb(link_item_in_hand)]' },
  { action: 0x0a, label: 'In grass or shallows', group: 'movement', from: 'draw_water_ripples_or_grass' },
  { action: 0x0b, label: 'Lift', group: 'carrying', from: 'kPlayerOam_Tab4[link_state_bits]' },
  { action: 0x0c, label: 'Carry', group: 'carrying', from: 'kPlayerOam_Tab4[link_state_bits]' },
  { action: 0x0d, label: 'Carry, walking', group: 'carrying', from: 'kPlayerOam_Tab4[link_state_bits]' },
  { action: 0x0e, label: 'Set down', group: 'carrying', from: 'link_state_bits path' },
  { action: 0x0f, label: 'Spin attack', group: 'combat', from: 'kPlayerState_SpinAttackMotion / SpinAttacking' },
  { action: 0x10, label: 'Throw', group: 'carrying', from: 'link_picking_throw_state & 1' },
  { action: 0x11, label: 'Swim', group: 'water', from: 'kPlayerState_Swimming' },
  { action: 0x12, label: 'Swim, fast', group: 'water', from: 'link_maybe_swim_faster' },
  { action: 0x13, label: 'Tread water', group: 'water', from: 'link_auxiliary_state == 4' },
  { action: 0x14, label: 'Zapped', group: 'combat', from: 'link_electrocute_on_touch' },
  { action: 0x15, label: 'Cast medallion', group: 'combat', from: 'kPlayerState_Quake / Ether / Bombos' },
  { action: 0x16, label: 'Run or push', group: 'movement', from: 'bitmask_of_dragstate & 0xd' },
  { action: 0x17, label: 'Raise blade', group: 'special', from: 'link_unk_master_sword' },
  { action: 0x18, label: 'Grab wall', group: 'movement', from: 'link_grabbing_wall & 3' },
  { action: 0x19, label: 'Stairs', group: 'movement', from: 'submodule 14, which_staircase_index' },
  { action: 0x1a, label: 'Stairs, other flight', group: 'movement', from: 'submodule 14, which_staircase_index & 4' },
  { action: 0x1b, label: 'Recoil', group: 'hazard', from: 'player_unk1 & 1' },
  { action: 0x1c, label: 'Unnamed 0x1c', group: 'special', from: 'not reached by a named branch' },
  { action: 0x1d, label: 'Hold item aloft', group: 'carrying', from: 'link_pose_for_item != 2' },
  { action: 0x1e, label: 'Hold item aloft, two-handed', group: 'carrying', from: 'link_pose_for_item == 2' },
  { action: 0x1f, label: 'Asleep', group: 'special', from: 'kPlayerState_AsleepInBed' },
  { action: 0x20, label: 'Unnamed 0x20', group: 'special', from: 'kPlayerOam_Tab3[msb(link_position_mode)]' },
  { action: 0x21, label: 'Bunny', group: 'special', from: 'link_is_bunny_mirror' },
  { action: 0x22, label: 'Unnamed 0x22', group: 'special', from: 'kPlayerOam_Tab3[msb(link_position_mode)]' },
  { action: 0x23, label: 'Unnamed 0x23', group: 'special', from: 'kPlayerOam_Tab3[msb(link_position_mode)]' },
  { action: 0x24, label: 'Forced hold', group: 'special', from: 'link_force_hold_sword_up' },
  { action: 0x25, label: 'Unnamed 0x25', group: 'special', from: 'kPlayerOam_Tab3[msb(link_position_mode)]' },
  { action: 0x26, label: 'Unnamed 0x26', group: 'special', from: 'kPlayerOam_Tab4[link_state_bits]' },
  { action: 0x27, label: 'Charge', group: 'combat', from: 'button_b_frames, yt = 0x27' },
];

/**
 * Actions 0x01 and 0x28+ never appear: 0x08 aliases 0x01's frame range in the offset table,
 * and the table stops at 40. Anything the atlas carries but this list omits still renders,
 * labelled by its id.
 */
const labelFor = (action: number): StateLabel =>
  STATE_LABELS.find((s) => s.action === action) ??
  { action, label: `Action 0x${action.toString(16).padStart(2, '0')}`, group: 'special', from: 'unlabelled' };

export { STATE_LABELS, GROUP_LABELS, labelFor };
export type { StateGroup, StateLabel };
