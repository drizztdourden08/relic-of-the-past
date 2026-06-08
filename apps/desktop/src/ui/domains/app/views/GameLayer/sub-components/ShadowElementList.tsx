/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { useShadowEditorStore } from '../../../../../../stores/shadow-editor-store';
import { wasmGetViewportInfo } from '../../../../../../lib/game';
import './ShadowElementList.css';

const ShadowElementList = () => {
  const {
    open,
    selectedElementId,
    setSelectedElement,
    getScreenData,
    heightLevels,
  } = useShadowEditorStore();

  const getCurrentScreenId = useCallback((): number => {
    const vp = wasmGetViewportInfo();
    if (!vp) return 0;
    const col = Math.floor((vp.cameraX + 128) / 512) & 7;
    const row = Math.floor((vp.cameraY + 112) / 512) & 7;
    return row * 8 + col;
  }, []);

  if (!open) return null;

  const screenId = getCurrentScreenId();
  const screenData = getScreenData(screenId);

  // Group shapes by their height level
  const getHeightLabel = (h: number): string => {
    const match = heightLevels.find((l) => Math.abs(l.value - h) < 0.005);
    return match ? match.label : `H${Math.round(h * 100)}%`;
  };

  const getShapeIcon = (type: string, sides?: number): string => {
    if (type === 'freehand') return '✏';
    switch (sides) {
      case 3: return '△';
      case 4: return '◻';
      case 5: return '⬠';
      case 6: return '⬡';
      default: return sides && sides >= 8 ? '◯' : '⬡';
    }
  };

  return (
    <Box className="shadow-element-list">
      {/* Shapes */}
      {screenData.heightmap.length > 0 && (
        <Box className="shadow-element-list__group">
          <Box className="shadow-element-list__group-header">
            <Text className="shadow-element-list__group-icon">⬡</Text>
            <Text>Shapes</Text>
            <Text className="shadow-element-list__count">{screenData.heightmap.length}</Text>
          </Box>
          <Box className="shadow-element-list__items">
            {screenData.heightmap.map((el) => (
              <Box
                as="button"
                key={el.id}
                className={`shadow-element-list__item${el.id === selectedElementId ? ' shadow-element-list__item--active' : ''}`}
                onClick={() => setSelectedElement(el.id, 'heightmap')}
              >
                <Text className="shadow-element-list__item-icon">
                  {getShapeIcon(el.shape.type, el.shape.sides)}
                </Text>
                <Text className="shadow-element-list__item-name">
                  {el.shape.type === 'freehand' ? 'Freehand' : `${el.shape.sides ?? 4}-gon`}
                </Text>
                <Text className="shadow-element-list__item-tag">
                  {getHeightLabel(el.height)}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Lights */}
      {screenData.lights.length > 0 && (
        <Box className="shadow-element-list__group">
          <Box className="shadow-element-list__group-header">
            <Text className="shadow-element-list__group-icon">💡</Text>
            <Text>Lights</Text>
            <Text className="shadow-element-list__count">{screenData.lights.length}</Text>
          </Box>
          <Box className="shadow-element-list__items">
            {screenData.lights.map((light) => (
              <Box
                as="button"
                key={light.id}
                className={`shadow-element-list__item${light.id === selectedElementId ? ' shadow-element-list__item--active' : ''}`}
                onClick={() => setSelectedElement(light.id, 'light')}
              >
                <Text className="shadow-element-list__item-icon">
                  {light.type === 'point' ? '💡' : '🔦'}
                </Text>
                <Text className="shadow-element-list__item-name">
                  {light.type === 'point' ? 'Point' : 'Area'} Light
                </Text>
                <Text className="shadow-element-list__item-tag">
                  r{light.radius}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {screenData.heightmap.length === 0 && screenData.lights.length === 0 && (
        <Box className="shadow-element-list__empty">
          No elements on this screen
        </Box>
      )}
    </Box>
  );
};

export { ShadowElementList };
