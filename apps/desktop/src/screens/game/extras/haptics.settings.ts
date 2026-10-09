/* @layer renderer-app @kind config */
import type { ScreenMeta, Section } from '@drizztdourden08/brock-react';

const meta: ScreenMeta = { title: 'Haptics', icon: 'vibrate', order: 2, keywords: ['haptics', 'rumble', 'vibration', 'controller'] };

const sections: Section[] = [
  {
    id: 'haptics-general',
    title: 'Vibration',
    items: [
      { key: 'haptics.enabled', label: 'Enable Haptic Feedback', description: 'Enable controller vibration/rumble for game events. Requires a compatible controller (Xbox, Switch Pro, DualSense).', hint: 'On, the controller rumbles for the events switched on below.', keywords: 'vibration rumble haptic feedback controller' },
      { key: 'haptics.intensity', label: 'Vibration Intensity', description: 'Global intensity multiplier for all haptic feedback', hint: 'Drag to make every rumble stronger or weaker.', keywords: 'vibration intensity strength level' },
    ],
  },
  {
    id: 'haptics-combat',
    title: 'Combat',
    items: [
      { key: 'haptics.swordSwing', label: 'Sword Swing', description: 'Very faint vibration when the player swings the sword', hint: 'On, each sword swing gives a faint rumble.', keywords: 'sword swing slash attack' },
      { key: 'haptics.swordHitEnemy', label: 'Sword Hit Enemy', description: 'Normal vibration when the sword connects with an enemy', hint: 'On, landing a sword hit rumbles.', keywords: 'sword hit enemy damage' },
      { key: 'haptics.swordClink', label: 'Sword Clink', description: 'Faint vibration when the sword clinks against an invulnerable surface or shield', hint: 'On, the sword bouncing off a wall or shield rumbles.', keywords: 'sword clink deflect shield bounce' },
      { key: 'haptics.damageTaken', label: 'Damage Taken', description: 'Vibration scaled to damage amount when the player gets hurt (stronger for more damage)', hint: 'On, getting hurt rumbles, harder for bigger hits.', keywords: 'damage hurt health hearts' },
    ],
  },
  {
    id: 'haptics-actions',
    title: 'Items and Movement',
    items: [
      { key: 'haptics.itemUse', label: 'Item Use', description: 'Vibration when using items (hammer, hookshot, bombs, medallions, rods, etc.)', hint: 'On, using an item rumbles.', keywords: 'item use bomb hookshot hammer rod medallion' },
      { key: 'haptics.dashVibration', label: 'Dash Vibration', description: 'Rhythmic step vibration while running with the Pegasus Boots', hint: 'On, a Pegasus Boots dash rumbles with each step.', keywords: 'dash run boots pegasus step rhythm' },
      { key: 'haptics.environmentalEffects', label: 'Environmental Effects', description: 'Vibration for world events: falling into pits, landing from ledges, entering water, mirror warp, chest opens, bomb explosions', hint: 'On, falls, landings, warps, chests and explosions rumble.', keywords: 'environment fall pit ledge water mirror chest' },
    ],
  },
];

export default sections;
export { meta };
