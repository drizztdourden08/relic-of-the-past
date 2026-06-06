/* @layer renderer-components @kind component */
/**
 * DebugStateDisplay — dumps all synced game UI state as formatted text.
 * Purely for verification that the data pipeline works end-to-end.
 */

import { useGameUIStore } from '../../../stores/game-ui-store';

const ITEM_NAMES = [
  'Bow', 'Boomerang', 'Hookshot', 'Bombs', 'Mushroom/Powder',
  'Fire Rod', 'Ice Rod', 'Bombos', 'Ether', 'Quake',
  'Lamp', 'Hammer', 'Flute/Shovel', 'Bug Net', 'Book of Mudora',
  'Bottle Select', 'Cane of Somaria', 'Cane of Byrna', 'Cape', 'Mirror',
];

const BOTTLE_NAMES = ['Empty', 'Mushroom', 'Green Potion', 'Red Potion', 'Blue Potion', 'Fairy', 'Bee', 'Good Bee'];

const formatHearts = (current: number, capacity: number): string => {
  const full = Math.floor(current / 8);
  const partial = current % 8;
  const max = Math.floor(capacity / 8);
  return `${full}${partial > 0 ? `+${partial}/8` : ''}/${max}`;
};

const formatBitmask = (value: number, bits: number): string => {
  return value.toString(2).padStart(bits, '0');
};

const DebugStateDisplay = () => {
  const state = useGameUIStore();

  const { mode, gameMode, hud, inventory, equipment, dungeonProgress, text, map, floorIndicator, saveMenu } = state;

  return (
    <div
      style={{
        position: 'absolute',
        top: 4,
        right: 4,
        background: 'rgba(0, 0, 0, 0.75)',
        color: '#0f0',
        fontFamily: 'monospace',
        fontSize: '9px',
        lineHeight: '12px',
        padding: '4px 6px',
        borderRadius: 3,
        maxHeight: '100%',
        overflowY: 'auto',
        pointerEvents: 'auto',
        userSelect: 'text',
        whiteSpace: 'pre',
      }}
    >
{`── MODE ──
UI Mode: ${mode}
Module: ${gameMode.mainModule} / Sub: ${gameMode.subModule} / SubSub: ${gameMode.subSubModule}

── HUD ──
Hearts: ${formatHearts(hud.healthCurrent, hud.healthCapacity)}
Magic: ${hud.magicPower}/128${hud.halfMagic ? ' (½)' : ''}
Rupees: ${hud.rupees}${hud.rupees !== hud.rupeeTarget ? ` → ${hud.rupeeTarget}` : ''}
Bombs: ${hud.bombs} | Arrows: ${hud.arrows} | Keys: ${hud.keys === 255 ? '—' : hud.keys}
Equipped: Y=${hud.equippedY} X=${hud.equippedX} L=${hud.equippedL} R=${hud.equippedR}
Fillers: ♥${hud.heartsFiller} ★${hud.magicFiller} 💣${hud.bombFiller} →${hud.arrowFiller}

── EQUIPMENT ──
Sword: ${equipment.sword} | Shield: ${equipment.shield} | Armor: ${equipment.armor}
Gloves: ${equipment.gloves} | Boots: ${equipment.boots} | Flippers: ${equipment.flippers} | Pearl: ${equipment.moonPearl}

── INVENTORY ──
${inventory.items.map((v, i) => `${ITEM_NAMES[i]}: ${v}`).filter((_, i) => inventory.items[i] > 0).join('\n')}
Bottles: ${inventory.bottles.map((v) => v > 0 ? (BOTTLE_NAMES[v] ?? `?${v}`) : '—').join(', ')}

── DUNGEON PROGRESS ──
Pendants: ${formatBitmask(dungeonProgress.pendants, 3)}
Crystals: ${formatBitmask(dungeonProgress.crystals, 7)}
Maps: ${formatBitmask(dungeonProgress.maps, 13)}
Compasses: ${formatBitmask(dungeonProgress.compasses, 13)}
Big Keys: ${formatBitmask(dungeonProgress.bigKeys, 13)}

── TEXT ──
Active: ${text.isActive} | Msg#${text.messageId} | Phase: ${text.renderPhase}
Incr: ${text.incrementalState} | Choice: ${text.choice} | Wait: ${text.waitTimer}

── MAP ──
OW State: ${map.overworldMapState} | Dung Floor: ${map.dungeonFloor}
Dung Idx: ${map.dungeonIdx} | Room: 0x${map.roomIndex.toString(16).padStart(3, '0')}
Palace: ${map.palaceIndex >> 1} | Cur Floor: ${map.currentFloor}
Init: ${map.dungeonInitState}

── FLOOR INDICATOR ──
Visible: ${floorIndicator.isVisible} | Timer: ${floorIndicator.timer} | Floor: ${floorIndicator.floor}

── SAVE MENU ──
Cursor: ${saveMenu.cursorPosition} | From Module: ${saveMenu.sourceModule}
Progress: ${saveMenu.progressIndicator}`}
    </div>
  );
};

export { DebugStateDisplay };
