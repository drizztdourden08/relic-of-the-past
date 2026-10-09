/* @layer renderer-components @kind component */
import { Box, Button, Text } from '@drizztdourden08/tessera/primitives';
import { useShadowEditorStore } from '../../../../../../stores/shadow-editor-store';
import { wasmGetViewportInfo } from '../../../../../../lib/game';
import { overworldScreenIdOf } from '../behavior/overworld-screen-id';
import './ShadowElementList.css';

const ShadowElementList = () => {
  const {
    open,
    selectedElementId,
    setSelectedElement,
    getScreenData,
    heightLevels,
  } = useShadowEditorStore();

  if (!open) return null;

  const vp = wasmGetViewportInfo();
  const screenId = vp ? overworldScreenIdOf(vp) : 0;
  const screenData = getScreenData(screenId);

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
      {screenData.heightmap.length > 0 && (
        <Box className="shadow-element-list__group">
          <Box className="shadow-element-list__group-header">
            <Text className="shadow-element-list__group-icon">⬡</Text>
            <Text>Shapes</Text>
            <Text className="shadow-element-list__count">{screenData.heightmap.length}</Text>
          </Box>
          <Box className="shadow-element-list__items">
            {screenData.heightmap.map((el) => (
              <Button
                variant="bare"
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
              </Button>
            ))}
          </Box>
        </Box>
      )}

      {screenData.lights.length > 0 && (
        <Box className="shadow-element-list__group">
          <Box className="shadow-element-list__group-header">
            <Text className="shadow-element-list__group-icon">💡</Text>
            <Text>Lights</Text>
            <Text className="shadow-element-list__count">{screenData.lights.length}</Text>
          </Box>
          <Box className="shadow-element-list__items">
            {screenData.lights.map((light) => (
              <Button
                variant="bare"
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
              </Button>
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
