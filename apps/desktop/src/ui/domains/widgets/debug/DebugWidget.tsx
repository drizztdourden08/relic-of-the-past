/* @layer renderer-widgets @kind component */
/**
 * DebugWidgetContent — dumps all synced game UI state as formatted text.
 * Rendered inside the widget frame.
 */

import { useGameUIStore } from '../../../../stores/game-ui-store';
import { useHudSettingsStore } from '../../../../stores/hud-settings-store';

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

const DebugWidgetContent = () => {
  const state = useGameUIStore();
  const hudSettings = useHudSettingsStore();

  const { mode, gameMode, hud, inventory, equipment, dungeonProgress, text, map, floorIndicator, saveMenu } = state;

  const toggleMainPart = () => {
    const parts = [...hudSettings.enhancedParts];
    const hasMain = parts.includes('main');
    const nextParts = hasMain
      ? parts.filter(p => p !== 'main') as ('main' | 'pause')[]
      : [...parts, 'main'] as ('main' | 'pause')[];
    window.dispatchEvent(new CustomEvent('settings:change', { detail: { hudEnhancedParts: nextParts } }));
  };

  const togglePausePart = () => {
    const parts = [...hudSettings.enhancedParts];
    const hasPause = parts.includes('pause');
    const nextParts = hasPause
      ? parts.filter(p => p !== 'pause') as ('main' | 'pause')[]
      : [...parts, 'pause'] as ('main' | 'pause')[];
    window.dispatchEvent(new CustomEvent('settings:change', { detail: { hudEnhancedParts: nextParts } }));
  };

  const btnStyle: React.CSSProperties = {
    background: '#333', color: '#0f0', border: '1px solid #0f0',
    fontSize: '9px', padding: '2px 5px', cursor: 'pointer', fontFamily: 'monospace',
  };

  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.75)',
        color: '#0f0',
        fontFamily: 'monospace',
        fontSize: '9px',
        lineHeight: '12px',
        padding: '4px 6px',
        height: '100%',
        overflowY: 'auto',
        userSelect: 'text',
        whiteSpace: 'pre',
      }}
    >
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px', whiteSpace: 'normal' }}>
        <button style={btnStyle} onClick={toggleMainPart}>
          Main: {hudSettings.enhancedParts.includes('main') ? 'enhanced' : 'original'}
        </button>
        <button style={btnStyle} onClick={togglePausePart}>
          Pause: {hudSettings.enhancedParts.includes('pause') ? 'enhanced' : 'original'}
        </button>
      </div>
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

export { DebugWidgetContent };
