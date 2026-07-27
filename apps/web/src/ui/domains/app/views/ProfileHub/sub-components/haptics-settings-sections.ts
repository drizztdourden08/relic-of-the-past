/* @layer renderer-components @kind data */
/** Section/subsection config for the Haptics settings tab. Keys use a dotted `haptics.*`
 *  path (they live under settings.haptics, not top-level), unlike every other tab. */
import type { Section } from '../../../compounds/SettingsLayout';

const SECTIONS: Section[] = [
  {
    id: 'haptics-general',
    title: 'General',
    subsections: [
      {
        id: 'haptics-enable',
        title: 'Vibration',
        items: [
          { key: 'haptics.enabled', label: 'Enable Haptic Feedback', description: 'Enable controller vibration/rumble for game events. Requires a compatible controller (Xbox, Switch Pro, DualSense).', keywords: 'vibration rumble haptic feedback controller' },
          { key: 'haptics.intensity', label: 'Vibration Intensity', description: 'Global intensity multiplier for all haptic feedback', keywords: 'vibration intensity strength level' },
        ],
      },
    ],
  },
  {
    id: 'haptics-combat',
    title: 'Combat',
    subsections: [
      {
        id: 'haptics-combat-options',
        title: 'Sword & Damage',
        items: [
          { key: 'haptics.swordSwing', label: 'Sword Swing', description: 'Very faint vibration when the player swings the sword', keywords: 'sword swing slash attack' },
          { key: 'haptics.swordHitEnemy', label: 'Sword Hit Enemy', description: 'Normal vibration when the sword connects with an enemy', keywords: 'sword hit enemy damage' },
          { key: 'haptics.swordClink', label: 'Sword Clink', description: 'Faint vibration when the sword clinks against an invulnerable surface or shield', keywords: 'sword clink deflect shield bounce' },
          { key: 'haptics.damageTaken', label: 'Damage Taken', description: 'Vibration scaled to damage amount when the player gets hurt (stronger for more damage)', keywords: 'damage hurt health hearts' },
        ],
      },
    ],
  },
  {
    id: 'haptics-actions',
    title: 'Actions',
    subsections: [
      {
        id: 'haptics-action-options',
        title: 'Items & Movement',
        items: [
          { key: 'haptics.itemUse', label: 'Item Use', description: 'Vibration when using items (hammer, hookshot, bombs, medallions, rods, etc.)', keywords: 'item use bomb hookshot hammer rod medallion' },
          { key: 'haptics.dashVibration', label: 'Dash Vibration', description: 'Rhythmic step vibration while running with the Pegasus Boots', keywords: 'dash run boots pegasus step rhythm' },
          { key: 'haptics.environmentalEffects', label: 'Environmental Effects', description: 'Vibration for world events: falling into pits, landing from ledges, entering water, mirror warp, chest opens, bomb explosions', keywords: 'environment fall pit ledge water mirror chest' },
        ],
      },
    ],
  },
];

export { SECTIONS };
